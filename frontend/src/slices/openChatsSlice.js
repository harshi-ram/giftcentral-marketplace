import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openChats: [],
};

const openChatsSlice = createSlice({
  name: 'openChats',
  initialState,
  reducers: {
    openChat: (state, action) => {
  if (!Array.isArray(state.openChats)) {
    state.openChats = []; 
  }
  console.log("openChat reducer called with:", action.payload);
  console.log("action openchat reducer");
  const exists = state.openChats.some(c => c._id === action.payload._id);
  if (!exists) {
    state.openChats.push(action.payload);
  }
},

closeChat: (state, action) => {
  console.log("action close chat reducer");
  state.openChats = state.openChats.filter(c => c._id !== action.payload);
},

  
    closeAllChats: (state) => {
      console.log("action close all chats reducer");
      state.openChats = {};
    }
  }
});

export const { openChat, closeChat, closeAllChats } = openChatsSlice.actions;
export default openChatsSlice.reducer;