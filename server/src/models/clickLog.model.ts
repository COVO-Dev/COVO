import { Schema, model, Types, Document } from 'mongoose';

interface IClickLog extends Document {
    influencerId: Types.ObjectId;
    campaignId: Types.ObjectId;
    ip: string;
    userAgent: string;
    device?: string;
    browser?: string;
    os?: string;
    country?: string;
    region?: string;
    city?: string;
    postId?: string;
    utmSource?: string;
    utmCampaign?: string;
    createdAt?: Date;
}

const ClickLogSchema = new Schema<IClickLog>(
    {
        influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
        campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
        ip: { type: String, required: true },
        userAgent: { type: String, required: true },
        device: String,
        browser: String,
        os: String,
        country: String,
        region: String,
        city: String,
        postId: String,
        utmSource: String,
        utmCampaign: String,
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const ClickLog = model<IClickLog>('ClickLog', ClickLogSchema);
