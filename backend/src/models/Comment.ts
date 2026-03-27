import mongoose, { Schema } from "mongoose";
import { IConmment } from "../interfaces/commentInterface.js";

const commentSchema = new Schema<IConmment>(
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
        content: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model<IConmment>("Comment", commentSchema);