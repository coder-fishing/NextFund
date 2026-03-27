import mongoose, { Schema } from "mongoose";
import { IDonation } from "../interfaces/donationInterface.js";

const donationSchema = new Schema<IDonation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
        },
        walletAddress: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        txHash: {
            type: String,
            required: true,
        },

    },
    { timestamps: true,}
)

export default mongoose.model<IDonation>("Donation", donationSchema);