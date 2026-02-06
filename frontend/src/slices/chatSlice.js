import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    unreadCounts: {},
    currentChat: null,
    messages: [],
    
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    markConversationRead: (state, action) => {
    const convId = action.payload;
    const conv = state.conversations.find(c => c._id === convId);
    if (conv) conv.unreadCount = 0;
  },
  incrementUnread: (state, action) => {
    const convId = action.payload;
    const conv = state.conversations.find(c => c._id === convId);
    console.log('incrementUnread called for:', convId, 'Found conversation:', conv);
    if (conv) {
      conv.unreadCount = (conv.unreadCount || 0) + 1;
    }
  },
reorderConversations: (state, action) => {
  const conversationId = action.payload;
  const index = state.conversations.findIndex(c => c._id === conversationId);
  if (index > -1) {
    const [conversation] = state.conversations.splice(index, 1);
    state.conversations.unshift(conversation); // move to top
  }
}
  },
  
});

export const {
  setConversations,
  setCurrentChat,
  setMessages,
  addMessage,
  markConversationRead,
  incrementUnread,
  reorderConversations,
} = chatSlice.actions;

export default chatSlice.reducer;

