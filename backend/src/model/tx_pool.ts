import mongoose from "mongoose";

const txPoolSchema = new mongoose.Schema(
  {
    tx: String,
    sender: String,
    receiver: String,
    amount: Number
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

export const txModel = mongoose.model("txPool", txPoolSchema);