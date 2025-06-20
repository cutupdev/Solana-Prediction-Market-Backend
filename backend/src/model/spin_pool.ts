import mongoose from "mongoose";

const spinPoolSchema = new mongoose.Schema(
  {
    start_timestamp: Number,
    result: Number,
    entrants: Number,
    total_wager: Number,
    state: Number,
    players: Array({
      address: String,
      amount: Number,
      hasNFT: { type: Boolean, default: false }
    }),
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

export const spinModel = mongoose.model("spinPool", spinPoolSchema);