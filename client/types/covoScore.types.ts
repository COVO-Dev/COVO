export interface CovoScore {
  overall: number;
  ratings: string[]; // Array of ObjectId strings
}

// Influencer data structure with Covo Score
export interface InfluencerWithCovoScore {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  covoScore: CovoScore;
  followers: number;
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
  gender: string;
  payoutPreference: "direct_bank" | "wallet";
  referralSource?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response structure for Covo Score requests
export interface CovoScoreResponse {
  status: "success" | "error";
  data?: InfluencerWithCovoScore;
  message?: string;
}

// Loading states for Covo Score components
export interface CovoScoreLoadingState {
  isLoading: boolean;
  error: string | null;
  data: CovoScore | null;
}

// Hook return type for useCovoScore
export interface UseCovoScoreReturn {
  covoScore: CovoScore | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Props for Covo Score display components
export interface CovoScoreDisplayProps {
  influencerId?: string; // Optional - if not provided, shows current user's score
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

// Covo Score calculation data (for reference)
export interface CovoScoreCalculationData {
  engagementPerception: number;
  deliveryConsistency: number;
  brandFeedback: number;
  audienceFit: number;
}

// Brand reliability score (for completeness)
export interface BrandReliabilityScore {
  communication: number;
  paymentTimeliness: number;
  respect: number;
}

// Survey data structure for Covo Score calculation
export interface CovoSurveyData {
  campaignId: string;
  influencerId: string;
  brandId: string;
  type: "creator_feedback" | "brand_feedback";
  reviews?: string;
  
  // Ratings filled by the brand about the creator
  engagementPerception?: number;
  deliveryConsistency?: number;
  brandFeedback?: number;
  audienceFit?: number;
  
  // Ratings filled by the creator about the brand
  communication?: number;
  paymentTimeliness?: number;
  respect?: number;
}

// Error types for better error handling
export type CovoScoreError = 
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR" 
  | "NOT_FOUND"
  | "INVALID_DATA"
  | "UNKNOWN_ERROR";

export interface CovoScoreErrorDetails {
  type: CovoScoreError;
  message: string;
  statusCode?: number;
}
