import mongoose, { Schema, Document } from 'mongoose';

interface ICampaignPerformance extends Document {
  campaignId: mongoose.Types.ObjectId;
  influencerId: mongoose.Types.ObjectId;
  platform: string;
  postId: string;
  postUrl: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
    engagement?: number;
    [key: string]: any;
  };
  startFollowers: number;
  endFollowers: number;
  totalEngagements: number;
  conversions: number;
  reach: number;
  impressions: number;
  contentQualityScore: number;
  submittedAt: Date;
  lastUpdated: Date;
}

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
    platform: { type: String, required: true },
    postId: { type: String, required: true },
    postUrl: { type: String, required: true },
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 }
    },
    startFollowers: { type: Number, default: 0 },
    endFollowers: { type: Number, default: 0 },
    totalEngagements: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    contentQualityScore: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const CampaignPerformances = mongoose.model<ICampaignPerformance>("CampaignPerformance", CampaignPerformance);

