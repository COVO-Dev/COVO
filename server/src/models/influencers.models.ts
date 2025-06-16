import mongoose, { Schema, Document } from 'mongoose';
import { User } from './users.models';
import { IInfluencer } from '../types';

const InfluencerSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      match: /^[a-zA-Z0-9_-]+$/
    },
    age: { type: Number, min: 18, max: 65 },
    covoScore: {
      overall: { type: Number, min: 0, max: 100 },
      ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CovoSurvey' }],
    },
    followers: {
      type: Number,
      min: 0,
    },
    type: {
      type: String,
      enum: ['Nano', 'Micro', 'Macro', 'Mega', 'Unknown'],
    },
    contentAndAudience: {
      primaryNiche: { type: String },
      secondaryNiche: { type: String },
      contentSpecialisation: { type: String },
      rateCardUpload: { type: String },
      brandGifting: { type: Boolean },
      paidCollaborationsOnly: { type: Boolean },
      mediaKitUpload: { type: String },
    },
    profilePicture: { type: String },
    personalBio: { type: String, maxlength: 250 },
    location: {
      country: { type: String },
      city: { type: String },
    },
    referralSource: { type: String },
    deactivated: { type: Boolean, default: false },
  },
  {
    timestamps: true
  }
);

const Influencer = User.discriminator<IInfluencer>('Influencer', InfluencerSchema);

export { Influencer };
