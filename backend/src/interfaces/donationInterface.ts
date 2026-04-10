import { Types, Document } from "mongoose";

export interface IDonation extends Document {
    userId?: Types.ObjectId;
    campaignId: Types.ObjectId;
    campaignIdOnChain?: string;
    walletAddress: string;
    amountWei: string;
    amountEth: string;
    txHash: string;
    blockNumber?: number;
    logIndex?: number;
    createdAt: Date;
    updatedAt: Date;
}