import mongoose from "mongoose";

const FaucetUserSchema = new mongoose.Schema({
  discordId: { type: String, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  lastHit: { type: Date },
  lastAmount: { type: Number },
  process: { type: String },
});

export const faucetUserModel = mongoose.model("faucetUser", FaucetUserSchema);
