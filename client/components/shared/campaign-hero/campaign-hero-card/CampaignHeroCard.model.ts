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
      firstName: string;
      lastName: string;
    };
    budgetRange: number;
    collaborationPreferences: {
      exclusiveCollaborations: boolean;
      hasWorkedWithInfluencers: boolean;
    };
    createdAt: Date;
    endDate: Date;
    applications?: ICampaignApplication[];
    geographicFocus: string;
    influencerId: string[];
    influencerType: string;
    isDeleted: false;
    primaryGoals: string[];
    startDate: Date;
    status: string;
    targetAudience: string;
    title: string;
    trackingAndAnalytics: {
      performanceTracking: boolean;
      metrics: Array<string>;
      reportFrequency: string;
    };
    updatedAt: Date;
    __v: number;
    _id: string;
  };
}
