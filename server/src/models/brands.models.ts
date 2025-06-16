import mongoose, { Schema, Document } from 'mongoose';
import { IBrand } from '../types';
import { User } from './users.models';

const BrandSchema: Schema = new Schema(
  {
    companyName: { type: String, required: true },
    businessType: { type: String },
    position: { type: String, required: true },
    companyWebsite: { type: String },
    industry: { type: String },
    logo: { type: String },
    socialMedia: {
      instagram: { type: String },
      facebook: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
    },
    paymentDetails: {
      method: { type: String },
      billingInfo: { type: String },
    },
    bio: { type: String },
    campaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
  }
);

const Brand = User.discriminator<IBrand>('Brand', BrandSchema);

export { Brand };
