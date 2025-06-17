import mongoose, { Schema, Document } from "mongoose";
import { ICampaign, IApplication } from "../types";

const ApplicationSchema = new Schema<IApplication>({
	influencerId: {
		type: Schema.Types.ObjectId,
		ref: "Influencer",
		required: true,
	},
	message: { type: String },
	offer: { type: Schema.Types.Mixed },
	appliedAt: { type: Date, default: Date.now },
	lastEditedAt: { type: Date, default: Date.now },
});

const CampaignSchema: Schema = new Schema(
	{
		brandId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brand",
			required: true,
		},
		title: { type: String, required: true },
		startDate: { type: Date, required: true },
		currency: { type: String },
		endDate: { type: Date, required: true },
		budgetRange: { type: Number, required: true },
		targetAudience: { type: String, required: true },
		primaryGoals: { type: [String], required: true },
		geographicFocus: { type: String, required: true },
		collaborationPreferences: {
			hasWorkedWithInfluencers: { type: Boolean, required: true },
			exclusiveCollaborations: { type: Boolean, required: true },
			type: { type: String, enum: [ "Nano", "Micro", "Macro", "Mega" ], required: true },
			styles: { type: [String], required: true },
		},
		recommendedInfluencers: [
			{
				type: mongoose.Schema.Types.Mixed,
				ref: "Influencer",
				default: [],
			},
		],
		trackingAndAnalytics: {
			performanceTracking: { type: Boolean, required: true },
			metrics: { type: [String], required: true },
			reportFrequency: { type: String, required: true },
		},
		applications: { type: [ApplicationSchema], default: [] },
		influencerId: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		status: {
			type: String,
			enum: ["active", "inactive", "pending", "ongoing", "completed"],
			default: "active",
		},
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

CampaignSchema.virtual("milestones", {
  ref: "Milestone",
  localField: "_id",
  foreignField: "campaignId",
});

CampaignSchema.set("toObject", { virtuals: true });
CampaignSchema.set("toJSON", { virtuals: true });

CampaignSchema.pre("find", function (next) {
	this.where({ isDeleted: { $ne: true } });
	next();
});

CampaignSchema.pre("findOne", function (next) {
	this.where({ isDeleted: { $ne: true } });
	next();
});

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
