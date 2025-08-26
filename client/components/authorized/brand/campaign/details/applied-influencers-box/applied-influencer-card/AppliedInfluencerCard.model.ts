interface influencerData {
  _id: string;
  firstName: string;
  lastName: string;
}

interface InfluencerApplication {
  influencerId: influencerData;
  offer: string;
  message: string;
}

export default interface IAppliedInfluencerBoxProps {
  userData: InfluencerApplication;
  credentials: {
    campaignId: string;
    brandId: string;
    token: string;
  };
  handleSubmitAccept: (
    brandId: string,
    influencerId: string,
    campaignId: string,
    token: string
  ) => void;
  handleSubmitReject: (
    brandId: string,
    influencerId: string,
    campaignId: string,
    token: string
  ) => void;
  handleClick: (influencerId: string) => void;
}
