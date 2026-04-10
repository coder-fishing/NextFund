import mongoose, { Schema } from "mongoose";
import { IDonation } from "../interfaces/donationInterface.js";

const donationSchema = new Schema<IDonation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
        },
        campaignIdOnChain: {
            type: String,
            required: false,
        },
        walletAddress: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        amountWei: {
            type: String,
            required: true,
        },
        amountEth: {
            type: String,
            required: true,
        },
        txHash: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        blockNumber: {
            type: Number,
            required: false,
        },
        logIndex: {
            type: Number,
            required: false,
        },

    },
    { timestamps: true,}
)

donationSchema.index({ txHash: 1, logIndex: 1 }, { unique: true });

export default mongoose.model<IDonation>("Donation", donationSchema);