import { openChat } from '../slices/openChatsSlice';
import { markConversationRead } from '../slices/chatSlice';
import axios from 'axios';
import store from '../store';

export const openConversationWidget = (dispatch, conversation) => {
  dispatch(openChat(conversation));
  dispatch(markConversationRead(conversation._id));
};

export const startOrOpenChat = async (conversation, dispatch) => {
    console.log("Opening the chat:", conversation._id);

    const state = store.getState();
    const alreadyOpen = state.openChats.openChats.some(c => c._id === conversation._id);
    
    if (!alreadyOpen) {
        dispatch(openChat(conversation));
    } else {
        console.log(`Chat ${conversation._id} already open.`);
    }

    try {
        await axios.put(`/api/v1/messages/${conversation._id}/read`, {}, {
            withCredentials: true 
        });
        dispatch(markConversationRead(conversation._id));
    } catch (err) {
        console.error("Failed to mark conversation as read:", err);
    }
};
