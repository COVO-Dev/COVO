import { createSlice } from "@reduxjs/toolkit";
import { IInitialState } from "./model.model";

const initialState: IInitialState = {
	isOpen: false,
	modelId: "",
};

const modelSlice = createSlice({
	name: "model",
	initialState,
	reducers: {
		openModel: (state, payload) => {
			state.isOpen = true;
			state.modelId = payload.payload;
		},
		closeModel: (state) => {
			state.isOpen = false;
		},
	},
});

export const { openModel, closeModel } = modelSlice.actions;

export default modelSlice.reducer;
