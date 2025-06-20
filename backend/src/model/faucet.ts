import mongoose from "mongoose";

const FaucetSchema = new mongoose.Schema({
    label: { type: String, required: true, default: 'NumberOfHit' },
    numberOfHit: { type: Number, required: true, unique: true },
    lastHitDate: { type: Date },
});

const FaucetModel = mongoose.model("faucet", FaucetSchema);

module.exports = FaucetModel;