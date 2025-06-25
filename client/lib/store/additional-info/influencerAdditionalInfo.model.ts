// export interface IPlatformMetrics {
//   followers: number;
//   likes: number;
//   comments: number;
//   shares: number;
//   views?: number;
//   engagementRate: number;
// }

// export interface IPlatformDatas {
//   metrics?: IPlatformMetrics;
//   demographics: {
//     age: number,
//     gender: string,
//     location: string,
//   };
//   platformUsername: string;
//   platformId?: string;
// }

export interface IInfluencerAdditionalInfo {
  // platforms: {
  // 	youtube?: IPlatformDatas;
  // 	tiktok?: IPlatformDatas;
  // 	instagram?: IPlatformDatas;
  // 	facebook?: IPlatformDatas;
  // 	twitter?: IPlatformDatas;
  // };
  // selectedPlatforms: string[];

  contentAndAudience: {
    primaryNiche: string;
    secondaryNiche?: string;
    contentSpecialisation: string;
    brandGifting: boolean;
    paidCollaborationsOnly: boolean;
  };

  personalBio?: string;
  phoneNumber: string;
  profilePicture: string;
  location: {
    country: string;
    city: string;
  };
  referralSource?: string;
}
