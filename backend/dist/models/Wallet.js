import mongoose, { Schema } from "mongoose";
const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    address: {
        type: String,
        required: true,
        unique: true // 🔥 1 ví chỉ 1 account
    },
    isPrimary: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
export default mongoose.model("Wallet", walletSchema);
//# sourceMappingURL=Wallet.js.map