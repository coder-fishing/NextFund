import { Document, Types } from "mongoose";

export interface IWallet extends Document {
  userId: Types.ObjectId
  address: string
  isPrimary: boolean

  createdAt: Date
  updatedAt: Date
}