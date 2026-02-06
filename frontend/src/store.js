import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import cartSliceReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice';
import searchProductSliceReducer from './slices/searchProductSlice';
import searchUserReducer from './slices/searchUserSlice';
import chatReducer from './slices/chatSlice'; 
import openChatsReducer from './slices/openChatsSlice';
import giftRequestsReceivedReducer from './slices/giftRequestsReceivedSlice';
import giftRequestsSentReducer from './slices/giftRequestsSentSlice';
import mailboxReducer from './slices/mailboxSlice';
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, 
    cart: cartSliceReducer, 
    auth: authSliceReducer, 
    search: searchProductSliceReducer,
    searchUser: searchUserReducer,
    chat: chatReducer,
    openChats: openChatsReducer,
    giftRequestsReceived: giftRequestsReceivedReducer,
    giftRequestsSent: giftRequestsSentReducer,
    mailbox: mailboxReducer
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware) 
});

export default store;
