interface recommendedInfluencer {
  firstName: string;
  lastName: string;
  recommendationScore: string;
  note?: string;
}

export default interface IRecommendedInfluencerProp {
  recommendedInfluencers: recommendedInfluencer[];
  className?: string;
  handleClick: (influencerId: string) => void;
}
