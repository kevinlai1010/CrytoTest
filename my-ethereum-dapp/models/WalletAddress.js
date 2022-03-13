var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BlockchainStatusSchema = new Schema(
  {
    id: { type: Number, required: true },
    address: { type: String },
    balance: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletAddress", BlockchainStatusSchema);
