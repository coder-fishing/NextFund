import mongoose, { Schema } from "mongoose";
import { ISyncState } from "../interfaces/syncStateInterface.js";

const syncStateSchema = new Schema<ISyncState>(
  {
    key: { type: String, required: true, unique: true, index: true },
    lastSyncedBlock: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISyncState>("SyncState", syncStateSchema);
