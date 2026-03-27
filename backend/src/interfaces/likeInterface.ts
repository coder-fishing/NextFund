import { Types, Document } from "mongoose";

export interface ILike extends Document {
    userId: Types.ObjectId;
    campaignId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}