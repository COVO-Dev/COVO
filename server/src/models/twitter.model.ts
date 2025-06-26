import mongoose, { Schema, Document } from "mongoose";
import { ITwitterMetrics } from "../types";

const TwitterMetricsSchema: Schema = new Schema(
    {
        influencerId: { type: Schema.Types.ObjectId, ref: "Influencer", required: true },
        metrics: {
            followers: { type: Number, default: 0 },
            impressions: { type: Number, default: 0 },
            engagementRate: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            retweets: { type: Number, default: 0 },
            replies: { type: Number, default: 0 },
            followerGrowth: [
                {
                    date: { type: Date },
                    count: { type: Number },
                },
            ],
            lastUpdated: { type: Date, default: Date.now },
        },
        accessToken: { type: String, required: true },
        refreshToken: { type: String },
        tokenExpiry: { type: Date, required: true },
        connected: { type: Boolean, default: false },
        lastConnected: { type: Date, default: Date.now },
        twitterId: { type: String },
        demographics: {
            language: { type: String },
            timezone: { type: String },
            // audience: {
            //     age: {
            //         "13-17": { type: Number },
            //         "18-24": { type: Number },
            //         "25-34": { type: Number },
            //         "35-44": { type: Number },
            //         "45-54": { type: Number },
            //         "55-64": { type: Number },
            //         "65+": { type: Number },
            //     },
            //     genderStats: {
            //         male: { type: Number, default: 0 },
            //         female: { type: Number, default: 0 },
            //         other: { type: Number, default: 0 },
            //         unknown: { type: Number, default: 0 },
            //     }
            // }
        },
        topTweets: [
            {
                content: { type: String },
                likes: { type: Number },
                retweets: { type: Number },
                replies: { type: Number },
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
        interests: [{ type: String }],
        mentionsAndInteractions: [
            {
                authorId: { type: String },
                authorUsername: { type: String },
                metionCount: { type: Number },
                lastMentionedAt: { type : Date },
                engagement: { type: Number }
            }
        ]
    },
    { timestamps: true }
);

export const Twitter = mongoose.connection.useDb('metrics').model<ITwitterMetrics>("Twitter", TwitterMetricsSchema);