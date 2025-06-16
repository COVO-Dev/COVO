type UserRole = "Admin" | "Influencer" | "Brand";
export interface IUser {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
	password: string;
	phoneNumber?: string;
	role: UserRole;
	is_deleted: boolean;
	is_active: boolean;
	consentAndAgreements: {
		termsAccepted: boolean;
		marketingOptIn: boolean;
		dataComplianceConsent: boolean;
	};
}

// Define the Influencer Interface
export interface IInfluencer extends IUser {
	socialMediaProfiles: {
		instagramHandle?: string;
		youtubeChannelLink?: string;
		tiktokHandle?: string;
		twitterHandle?: string;
		facebookPageLink?: string;
		linkedInProfile?: string;
		otherPlatforms?: { platformName: string; link: string }[];
	};
	contentAndAudience: {
		primaryNiche: string;
		secondaryNiche?: string;
		contentSpecialisation: string;
		rateCardUpload?: string;
		brandGifting: boolean;
		paidCollaborationsOnly: boolean;
		mediaKitUpload?: string;
	};
	profilePicture?: string;
	personalBio?: string;
	location: {
		country: string;
		city: string;
	};
	referralSource?: string;
}

// Define the Brand Interface
export interface IBrand extends IUser {
	companyName: string;
	company_website?: string;
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
	campaigns: string[];
	createdAt: string;
	updatedAt: string;
}
