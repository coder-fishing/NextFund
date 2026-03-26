import mongoose, { Schema } from "mongoose";
import { IWallet } from "../interfaces/walletInterface.js";

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    address: {
      type: String,
      required: true,
      unique: true   // 🔥 1 ví chỉ 1 account
    },

    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", walletSchema);