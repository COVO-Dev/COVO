import mongoose, { Schema, Document } from "mongoose";
import { IInvitation } from "../types"; // You would need to define IInvitation in your types

const InvitationSchema: Schema = new Schema<IInvitation>(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Influencer",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    offer: { type: Schema.Types.Mixed }, // This can be an object with offer details
    appliedAt: { type: Date, default: Date.now },
    // Optional message field for additional context
    message: { type: String },
  },
  { timestamps: true }
);

// Add indexes for efficient querying
InvitationSchema.index({ influencerId: 1, status: 1 });
InvitationSchema.index({ campaignId: 1, status: 1 });
InvitationSchema.index({ brandId: 1, status: 1 });
InvitationSchema.index({ receiver: 1, status: 1 });

// Ensure an influencer can only be invited to a campaign once
InvitationSchema.index({ campaignId: 1, influencerId: 1 }, { unique: true });

export const Invitation = mongoose.model<IInvitation>(
  "Invitation",
  InvitationSchema
);
