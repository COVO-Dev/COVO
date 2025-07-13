interface IRecommendedInfluencer {
  _id: string;
  firstName: string;
  lastName: string;
}

export default interface IRecommendedInfluencerProp {
  recommendedInfluencers: IRecommendedInfluencer[];
  className?: string;
  handleClick: (influencerId: string) => void;
  credentials: {
    brandId: string;
    campaignId: string;
    token: string;
  };
}

// interface recommendedInfluencer {
//   firstName: string;
//   lastName: string;
//   recommendationScore: string;
//   note?: string;
// }

// export default interface IRecommendedInfluencerProp {
//   recommendedInfluencers: recommendedInfluencer[];
//   className?: string;
//   handleClick: (influencerId: string) => void;
// }
