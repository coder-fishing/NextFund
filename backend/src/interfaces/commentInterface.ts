import { Types, Document } from "mongoose";

export interface IConmment extends Document {
    userId: Types.ObjectId;
    campaignId: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}