import mongoose, { Schema } from "mongoose";
import { IMilestone } from "../types";


const MilestoneSchema = new Schema<IMilestone>({
    description: { type: String, required: true },
    influencerChecked: { type: Boolean, default: false },
    brandChecked: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    influencerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Influencer",
        required: true,
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
}, { timestamps: true });

export const Milestone = mongoose.model<IMilestone>("Milestone", MilestoneSchema);