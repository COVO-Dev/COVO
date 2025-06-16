// This file contains all the interfaces used in the application.
// It is used to define the different types of interfaces used in the application.
import mongoose, { Document, Schema } from "mongoose";
import {
	CampaignStatus,
	NotificationCategory,
	NotificationStatus,
	NotificationPreferenceType,
	UserRole,
} from "./enum";
import { Request } from "express";

// Define the base User Interface
export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	username?: string;
	password: string;
	phoneNumber?: string;
	role: UserRole;
	isDeleted: boolean;
	currency?: string;
	gender?: string;
	isActive: boolean;
	language?: string;
	resetPasswordToken?: string,
	resetPasswordExpires?: Date,
	consentAndAgreements: {
		termsAccepted: boolean;
		marketingOptIn: boolean;
		dataComplianceConsent: boolean;
	};
	privacyPolicy: boolean;
}

// Define the Influencer Interface
export interface IInfluencer extends IUser {
	username: string;
	age: number;
	contentAndAudience: {
		primaryNiche: string;
		secondaryNiche?: string;
		contentSpecialisation: string;
		rateCardUpload?: string;
		brandGifting: boolean;
		paidCollaborationsOnly: boolean;
		mediaKitUpload?: string;
	};
	followers: number;
	covoScore: {
		overall: number;
		ratings: mongoose.Types.ObjectId[];
	}
	profilePicture?: string;
	personalBio?: string;
	location: {
		country: string;
		city: string;
	};
	gender: string;
	referralSource?: string;
}

// Define the Brand Interface
export interface IBrand extends IUser {
	companyName: string;
	companyWebsite?: string;
	position: string;
	industry: string;
	logo: string;
	businessType: string;
	socialMedia?: {
		instagram?: string;
		facebook?: string;
		linkedin?: string;
		twitter?: string;
	};
	paymentDetails: {
		method: string;
		billingInfo: string;
	};
	bio: string;
	campaigns: mongoose.Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

// Define the Admin Interface
export interface IAdmin extends IUser {
	// permissions: string[];
}

export interface ICampaign {
	brandId: mongoose.Types.ObjectId;
	influencerId: mongoose.Types.ObjectId[];
	title: string;
	startDate: Date;
	endDate: Date;
	budgetRange: number;
	currency: string;
	targetAudience: string;
	primaryGoals: string[];
	geographicFocus: string;
	collaborationPreferences: {
		hasWorkedWithInfluencers: boolean;
		exclusiveCollaborations: boolean;
		type: "Nano" | "Micro" | "Macro" | "Mega";
		styles: string[];
	};
	trackingAndAnalytics: {
		performanceTracking: boolean;
		metrics: string[];
		reportFrequency: string;
	};
	status: "active" | "completed" | "pending";
	isDeleted: boolean;
	applications: IApplication[];
	// recommendedInfluencers: IRecommendedInfluencer[];
	recommendedInfluencers: IInfluencer[];
}

export interface IApplication {
	influencerId: mongoose.Types.ObjectId;
	message?: string;
	offer?: string | number;
	appliedAt?: Date;
	lastEditedAt?: Date;
}

export interface IRecommendedInfluencer {
	influencer: IInfluencer;
	recommendationScore?: number;
	note?: string;
	[key: string]: any;
}

export interface AuthServiceResponse<T> {
	status_code: number;
	message: string;
	data: T | T[];
	access_token?: string;
}

export interface ServiceResponse<T> {
	status_code: number;
	message: string;
	data: T | T[];
}

export interface SearchResponse<T> {
	status_code: number;
	message: string;
	data: {
		data: T[];
		totalCount: number;
		totalPages: number;
		currentPage: number;
	};
}

export interface AuthenticatedRequest extends Request {
	headers: {
		authorization: string;
	};
	user?: {
		userId: string;
		role: UserRole;
		email: string;
		firstName: string;
		lastName: string;
	};
	// subscription?: any
}

export interface EmailData {
	from: string;
	to: string;
	subject: string;
	html: string;
}

export interface INotification {
	recipientId: mongoose.Types.ObjectId;
	senderId: mongoose.Types.ObjectId;
	role: UserRole;
	subject: string;
	body: string;
	status: NotificationStatus;
	type: string;
	category: NotificationCategory;
	isDeleted: boolean;
	timestamp: Date;
}

export interface INotificationSettings {
	recipient: mongoose.Types.ObjectId;
	isEnabled: boolean;
	preferences: NotificationPreferenceType;
	doNotDisturb: {
		start: string;
		end: string;
	};
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IDeactivation {
	userId: mongoose.Types.ObjectId;
	deactivationReason: string;
	deactivatedAt: Date;
	userData: Record<string, any>;
}

export interface IChat {
	participants: mongoose.Types.ObjectId[];
	lastMessage: mongoose.Types.ObjectId | null;
}

export interface IMessage {
	chatId: mongoose.Types.ObjectId;
	sender: mongoose.Types.ObjectId;
	content?: string;
	media?: { url: string; type: "image" | "video" };
	timestamp: Date;
	readBy: mongoose.Types.ObjectId[];
}

export interface IPlatformData {
	userCount: number;
	influencerCount: number;
	brandCount: number;
	adminCount: number;
}

export interface Campaign {
	campaignId: mongoose.Types.ObjectId;
	influencerId: mongoose.Schema.Types.ObjectId;
	startFollowers: number;
	endFollowers: number;
	totalEngagements: number;
	conversions: number;
	reach: number;
	impressions: number;
	contentQualityScore: number;
}

export interface PlatformAuth {
	accessToken: string;
	refreshToken?: string;
	additionalData?: any;
}

export interface ServiceResponseYoutube {
	status_code: number;
	message: string;
	data: PlatformAuth;
}

export interface PlatformDataResponses {
	status_code: number;
	message: string;
	data: any;
}

export interface ISearchLog {
	brandId: mongoose.Schema.Types.ObjectId;
	filters: {
		// Influencer Profile Filters
		platform: String;
		followerCount: { min: Number; max: Number };
		engagementRate: { min: Number; max: Number };
		location: { country: [String]; city: [String] };

		// Audience Filters
		ageRange: { min: Number; max: Number };
		// genderDistribution: [String],
		audienceLocations: [String];
		interestCategories: [String];

		// Industry-Specific Filters
		primaryNiche: String;
		secondaryNiche: String;
		// experienceInBrandCategory: [String],
	};
}

export interface Tokens {
	access_token?: string;
	refresh_token?: string;
	token_type?: string;
	expires_in?: number;
}

export interface ITwitterMetrics {
	influencerId: mongoose.Types.ObjectId;

	metrics: {
		followers: number;
		impressions: number;
		engagementRate: number;
		likes: number;
		retweets: number;
		replies: number;
		followerGrowth: { date: Date; count: number }[];
		lastUpdated: Date;
	};
	accessToken: string;
	refreshToken?: string;
	tokenExpiry: Date;
	connected: boolean;
	lastConnected: Date;
	twitterId?: string;
	demographics?: {
		language?: string;
		timezone?: string;
		audience?: {
			age: {
				"13-17"?: number;
				"18-24"?: number;
				"25-34"?: number;
				"35-44"?: number;
				"45-54"?: number;
				"55-64"?: number;
				"65+"?: number;
			};
			genderStats: {
				male: number;
				female: number;
				other: number;
				unknown: number;
			};
		};
	};
	topPosts: {
		content: string;
		likes: number;
		retweets: number;
		replies: number;
		views: number;
		postDate: Date;
	}[];
	peakEngagement: {
		hour: number;
		engagement: number;
	}[];
	interests: string[];
	mentionsAndInteractions: {
		authorId: string;
		authorUsername: string;
		metionCount: number;
		lastMentionedAt: Date;
		engagement: number;
	}[];
}

export interface IInstagramMetrics {
	influencerId: string;
	metrics: {
		followers: number;
		impressions: number;
		engagementRate: number;
		likes: number;
		comments: number;
		shares: number;
		views: number;
		saves: number;
		followerGrowth: {
			date: Date;
			count: number;
		}[];
		lastUpdated: Date;
	};
	accessToken: string;
	pageAccessToken: string;
	refreshToken?: string;
	tokenExpiry: Date;
	connected: boolean;
	lastConnected: Date;
	instagramId?: string;
	demographics?: {
		location: string[];
		language?: string;
		timezone?: string;
		audience?: {
			age: {
				"13-17"?: number;
				"18-24"?: number;
				"25-34"?: number;
				"35-44"?: number;
				"45-54"?: number;
				"55-64"?: number;
				"65+"?: number;
			};
			genderStats: {
				male: number;
				female: number;
				other: number;
				unknown: number;
			};
		};
	};
	storyMetrics?: {
		views: number;
		replies: number;
		exits: number;
		completionRate: number;
	};
	reelMetrics?: {
		plays: number;
		shares: number;
		saves: number;
		comments: number;
	};
	hashtagPerformance?: {
		hashtag: string;
		mentionCount: number;
		lastUsedAt?: Date;
	}[];
	topPosts?: {
		content: string;
		likes: number;
		comments: number;
		shares: number;
		saves: number;
		views: number;
		postDate: Date;
	}[];
	peakEngagement?: {
		hour: number;
		engagement: number;
	}[];
	contentPerformance?: {
		averageLikesPerPost: number;
		averageCommentsPerPost: number;
		averageSharesPerPost: number;
		averageViewsPerReel: number;
	};
	// adPerformance?: {
	//     reach: number;
	//     clicks: number;
	//     conversions: number;
	// };
	interests?: string[];
	mentionsAndInteractions?: {
		authorId: string;
		authorUsername: string;
		mentionCount: number;
		lastMentionedAt?: Date;
		engagement: number;
	}[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IYoutubeMetrics {
	influencerId: mongoose.Types.ObjectId;
	metrics: {
		followers: number;
		impressions: number;
		engagementRate: number;
		likes: number;
		retweets: number;
		replies: number;
		followerGrowth: { date: Date; count: number }[];
		lastUpdated: Date;
	};
	accessToken: string;
	refreshToken?: string;
	tokenExpiry: Date;
	connected: boolean;
	lastConnected: Date;
	youtubeId?: string;
	demographics?: {
		language?: string;
		timezone?: string;
		audience?: {
			age: {
				"13-17"?: number;
				"18-24"?: number;
				"25-34"?: number;
				"35-44"?: number;
				"45-54"?: number;
				"55-64"?: number;
				"65+"?: number;
			};
			genderStats: {
				male: number;
				female: number;
				other: number;
				unknown: number;
			};
		};
	};
	topPosts: {
		content: string;
		likes: number;
		retweets: number;
		replies: number;
		views: number;
		postDate: Date;
	}[];
	peakEngagement: {
		hour: number;
		engagement: number;
	}[];
	interests: string[];
	mentionsAndInteractions: {
		authorId: string;
		authorUsername: string;
		metionCount: number;
		lastMentionedAt: Date;
		engagement: number;
	}[];
}

export interface IFacebookMetrics {
	influencerId: string;

	metrics: {
		followers: number;
		impressions: number;
		engagementRate: number;
		likes: number;
		views: number;
		comments: number;
		shares: number;
		reach: number;
		lastUpdated: Date;
	};

	accessToken: string;
	refreshToken?: string;
	tokenExpiry: Date;
	connected: boolean;
	lastConnected: Date;
	facebookId?: string;

	demographics?: {
		language?: string;
		timezone?: string;
		audience?: {
			age: {
				"13-17"?: number;
				"18-24"?: number;
				"25-34"?: number;
				"35-44"?: number;
				"45-54"?: number;
				"55-64"?: number;
				"65+"?: number;
			};
			genderStats: {
				male: number;
				female: number;
				other: number;
				unknown: number;
			};
		};
	};

	postPerformance: {
		postId: string;
		message?: string;
		mediaType?: string;
		impressions: number;
		engagement: number;
		reactions: {
			like: number;
			love: number;
			wow: number;
			haha: number;
			sad: number;
			angry: number;
		};
		shares: number;
		comments: number;
		postDate?: Date;
	}[];

	peakEngagement: {
		day: string;
		hour: number;
		engagement: number;
	}[];

	brandMentions: {
		brand: string;
		mentionCount: number;
		lastMentionedAt?: Date;
	}[];

	audienceInterests: string[];

	createdAt?: Date;
	updatedAt?: Date;
}

export interface IMilestone {
	description: string;
	influencerChecked: boolean;
	brandChecked: boolean;
	notes?: string;
	dueDate: Date;
	completedAt?: Date | null;
	influencerId: mongoose.Types.ObjectId;
	campaignId: mongoose.Types.ObjectId;
}

export interface ISubscription {
	userId: string;
	planId: string;
	planName: string;
	planPrice: number;
	startDate?: Date;
	endDate: Date;
	status: "active" | "inactive" | "cancelled";
	paymentStatus: "paid" | "pending" | "failed";
	providerSubscriptionId: string;
	provider: string;
	cancelledAt?: Date;
	billingType: "recurring" | "one-time";
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IPlan {
  name: string;
  price: number;
  planCode: string;
  interval: "monthly" | "weekly";
}

export interface PaystackPlan {
  name: string;
  amount: number;
  interval: string;
  plan_code?: string;
}

export interface PaystackSubscription {
  customer: string;
  plan: string;
  authorization?: string;
}

export interface WebhookPayload {
  event: string;
  data: any;
}
