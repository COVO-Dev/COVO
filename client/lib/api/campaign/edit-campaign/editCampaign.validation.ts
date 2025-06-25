export default interface ICampaignApplication {
  brandId: string;
  influencerId: string[];
  // recommendedInfluencers: IRecommendedInfluencer[];
  recommendedInfluencers?: string[];
}
