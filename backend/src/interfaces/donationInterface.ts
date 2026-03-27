import { Types, Document } from "mongoose";

export interface IDonation extends Document {
    userId: Types.ObjectId;
    campaignId: Types.ObjectId;
    walletAddress: string;
    amount: number;
    txHash: string;
    createdAt: Date;
    updatedAt: Date;
}