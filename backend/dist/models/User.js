import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    walletAddress: { type: String },
    role: { type: String, default: "user" },
}, {
    timestamps: true,
});
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=User.js.map