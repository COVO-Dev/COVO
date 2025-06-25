import { createSlice } from "@reduxjs/toolkit";
import {
  IInfluencerAdditionalInfo,
  IPlatformMetrics,
  IPlatformData,
} from "./influencerAdditionalInfo.model";
import { PayloadAction } from "@reduxjs/toolkit";

const initialState: IInfluencerAdditionalInfo = {
  // platforms: {},
  // selectedPlatforms: [],
  contentAndAudience: {
    primaryNiche: "",
    secondaryNiche: "",
    contentSpecialisation: "",
    brandGifting: false,
    paidCollaborationsOnly: false,
    // rateCardUpload: "",
    // mediaKitUpload: "",
  },
  personalBio: "",
  phoneNumber: "",
  profilePicture: "",
  location: {
    country: "",
    city: "",
  },
  referralSource: "",
};

const influencerAdditionalInfoSlice = createSlice({
  name: "influencerAdditionalInfo",
  initialState,
  reducers: {
    setInfluencerAdditionalInfo: (
      state,
      action: PayloadAction<Partial<IInfluencerAdditionalInfo>>
    ) => {
      return {
        ...state,
        ...action.payload,
      };
    },

    // createPlatformData: (
    //   state,
    //   action: PayloadAction<{ platforms: string[] }>
    // ) => {
    //   const { platforms } = action.payload;
    //   for (const platform of platforms) {
    //     if (!state.platforms[platform]) {
    //       state.platforms[platform] = {
    //         metrics: {
    //           followers: 0,
    //           likes: 0,
    //           comments: 0,
    //           shares: 0,
    //           views: 0,
    //           engagementRate: 0,
    //         },
    //         demographics: {
    //           age: 0,
    //           gender: "",
    //           location: "",
    //         },
    //         platformUsername: "",
    //         platformId: "",
    //       };
    //     }
    //   }
    // },

    // updatePlatformDataDemographics: (
    //   state,
    //   action: PayloadAction<{
    //     platform: string;
    //     platformData: Partial<IPlatformData["demographics"]>;
    //   }>
    // ) => {
    //   const { platform, platformData } = action.payload;
    //   state.platforms[platform].demographics = {
    //     ...state.platforms[platform].demographics,
    //     ...platformData,
    //   };
    // },

    // updatePlatformData: (
    //   state,
    //   action: PayloadAction<{
    //     platform: keyof typeof state.platforms;
    //     platformData: Partial<IPlatformData>;
    //   }>
    // ) => {
    //   const { platform, platformData } = action.payload;
    //   state.platforms[platform] = {
    //     ...state.platforms[platform],
    //     ...platformData,
    //   };
    // },

    // resetSelectedPlatforms: (state) => {
    //   state.selectedPlatforms = initialState.selectedPlatforms;
    // },

    // resetPlatforms: (state) => {
    //   state.platforms = {}; // Reset to an empty object
    // },

    updateContentAndAudience: (
      state,
      action: PayloadAction<Partial<typeof state.contentAndAudience>>
    ) => {
      state.contentAndAudience = {
        ...state.contentAndAudience,
        ...action.payload,
      };
    },

    updateLocation: (
      state,
      action: PayloadAction<Partial<typeof state.location>>
    ) => {
      state.location = { ...state.location, ...action.payload };
    },

    resetContentAndAudience: (state) => {
      state.contentAndAudience = initialState.contentAndAudience;
    },

    resetPersonalBio: (state) => {
      state.personalBio = initialState.personalBio;
    },

    resetLocation: (state) => {
      state.location = initialState.location;
    },

    resetReferralSource: (state) => {
      state.referralSource = initialState.referralSource;
    },

    resetAll: (state) => {
      return { ...initialState }; // Create a new object to avoid mutating state directly
    },
  },
});

export const {
  // createPlatformData,
  // updatePlatformData,
  // updatePlatformDataDemographics,
  // resetSelectedPlatforms,
  // resetPlatforms,
  setInfluencerAdditionalInfo,
  updateContentAndAudience,
  updateLocation,
  resetContentAndAudience,
  resetPersonalBio,
  resetLocation,
  resetReferralSource,
  resetAll,
} = influencerAdditionalInfoSlice.actions;
export default influencerAdditionalInfoSlice.reducer;
