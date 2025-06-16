export interface IInitialState {
  // user keys
  id: string;
  access_token: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  phoneNumber: string;
  consentAndAgreements: {
    termsAccepted: boolean;
    marketingOptIn: boolean;
    dataComplianceConsent: boolean;
  };

  // Brand keys
  companyName?: string;
  companyWebsite?: string;
  position?: string;
  logo?: string;
  businessType?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  bio?: string;
  industry?: string;
  paymentDetails?: {
    method: string;
    billingInfo: string;
  };
  // campaigns?: mongoose.Types.ObjectId[];

  // influencer Keys
  profilePicture?: string;
  contentAndAudience?: {
    primaryNiche: string;
    secondaryNiche: string;
    contentSpecialisation: string;
    rateCardUpload: string;
    brandGifting: boolean;
    paidCollaborationsOnly: boolean;
    mediaKitUpload: string;
  };
  selectedPlatforms?: string[];
  deactivated?: boolean;
  createdAt?: string;
  updatedAt?: string;
  personalBio?: string;
  location?: {
    country: string;
    city: string;
  };
  platforms?: {
    [key: string]: {
      auth: {
        accessToken: string;
        refreshToken: string;      tokenExpiry: string;
      connected: boolean;
      lastConnected: string;
      };
      platformUsername: string;
      platformId: string;
      metrics: {
        followers: number;
        likes: number;
        comments: number;
        shares: number;
        views: number;
        impression: number;
        engagementRate: number;
        subscriberGrowth: number[];
        adPerformance: {
          impressions: number;
          clicks: number;
          ctr: number;
          adRevenue: number;
          _id: {
            $oid: string;
          };
        };
        brandMentions: string[];
        lastUpdated: string;
      };
      topPosts: string[];
    };
  };
}
