import mongoose, { Schema } from "mongoose"
import { ICampaign } from "../interfaces/campaignInterface.js"

const campaignSchema = new Schema<ICampaign>(
    {
        title: { type:String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ["medical", "education", "emergency", "animals", "community", "general"],
            default: "general"
        },
        goalAmount: { type: Number, required: true },
        currentAmount: { type: Number, default: 0 },
        image: [String],
        creator: { type: String, required: true },
        receiveWalletAddress: { type: String, required: true },
        status: { type: String, enum: ['active', 'completed', 'cancelled', 'approved', 'rejected', 'pending'], default: 'pending' },
        endDate: { type: Date, required: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
)

export default mongoose.model<ICampaign>("Campaign", campaignSchema)