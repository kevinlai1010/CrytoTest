require("dotenv").config();
const Web3 = require('web3');
const AWSHttpProvider = require('@aws/web3-http-provider');
var mongoose = require("mongoose");
var async = require("async");

// Models
const BlockchainStatus = require("./models/BlockchainStatusModel");
const Block = require("./models/BlockModel");
const Transaction = require("./models/TransactionModel");
const WalletAddress = require("./models/WalletAddress")

// web3 configuration
const endpoint = process.env.AMB_HTTP_ENDPOINT;
const web3 = new Web3(new AWSHttpProvider(endpoint));

var mongoDB =
    "mongodb://" +
    process.env.MONGODB_URL +
    ":" +
    process.env.MONGODB_PORT +
    "/" +
    process.env.MONGODB_DATABASE;

var messageBody = '';
var balances = [];


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

        async.forever(
            function (StartSync) {
                async.waterfall(
                    [
                        function GetWalletAddresses(callback) {
                            WalletAddress.find()
                                .then((addresses) => {
                                    if (addresses) {
                                        callback(null, addresses);
                                    } else {
                                        callback(null, null);
                                    }
                                })
                                .catch((err) => {
                                    callback(err);
                                });
                        },
                        function GetTransactionsByWalletAddress(addresses, callback) {
                            // ... skip code for collecting Transaction Data from DB by WalletAddress
                            // transactions 
                            callback(null, addresses, transactions);
                        },
                        function GetFilteredWalletAddresses(addresses, transactions, callback) {
                            var filteredWalletAddresses = addresses.filter((address) => {
                                let filteredTransaction = transactions.filter((transaction) => {
                                    transaction.from == address
                                })
                            })
                            callback(filteredWalletAddresses, callback);
                        },
                        function GetBalances(filteredWalletAddresses, callback) {
                            var balances = [];
                            for (let index = 0; index < filteredWalletAddresses.length; index++) {
                                let balance = web3.fromWei(web3.eth.getBalance(filteredWalletAddresses[i]), "ether").toNumber();
                                if(balance <= 5) {
                                    messageBody += "Something to Notify for " + filteredWalletAddresses[i].toString();
                                }
                            }
                            callback(null, messageBody, callback);
                        },
                        function MakeMessage(addresses, transactions, callback) {
                            // ... skip code for sending notification.                         
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
