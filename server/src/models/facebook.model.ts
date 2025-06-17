import mongoose, { Schema, Document } from "mongoose";
import { IFacebookMetrics } from "../types";

const FacebookMetricsSchema: Schema = new Schema(
    {
        influencerId: { type: Schema.Types.ObjectId, ref: "Influencer", required: true },
        
        metrics: {
            followers: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            views: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            reach: { type: Number, default: 0 },      
            lastUpdated: { type: Date, default: Date.now },
        },

        accessToken: { type: String, required: true },
        refreshToken: { type: String },
        tokenExpiry: { type: Date, required: true },
        connected: { type: Boolean, default: false },
        lastConnected: { type: Date, default: Date.now },
        pageAccessToken: { type: String, required: true },
        facebookId: { type: String },

        demographics: {
            audience: {
                age: {
                    "13-17": { type: Number },
                    "18-24": { type: Number },
                    "25-34": { type: Number },
                    "35-44": { type: Number },
                    "45-54": { type: Number },
                    "55-64": { type: Number },
                    "65+": { type: Number },
                },
                genderStats: {
                    male: { type: Number, default: 0 },
                    female: { type: Number, default: 0 },
                    other: { type: Number, default: 0 },
                    unknown: { type: Number, default: 0 },
                },
            },
        },

        postPerformance: [
            {
                postId: { type: String, required: true },
                message: { type: String },
                mediaType: { type: String },
                impressions: { type: Number, default: 0 },
                engagement: { type: Number, default: 0 },
                reactions: {
                    like: { type: Number, default: 0 },
                    // love: { type: Number, default: 0 },
                    // wow: { type: Number, default: 0 },
                    // haha: { type: Number, default: 0 },
                    // sad: { type: Number, default: 0 },
                    // angry: { type: Number, default: 0 },
                },
                shares: { type: Number, default: 0 },
                comments: { type: Number, default: 0 },
                postDate: { type: Date },
            },
        ],

        peakEngagement: [
            {
                day: { type: String },
                hour: { type: Number },
                engagement: { type: Number, default: 0 },
            },
        ],

        brandMentions: [
            {
                brand: { type: String, required: true },
                mentionCount: { type: Number, default: 0 },
                lastMentionedAt: { type: Date },
            },
        ],

        audienceInterests: [{ type: String }],

    },
    { timestamps: true }
);

export const Facebook = mongoose.connection.useDb('metrics').model<IFacebookMetrics>("Facebook", FacebookMetricsSchema);
