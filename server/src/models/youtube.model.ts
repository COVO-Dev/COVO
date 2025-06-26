import mongoose, { Schema, Document } from "mongoose";
import { IYoutubeMetrics } from "../types";

const YoutubeMetricsSchema: Schema = new Schema(
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
            subscriberGrowth: [
                {
                    date: { type: Date, required: true },
                    gained: { type: Number, default: 0 },  
                    lost: { type: Number, default: 0 },
                },
            ],
            lastUpdated: { type: Date, default: Date.now },
        },
        accessToken: { type: String, required: true },
        refreshToken: { type: String },
        tokenExpiry: { type: Date, required: true },
        connected: { type: Boolean, default: false },
        lastConnected: { type: Date, default: Date.now },
        youtubeId: { type: String },

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
        videoPerformance: [
            {
                videoId: { type: String, required: true },
                title: { type: String },
                views: { type: Number, default: 0 },
                watchTime: { type: Number, default: 0 },  
                avgViewDuration: { type: Number, default: 0 },  
                ctr: { type: Number, default: 0 }, 
                likes: { type: Number, default: 0 },
                comments: { type: Number, default: 0 },
                shares: { type: Number, default: 0 },
                trafficSources: { 
                    search: { type: Number, default: 0 },
                    external: { type: Number, default: 0 },
                    suggested: { type: Number, default: 0 },
                    browseFeatures: { type: Number, default: 0 },
                },
                uploadDate: { type: Date },
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

        audienceRetention: [
            {
                videoId: { type: String, required: true },
                timestamp: { type: Number },
                viewersRemaining: { type: Number },
            },
        ],

        interests: [{ type: String }],

    },
    { timestamps: true }
);

export const Youtube = mongoose.connection.useDb('metrics').model<IYoutubeMetrics>("Youtube", YoutubeMetricsSchema);
