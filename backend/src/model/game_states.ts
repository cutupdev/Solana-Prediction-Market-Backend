import mongoose from "mongoose";

const gameStateSchema = new mongoose.Schema(
  {
    name: String,
    numberOfSpin: { type: Number, default: 0},
    numberOfJackpot: { type: Number, default: 0 },
    awardedAmount: { type: Number, default: 0 }, 
    longestSpin: { type: Number, default: 1 },
    currentSpin: { type: Number, detault: 8 } 
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

export const gameStateModel = mongoose.model("gameStatePool", gameStateSchema);
