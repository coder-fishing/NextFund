import { Document } from "mongoose";

export interface IUser extends Document {
  email: string
  name: string
  avatar?: string

  provider: string
  providerId: string

  walletAddress?: string

  role: string

  createdAt: Date
  updatedAt: Date
}