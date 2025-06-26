import mongoose, { Schema, Document } from "mongoose";
import { IPlan } from "../types/index";
import { features } from "process";

const PlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  planCode: { type: String, required: false, unique: true, sparse: true },
  interval: { type: String, enum: ["monthly"], required: true },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Plan = mongoose.model<IPlan>("Plan", PlanSchema);
