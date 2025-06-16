import { z } from "zod";
import { UserRole } from "../types/enum";

const platformMetricsSchema = z.object({
	followers: z.number().min(1, " is required"),
	likes: z.number().min(1).optional(),
	comments: z.number().min(1).optional(),
	shares: z.number().min(1).optional(),
	views: z.number().min(1, " is required"),
	engagementRate: z.number().min(1, " is required"),
});

const platformDataSchema = z.object({
	metrics: platformMetricsSchema.optional(),
	demographics: z.object({
		age: z.number().min(1, " is required"),
		gender: z.string().min(1, " is required"),
		location: z.string().min(1, " is required"),
	}),
	platformUsername: z.string().min(1, " is required"),
	platformId: z.string().min(1).optional(),
});

export const influencerFullUpdateSchema = z.object({
	// Basic information
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	username: z.string().min(1, "Username is required"),
	phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/, "Invalid phone number"),
	contentAndAudience: z.object({
		primaryNiche: z.string().min(1, "Primary Niche is required"),
		secondaryNiche: z.string().optional(),
		contentSpecialisation: z.string().min(1, "Specialization is required"),
		rateCardUpload: z.string().optional(),
		brandGifting: z.boolean(),
		paidCollaborationsOnly: z.boolean(),
		mediaKitUpload: z.string().optional(),
	}),
	personalBio: z.string().min(1).optional(),
	location: z.object({
		country: z.string().min(1, "Country is required"),
		city: z.string().min(1, "City is required"),
	}),
	profilePicture: z.string().optional(),
	referralSource: z.string().optional(),
});

export type IInfluencerFullUpdate = z.infer<typeof influencerFullUpdateSchema>;

// Validation schema for Influencer registration
export const influencerRegisterSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	username: z.string().min(1, "Username is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

// Validation schema for Influencer registration
export const influencerMoreInformationSchema = z.object({
	platforms: z
		.object({
			youtube: platformDataSchema.optional(),
			tiktok: platformDataSchema.optional(),
			instagram: platformDataSchema.optional(),
			facebook: platformDataSchema.optional(),
			twitter: platformDataSchema.optional(),
		})
		.optional(),
	selectedPlatforms: z.array(z.string().min(1)).optional(),
	contentAndAudience: z.object({
		primaryNiche: z.string().min(1, " is required"),
		secondaryNiche: z.string().optional(),
		contentSpecialisation: z.string().min(1, " is required"),
		rateCardUpload: z.string().optional(),
		brandGifting: z.boolean(),
		paidCollaborationsOnly: z.boolean(),
		mediaKitUpload: z.string().optional(),
	}),
	personalBio: z.string().min(1).optional(),
	location: z.object({
		country: z.string().min(1, " is required"),
		city: z.string().min(1, " is required"),
	}),
	profilePicture: z.string().optional(),
	referralSource: z.string().optional(),
	phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/, "Invalid phone number"),
});

export type IInfluencerMoreInformation = z.infer<
	typeof influencerMoreInformationSchema
>;

// Validation schema for Brand registration
export const brandRegisterSchema = z.object({
	companyName: z.string().min(1, "company name is required"),
	companyWebsite: z.string().url("Invalid company website URL").optional(),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	position: z.string().min(1, "Position is required"),
	logo: z.string().url("Invalid logo URL").optional(),
	industry: z.string().optional(),
	phoneNumber: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
		.optional(),
	campaigns: z.array(z.string()).optional(),
	businessType: z.string().min(1, "Business type is required").optional(),
	socialMedia: z
		.object({
			instagram: z.string().url("Invalid Instagram URL").optional(),
			facebook: z.string().url("Invalid Facebook URL").optional(),
			linkedin: z.string().url("Invalid LinkedIn URL").optional(),
			twitter: z.string().url("Invalid Twitter URL").optional(),
		})
		.optional(),
	paymentDetails: z
		.object({
			method: z.string().min(1, "Payment method is required").optional(),
			billingInfo: z
				.string()
				.min(1, "Billing information is required")
				.optional(),
		})
		.optional(),
	bio: z.string().min(1, "Bio is required").optional(),
});

// Validation schema for Admin registration
export const adminRegisterSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	username: z.string().min(1, "Username is required"),
	imageUrl: z.string().url("Invalid image URL").optional(),
});

// Validation schema for Login
export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CampaignValidationSchema = z.object({
	brandId: z.string().refine((id) => /^[a-fA-F0-9]{24}$/.test(id), {
		message: "Invalid brand ID format",
	}),
	title: z.string().min(1, { message: "Title is required" }),
	startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: "Invalid start date format",
	}),
	endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: "Invalid end date format",
	}),
	budgetRange: z
		.number()
		.min(0, { message: "Budget range must be a positive number" }),
	targetAudience: z.string().min(1, { message: "Target audience is required" }),
	primaryGoals: z
		.array(z.string().min(1, { message: "Goal cannot be empty" }))
		.min(1),
	influencerType: z.string().min(1, { message: "Influencer type is required" }),
	geographicFocus: z
		.string()
		.min(1, { message: "Geographic focus is required" }),
	collaborationPreferences: z.object({
		hasWorkedWithInfluencers: z.boolean(),
		exclusiveCollaborations: z.boolean(),
		type: z.string().min(1, { message: "Collaboration type is required" }),
		styles: z
			.array(z.string().min(1, { message: "Style cannot be empty" }))
			.min(1),
	}),
	trackingAndAnalytics: z.object({
		performanceTracking: z.boolean(),
		// metrics: z
		// 	.array(z.string().min(1, { message: "Metric cannot be empty" }))
		// 	.min(1),
		reportFrequency: z
			.string()
			.min(1, { message: "Report frequency is required" }),
	}),
	influencerId: z
		.array(
			z.string().refine((id) => /^[a-fA-F0-9]{24}$/.test(id), {
				message: "Invalid influencer ID format",
			})
		)
		.optional(),
	status: z.enum(["active", "completed", "pending"]).default("pending"),
});

// deactivate user schema
export const deactivateRequestSchema = z.object({
	deactivationReason: z
		.string()
		.min(1, { message: "Deactivation reason is required" }),
});
