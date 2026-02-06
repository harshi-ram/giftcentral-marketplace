import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import ChatWidget from './ChatWidget';
import { markConversationRead, incrementUnread, reorderConversations } from '../slices/chatSlice';
import socket from '../utils/socket';
import { closeChat } from '../slices/openChatsSlice';
import { startOrOpenChat } from '../utils/chatHelpers';

const ChatBar = () => {
  const { conversations } = useSelector((state) => state.chat);
  const { userInfo: user } = useSelector((state) => state.auth);
  const openChats = useSelector((state) => state.openChats.openChats);

  console.log("Rendering openChats in ChatBar:", openChats.map(c => c._id));

  const dispatch = useDispatch();
  const [showChatBar, setShowChatBar] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket.emit('join', user.userId);
    conversations.forEach(conv => {
      socket.emit('joinConversation', conv._id);
    });

    const handleReceiveMessage = async (message) => {
      console.log('Received message:', message);

      const isOpenInRedux = openChats.some(c => c._id === message.conversationId);

      if (!isOpenInRedux) {
        dispatch(incrementUnread(message.conversationId));
      } else {
        try {
          await axios.put(`/api/v1/messages/${message.conversationId}/read`, {}, {
            withCredentials: true 
          });
          dispatch(markConversationRead(message.conversationId));
        } catch (error) {
          console.error("Failed to mark conversation as read:", error);
        }
      }

      dispatch(reorderConversations(message.conversationId));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [user, conversations, openChats, dispatch]);

  const handleOpenChat = async (conversation) => {
    console.log('Opening chat for conversation:', conversation._id);
    startOrOpenChat(conversation, dispatch);
    console.log("🛠 Dispatch openChat from ChatBar", conversation);
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  const barRef = useRef(null);

  const styles = {
    container: {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 9999
    },
    button: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '10px 20px',
      fontSize: '1rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      width: '120px',
      textAlign: 'left',
      paddingLeft: '15px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },
    buttonHover: {
      backgroundColor: '#218838'
    },
    list: {
      backgroundColor: '#ffffff',
      padding: '10px',
      borderRadius: '8px',
      maxHeight: '300px',
      overflowY: 'auto',
      width: '200px',
      border: '1px solid #ccc',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    },
    close: {
      textAlign: 'right'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer'
    },
    empty: {
      fontSize: '0.9rem'
    },
    item: {
      cursor: 'pointer',
      padding: '0.25rem 0',
      fontSize: '0.9rem'
    },
    itemHover: {
      backgroundColor: '#f1f1f1'
    },
    badge: {
      backgroundColor: 'red',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      borderRadius: '50%',
      padding: '2px 6px',
      marginLeft: '8px'
    },
    itemBadge: {
      backgroundColor: 'red',
      color: 'white',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      borderRadius: '50%',
      padding: '2px 5px',
      marginLeft: '6px'
    }
  };

  return (
    <div style={styles.container} ref={barRef}>
      {!showChatBar && (
        <button
          style={styles.button}
          onClick={() => setShowChatBar(true)}
        >
          Chat
          {totalUnread > 0 && <span style={styles.badge}>{totalUnread}</span>}
        </button>
      )}

      {showChatBar && (
        <div style={styles.list}>
          <div style={styles.close}>
            <button style={styles.closeButton} onClick={() => setShowChatBar(false)}>✖</button>
          </div>

          {conversations.length === 0 && (
            <p style={styles.empty}>No chats yet</p>
          )}

          {conversations.map((conv) => {
            const participant = conv.members.find(p => p?._id !== user.userId);
            return (
              <div
                key={conv._id}
                style={styles.item}
                onClick={() => handleOpenChat(conv)}
              >
                {participant?.name || 'Unknown'}
                {conv.unreadCount > 0 && (
                  <span style={styles.itemBadge}>{conv.unreadCount}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {user && openChats.map(conv => (
        <ChatWidget
          key={conv._id}
          conversation={conv}
          currentUserId={user.userId}
          onClose={() => dispatch(closeChat(conv._id))}
          anchorRef={barRef}
        />
      ))}
    </div>
  );
};

export default ChatBar;
