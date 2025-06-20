import mongoose from "mongoose";
import { withdrawAble } from "../db";

const userPoolSchema = new mongoose.Schema(
  {
    user_name: String,
    address: {type: String, require: true, unique: true},
    amount: Number,
    withdrawAble: { type: String }
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

export const userModel = mongoose.model("userPool", userPoolSchema);