import mongoose, { Schema } from 'mongoose';
import { IDeactivation } from '../types';



const DeactivationSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deactivationReason: { type: String, required: true },
    deactivatedAt: { type: Date, default: Date.now },
    userData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Deactivation = mongoose.model<IDeactivation>("Deactivation", DeactivationSchema);

export { Deactivation };
