import { createSlice } from "@reduxjs/toolkit";
import { IInitialState } from "./campaign.model";
import { PayloadAction } from "@reduxjs/toolkit";
// import { faker } from "@faker-js/faker";

// Seeding function with the faker library
// function generateRandomCampaignData(): IInitialState {
//   const startDateRangeLowCallback = new Date();
//   const startDateRangeLow = startDateRangeLowCallback.toISOString();
//   const startDateRangeHighCallback = new Date(2025, 3, 30);
//   const startDateRangeHigh = startDateRangeHighCallback.toISOString();

//   const endDateRangeLowCallback = new Date(2025, 4, 1);
//   const endDateRangeLow = endDateRangeLowCallback.toISOString();
//   const endDateRangeHighCallback = new Date(2025, 11, 31);
//   const endDateRangeHigh = endDateRangeHighCallback.toISOString();
//   return {
//     // brandId: faker.string.uuid(),
//     title: faker.lorem.sentence(),
//     startDate: faker.date.between({
//       from: startDateRangeLow,
//       to: startDateRangeHigh,
//     }),
//     endDate: faker.date.between({
//       from: endDateRangeLow,
//       to: endDateRangeHigh,
//     }),
//     budgetRange: faker.number.int({ min: 1000, max: 10000 }),
//     targetAudience: faker.lorem.paragraph(),
//     primaryGoals: faker.helpers.arrayElements(
//       [
//         "Increase brand awareness",
//         "Drive sales",
//         "Generate leads",
//         "Improve engagement",
//       ],
//       { min: 1, max: 3 }
//     ),
//     influencerType: faker.helpers.arrayElement(["Micro", "Macro", "Celebrity"]),
//     geographicFocus: faker.helpers.arrayElement([
//       "Local",
//       "Regional",
//       "National",
//       "Global",
//     ]),
//     collaborationPreferences: {
//       hasWorkedWithInfluencers: faker.datatype.boolean(),
//       exclusiveCollaborations: faker.datatype.boolean(),
//       type: faker.helpers.arrayElement(["Long-term", "Short-term", "One-off"]),
//       styles: faker.helpers.arrayElements(
//         ["Authentic", "Humorous", "Informative", "Creative"],
//         { min: 1, max: 3 }
//       ),
//     },
//     trackingAndAnalytics: {
//       performanceTracking: faker.datatype.boolean(),
//       metrics: faker.helpers.arrayElements(
//         ["Impressions", "Engagement", "Reach", "Conversions", "Clicks"],
//         { min: 1, max: 4 }
//       ),
//       reportFrequency: faker.helpers.arrayElement([
//         "Weekly",
//         "Monthly",
//         "Quarterly",
//       ]),
//     },
//     status: faker.helpers.arrayElement(["active", "completed", "pending"]),
//     is_deleted: false,
//   };
// }

// const initialState = generateRandomCampaignData();
// console.log(initialState);

const initialState: IInitialState = {
  brandId: "",

  // Step 1
  title: "",
  startDate: new Date().toString(),
  endDate: new Date().toString(),
  budgetRange: 0,
  targetAudience: "",

  // Step 2
  primaryGoals: [],
  influencerType: "",
  geographicFocus: "",
  collaborationPreferences: {
    hasWorkedWithInfluencers: false,
    exclusiveCollaborations: false,
    type: "",
    styles: [],
  },

  // Step 3
  trackingAndAnalytics: {
    performanceTracking: true,
    metrics: [],
    reportFrequency: "",
  },
  status: "",

  is_deleted: false,
};

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    setCampaignData(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateCollaborationPreferences: (
      state,
      action: PayloadAction<Partial<IInitialState["collaborationPreferences"]>>
    ) => {
      state.collaborationPreferences = {
        ...state.collaborationPreferences,
        ...action.payload,
      };
    },
    updateTrackingAndAnalytics: (
      state,
      action: PayloadAction<Partial<IInitialState["trackingAndAnalytics"]>>
    ) => {
      state.trackingAndAnalytics = {
        ...state.trackingAndAnalytics,
        ...action.payload,
      };
    },
    resetFields() {
      return initialState;
    },
  },
});

export const {
  resetFields,
  setCampaignData,
  updateCollaborationPreferences,
  updateTrackingAndAnalytics,
} = campaignSlice.actions;
export default campaignSlice.reducer;
