import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/userInterface.js";

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        avatar: { type: String },
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
        walletAddress: { type: String },
        role: { type: String, default: "user" },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;