import mongoose, { Schema, Document } from "mongoose";
import { IInstagramMetrics } from "../types";

const InstagramMetricsSchema: Schema = new Schema(
    {
        influencerId: { type: Schema.Types.ObjectId, ref: "Influencer", required: true },
        metrics: {
            followers: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            views: { type: Number, default: 0 },
            saves: { type: Number, default: 0 },
            followerGrowth: [
                {
                    date: { type: Date },
                    count: { type: Number },
                },
            ],
            lastUpdated: { type: Date, default: Date.now },
        },
        accessToken: { type: String, required: true },
        pageAccessToken: {type:  String, required: true},
        refreshToken: { type: String },
        tokenExpiry: { type: Date, required: true },
        connected: { type: Boolean, default: false },
        lastConnected: { type: Date, default: Date.now },
        instagramId: { type: String },
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
                }
            }
        },
        storyMetrics: {
            views: { type: Number, default: 0 },
            replies: { type: Number, default: 0 },
            exits: { type: Number, default: 0 },
            completionRate: { type: Number, default: 0 },
        },
        reelMetrics: {
            plays: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            saves: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
        },
        hashtagPerformance: [
            {
                hashtag: { type: String },
                mentionCount: { type: Number, default: 0 },
                lastUsedAt: { type: Date },
            }
        ],        
        topPosts: [
            {
                content: { type: String },
                likes: { type: Number },
                comments: { type: Number },
                shares: { type: Number },
                saves: { type: Number },
                views: { type: Number },
                postDate: { type: Date },
            },
        ],
        peakEngagement: [
            {
                hour: { type: Number },
                engagement: { type: Number },
            }
        ],
        contentPerformance: {
            averageLikesPerPost: { type: Number, default: 0 },
            averageCommentsPerPost: { type: Number, default: 0 },
            averageSharesPerPost: { type: Number, default: 0 },
            averageViewsPerReel: { type: Number, default: 0 },
        },        
        // adPerformance: {
        //     reach: { type: Number, default: 0 },
        //     clicks: { type: Number, default: 0 },
        //     conversions: { type: Number, default: 0 },
        // },        
        interests: [{ type: String }],
        mentionsAndInteractions: [
            {
                authorId: { type: String },
                authorUsername: { type: String },
                mentionCount: { type: Number },
                lastMentionedAt: { type: Date },
                engagement: { type: Number }
            }
        ]
    },
    { timestamps: true }
);

export const Instagram = mongoose.connection.useDb('metrics').model<IInstagramMetrics>("Instagram", InstagramMetricsSchema);
