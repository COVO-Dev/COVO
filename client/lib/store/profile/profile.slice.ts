import { createSlice } from "@reduxjs/toolkit";
import { IInitialState } from "./profile.model";

const initialState: IInitialState = {
  id: "",
  access_token: "",
  email: "",
  firstName: "",
  lastName: "",
  username: "",
  role: "",
  consentAndAgreements: {
    termsAccepted: false,
    marketingOptIn: false,
    dataComplianceConsent: false,
  },
  isActive: false,
  isDeleted: false,
  selectedPlatforms: [],
  deactivated: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  platforms: {},
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileData(state, action) {
      return { ...state, ...action.payload };
    },
    resetFields() {
      return initialState;
    },
  },
});

export const { resetFields, setProfileData } = profileSlice.actions;
export default profileSlice.reducer;
