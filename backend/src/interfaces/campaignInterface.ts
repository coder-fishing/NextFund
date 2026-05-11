import { Document } from "mongoose";

export interface ICampaign extends Document {
    title: string,
    description: string,

    category: string,

    goalAmount: number,
    currentAmount: number,

    image?: string[],

    creator: string,
    receiveWalletAddress: string,

    status: string, // active | completed | cancelled | approved | rejected | pending | manual
    aiPrediction?: string,
    aiTrustScore?: number,
    aiReasons?: string[],
    endDate: Date,
    deletedAt?: Date | null,

    createdAt: Date,
    updatedAt: Date
}