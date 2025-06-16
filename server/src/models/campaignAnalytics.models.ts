import mongoose, { Schema, Document } from 'mongoose';

const CampaignPerformance: Schema = new Schema(
  {
    campaignId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Campaign', 
      required: true 
    },
    influencerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Influencer', 
      required: true 
    },
    startFollowers: { type: Number, required: true },
    endFollowers: { type: Number, required: true },
    totalEngagements: { type: Number, required: true },
    conversions: { type: Number, required: true },
    reach: { type: Number, required: true },
    impressions: { type: Number, required: true },
    contentQualityScore: { type: Number, required: true },
  },
  { timestamps: true }
);

export const CampaignPerformances = mongoose.model<Document>("CampaignPerformance", CampaignPerformance);

