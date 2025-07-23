import { Schema, model, Types, Document } from 'mongoose';

interface ICampaignPerformance extends Document {
  campaignId: Types.ObjectId;
  influencerId: Types.ObjectId;
  postUrl: string;
  platform: string;
  postId: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    retweets?: number;
    replies?: number;
    impressions?: number;
    engagement?: number;
  };
  startFollowers: number;
  endFollowers: number;
  conversions: number;
  contentQualityScore: number;
  submittedAt?: Date;
  lastUpdated?: Date;
}

const CampaignPerformanceSchema = new Schema<ICampaignPerformance>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
    postUrl: { type: String, required: true },
    platform: { type: String, required: true },
    postId: { type: String, required: true },
    metrics: {
      views: Number,
      likes: Number,
      comments: Number,
      shares: Number,
      retweets: Number,
      replies: Number,
      impressions: Number,
      engagement: Number,
    },
    startFollowers: { type: Number, default: 0 },
    endFollowers: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    contentQualityScore: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

export const CampaignPerformances = model<ICampaignPerformance>('CampaignPerformance', CampaignPerformanceSchema);
