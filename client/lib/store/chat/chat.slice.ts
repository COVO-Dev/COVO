import { createSlice } from "@reduxjs/toolkit";
// import { IInitialState } from "./profile.model";

const chatInitialState: IInitialState = {
  socket: null,
  chatRooms: [],
  messages: [],
  selectedUser: null,
  activeChat: "",
  onlineUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  chatInitialState,
  reducers: {
    // setOnlineUsers(state, action) {
    //   state.onlineUsers = [...state.onlineUsers, action.payload];
    // },
    // removeOnlineUser(state, action) {
    //   state.onlineUsers = state.onlineUsers.filter(
    //     (user) => user !== action.payload
    //   );
    // },
    setSocket(state, action) {
      state.socket = action.payload;
    },
    resetFields() {
      return initialState;
    },
  },
});

export const { resetFields, setProfileData } = chatSlice.actions;
export default chatSlice.reducer;
