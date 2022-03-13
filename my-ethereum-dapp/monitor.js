require("dotenv").config();
const Web3 = require('web3');
const AWSHttpProvider = require('@aws/web3-http-provider');
var mongoose = require("mongoose");
var async = require("async");

// Models
const BlockchainStatus = require("./models/BlockchainStatusModel");
const Block = require("./models/BlockModel");
const WalletAddress = require("./models/WalletAddress")

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
                            // ... code snipet for collecting Transaction Data from DB by WalletAddress
                            // var = transactions[]                            
                        },     
                        function MakeMessage(addresses, transactions, callback) {
                            // ... code snipet for collecting Transaction Data from DB by WalletAddress
                            // var = transactions[]       
                            for (let index = 0; index < addresses.length; index++) {                                
                                if(transactions[i].length > 0){
                                    // ... embed msg into messageBody
                                }
                            }
                            
                            if (messageBody.length > 0){
                                // ... code snipet for notification to Discord/Slack/Telegram through aws chatbot
                            }
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
