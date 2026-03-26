import mongoose, { Schema } from "mongoose";
const campaignSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    image: [String],
    creator: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled', 'approved', 'rejected', 'pending'], default: 'pending' },
    endDate: { type: Date, required: true },
}, { timestamps: true });
export default mongoose.model("Campaign", campaignSchema);
//# sourceMappingURL=Campaign.js.map