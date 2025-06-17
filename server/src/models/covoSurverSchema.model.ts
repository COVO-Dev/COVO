import mongoose from 'mongoose';
import { ICovoSurvey } from '../types';

const covoSurveySchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Campaign' },
  influencerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Influencer' },
  brandId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Brand' },
  type: { type: String, enum: ['creator_feedback', 'brand_feedback'], required: true },
  reviews: String,

  // Ratings filled by the brand about the creator
  engagementPerception: Number,
  deliveryConsistency: Number,
  brandFeedback: Number,
  audienceFit: Number,

  // Ratings filled by the creator about the brand
  communication: Number,
  paymentTimeliness: Number,
  respect: Number,
}, { timestamps: true });

covoSurveySchema.index({ campaignId: 1, influencerId: 1, brandId: 1, type: 1 }, { unique: true });

export const CovoSurvey = mongoose.model<ICovoSurvey>("CovoSurvey", covoSurveySchema);
