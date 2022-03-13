require("dotenv").config();
const Web3 = require('web3');
const AWSHttpProvider = require('@aws/web3-http-provider');
var async = require("async");
var fs = require("fs");
var mongoose = require("mongoose");
const { performance } = require("perf_hooks");

var config = require("../config/mongodb.json");
var { ProcessTransactions, SaveTransaction } = require("./transactions");

// Models
const BlockchainStatus = require("../models/BlockchainStatusModel.js");
const Block = require("../models/BlockModel.js");

const { constants } = require("../config/constants");

const endpoint = process.env.AMB_HTTP_ENDPOINT;
const web3 = new Web3(new AWSHttpProvider(endpoint));

web3.eth.getNodeInfo().then(console.log);

var date = new Date();
var logStream;

logStream = fs.createWriteStream(
  "log" +
  "_" +
  date.getFullYear().toString() +
  "_" +
  (date.getMonth() + 1).toString() +
  "_" +
  date.getDate().toString() +
  ".log",
  { flags: "a" }
);

var mongoDB =
  "mongodb://" +
  process.env.MONGODB_URL +
  ":" +
  process.env.MONGODB_PORT +
  "/" +
  process.env.MONGODB_DATABASE;

mongoose
  .connect(mongoDB, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to %s", mongoDB);
    console.log("App is running ... \n");
    console.log("Press CTRL + C to stop the process. \n");
    BlockchainStatus.findOne({ id: "1" }).then((data) => {
      if (!data) {
        let blockChainStatus = new BlockchainStatus({
          id: 1,
          syncno: 0,
          epoch_syncno: 0,
        });
        blockChainStatus.save((data) => {
          console.log("BlockchainStatus table was initialized");
        });
      }
    });

    async.forever(
      function (StartSync) {
        const t0 = performance.now();

        async.waterfall(
          [
            function Init(callback) {
              BlockchainStatus.findOne({ id: 1 })
                .then((data) => {
                  if (data) {
                    console.log("Sync block number -> " + (data.syncno20 + 1));
                    callback(null, data.syncno20 + 1);
                  } else {
                    callback(null, 0);
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function GetBlockNumber(syncNo, callback) {
              web3.eth
                .getBlockNumber()
                .then((blockNumber) => {
                  if (syncNo <= blockNumber) {
                    callback(null, syncNo);
                  } else {
                    StartSync();
                  }
                })
                .catch((err) => {
                  console.log(err);
                  callback(err);
                });
            },
            function GetBlock(syncNo, callback) {
              web3.eth
                .getBlock(syncNo)
                .then((block) => {
                  Block.updateOne(
                    { number: block.number },
                    block,
                    { upsert: true, setDefaultsOnInsert: true },
                    function (err) {
                      if (err) {
                        callback(err);
                      }
                      callback(null, syncNo, block);
                    }
                  );
                })
                .catch((err) => { });
            },
            function GetTransaction(syncNo, block, callback) {
              ProcessTransactions(
                web3,
                block.transactions,
                block.timestamp,
                logStream,
                syncNo
              )
                .then((txs) => {
                  //console.log(txs);
                  callback(null, syncNo, txs);
                })
                .catch((err) => {
                  console.log(err);
                  callback(err);
                });
            },
            function AddTxsOnDB(syncNo, txs, callback) {
              SaveTransaction(txs, logStream)
                .then((data) => {
                  if (data) {
                    callback(null, syncNo);
                  } else {
                    console.log("Couldn't save the transaction on MongoDB");
                    callback(
                      new Error("Could not save the transaction on MongoDB")
                    );
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function FinishProcessingBlock(syncNo, callback) {
              BlockchainStatus.updateOne(
                { id: 1 },
                { syncno20: syncNo },
                { upsert: true, setDefaultsOnInsert: true },
                function (err) {
                  if (err) {
                    callback(err);
                  }
                  callback(null);
                }
              );
              var t1 = performance.now();
              console.log("here is milisecondes", t1 - t0);
            },
          ],
          function (err) {
            if (err) {
            } else {
              StartSync();
            }
          }
        );
      },
      function (error) {
        logStream.write(new Date().toString() + "\t" + error + "\n");
        console.log(error);
      }
    );
  })
  .catch((err) => {
    console.log("MongoDB connection ERROR!");
  });
