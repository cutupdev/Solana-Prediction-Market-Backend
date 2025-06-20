import mongoose from "mongoose";

const jackpotPoolSchema = new mongoose.Schema(
  {
    name: String,
    amount: { type: Number, required: true },
    tokenAddress: { type: String, default: 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo' },
    symbol: { type: String, default: 'TOKE' }, 
    decimal: { type: Number, default: 3 }, 
    standard: { type: String, default: 'normal' },
    imageUri: { type: String, default: 'https://gateway.irys.xyz/QcppOvUHIMIzMOohBoe3wOm60qCogABYiYstUtLgPF8' }
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

export const jackpotModel = mongoose.model("jackpotPool", jackpotPoolSchema);