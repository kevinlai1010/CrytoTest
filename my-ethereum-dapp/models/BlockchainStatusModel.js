var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BlockchainStatusSchema = new Schema(
  {
    id: { type: Number, required: true },
    syncno: { type: Number },
    syncno20: { type: Number, default: 20000000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockchainStatus", BlockchainStatusSchema);
