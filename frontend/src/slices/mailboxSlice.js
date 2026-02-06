import { createSlice } from '@reduxjs/toolkit';

const mailboxSlice = createSlice({
  name: 'mailbox',
  initialState: {
    count: 0,
    updates: [],
  },
  reducers: {
    setMailboxUpdates: (state, action) => {
      state.updates = action.payload;
      state.count = action.payload.filter(u => !u.read).length;
    },
    addMailboxUpdate: (state, action) => {
      state.updates.unshift(action.payload);
      state.count += 1;
    },
    markMailboxRead: (state) => {
      state.count = 0;
      state.updates = state.updates.map(u => ({ ...u, read: true }));
    },
    
    incrementMailbox: (state) => {
      state.count += 1;
    },
    resetMailboxCount: (state) => {
      state.count = 0;
    },
  },
});

export const { 
  setMailboxUpdates, 
  addMailboxUpdate, 
  markMailboxRead, 
  incrementMailbox,
  resetMailboxCount
} = mailboxSlice.actions;

export default mailboxSlice.reducer;