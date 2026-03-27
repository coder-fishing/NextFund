import mongoose, { Schema } from "mongoose";
import { ILike } from "../interfaces/likeInterface.js";

const likeSchema = new Schema<ILike>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        campaignId: { 
            type: Schema.Types.ObjectId, 
            ref: "Campaign", 
            required: true 
        },
    },
    { timestamps: true }
);
// Ensure a user can only like a campaign once
likeSchema.index({ userId: 1, campaignId: 1 }, { unique: true }); 

export default mongoose.model<ILike>("Like", likeSchema);