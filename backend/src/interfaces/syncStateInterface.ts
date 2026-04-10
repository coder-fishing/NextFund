import { Document } from "mongoose";

export interface ISyncState extends Document {
  key: string;
  lastSyncedBlock: number;
  updatedAt: Date;
  createdAt: Date;
}
