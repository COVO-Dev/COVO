import mongoose, { Schema, Document } from "mongoose";
import { ISearchLog } from "../types";

const SearchLogSchema: Schema = new Schema({
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    filters: {
        // Influencer Profile Filters
        followerCount: { min: Number, max: Number },
        engagementRate: { min: Number, max: Number },
        location: { country: String, city: String },
        age: { type: Number, min: 18, max: 65 },
        gender: String,

        // Audience Filters
        platform: String,
        ageRange: { min: Number, max: Number },
        genderDistribution: [String],
        interestCategories: [String],
        platformEngagement: { min: Number, max: Number },

        // Industry-Specific Filters
        primaryNiche: String,
        secondaryNiche: String,
    },
},
    { timestamps: true },
);

const SearchLog = mongoose.model<ISearchLog>("SearchLog", SearchLogSchema);

export { SearchLog };
