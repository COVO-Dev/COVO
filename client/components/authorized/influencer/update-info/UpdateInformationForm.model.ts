export default interface IInfluencerUpdate {
  influencerData: {
    // profilePicture?: string;
    // referralSource?: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
    location: {
      country: string;
      city: string;
    };
    personalBio?: string;
    contentAndAudience: {
      // rateCardUpload?: string;
      // mediaKitUpload?: string;
      primaryNiche: string;
      secondaryNiche?: string;
      contentSpecialisation: string;
      brandGifting: boolean;
      paidCollaborationsOnly: boolean;
    };
    consentAndAgreements: {
      termsAccepted: boolean;
      marketingOptIn: boolean;
      dataComplianceConsent: boolean;
    };
  };
}
