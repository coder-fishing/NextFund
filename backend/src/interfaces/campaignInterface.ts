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

    status: string, // active | completed | cancelled | approved | rejected | pending
    endDate: Date,

    createdAt: Date,
    updatedAt: Date
}