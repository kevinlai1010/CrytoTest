var ethers = require("ethers");

const PendingTransaction = require("../models/PendingTransactionModel");
const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Token = require("../models/TokenModel");

const TokenType = require("../config/tokentype.json");
const { ProcessAddress, ProcessExternalAccounts } = require("./address");

const SaveTransaction = async function (txs, logStream) {
  // ... Code for saving txs into MongoDB
  return true;
};

const ProcessTransactions = async function (
  web3,
  txs,
  timestamp,
  logStream,
  blockNumber
) {
  var txInfos = [];
  var txInfo, txReceipt, tokenDetail, tx;
  var getTxInfoAndReceiptPromises = [];
  var txsLength = txs.length;
  var blockReward = 0;

  console.log("blockNumber in Process Txns: ", blockNumber);
  console.log("Transaction count in block is: " + txsLength.toString());

  for (var i = 0; i < txsLength; i++) {
    try {
      getTxInfoAndReceiptPromises.push(web3.eth.getTransaction(txs[i]));
      getTxInfoAndReceiptPromises.push(web3.eth.getTransactionReceipt(txs[i]));
    } catch (err) {
      console.log(err);
    }
  }

  const txPromises = await Promise.all(getTxInfoAndReceiptPromises);
  for (let i = 0; i < txsLength; i++) {
    txInfo = txPromises[2 * i];
    txReceipt = txPromises[2 * i + 1];
    if (txReceipt === null || txReceipt === undefined || txReceipt === {}) {
      tx = { ...txInfo, status: false, timestamp: timestamp };
    } else {
      tx = { ...txInfo, ...txReceipt, timestamp: timestamp };
      //calcuate blockreward
      if (tx.gasUsed) {
        reward = tx.gasUsed * parseInt(tx.gasPrice);
      } else {
        reward = tx.gas * parseInt(tx.gasPrice);
      }
      blockReward += reward;
    }

    // ...

  }

  Block.updateOne(
    { number: blockNumber },
    { blockReward: blockReward },
    { upsert: true, setDefaultsOnInsert: true },
    function (err) {
      if (err) {
        console.log(err);
      } else {
      }
    }
  );
  return txInfos;
};

module.exports = { ProcessTransactions, SaveTransaction };
