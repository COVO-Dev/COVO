interface ICampaignApplication {
  influencerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  message: string;
  offer: number;
  appliedAt: Date;
  _id: string;
  lastEditedAt: Date;
}

export default interface ICampaignHeroProps {
  campaignData: {
    brandId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    budgetRange: string;
    collaborationPreferences: {
      exclusiveCollaborations: boolean;
      hasWorkedWithInfluencers: boolean;
      type: string;
      styles: string[];
    };
    createdAt: Date;
    endDate: Date;
    applications?: ICampaignApplication[];
    geographicFocus: {
      country: string;
      city?: string;
    };
    influencerId: string[];
    influencerType: string;
    isDeleted: boolean;
    primaryGoals: string;
    startDate: Date;
    status: string;
    targetAudience: {
      ageGroups: string;
      gender: string;
      incomeLevel: string;
      lifeStage: string;
      lifestyle: string;
      engagementLevel: string;
      platform: string;
    };
    title: string;
    trackingAndAnalytics: {
      performanceTracking: boolean;
      metrics: Array<string>;
      reportFrequency: string;
    };
    updatedAt: Date;
    __v: number;
    _id: string;
    recommendedInfluencers?: any[];
  };
}
