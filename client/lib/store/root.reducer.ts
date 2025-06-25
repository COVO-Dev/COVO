import { combineReducers } from "@reduxjs/toolkit";
import ModelReducer from "./model/model.slice";
import ProfileReducer from "./profile/profile.slice";
import CampaignReducer from "./campaign/campaign.slice";
import influencerAdditionalInfoSlice from "./additional-info/influencerAdditionalInfo.slice";

export const rootReducer = combineReducers({
	profile: ProfileReducer,
	model: ModelReducer,
	campaign: CampaignReducer,
	influencerAdditionalInfo: influencerAdditionalInfoSlice
});
