import React, { useState, useRef, useEffect } from 'react';
import socket from '../utils/socket';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ChatWidget = ({ onClose, conversation, currentUserId, anchorRef }) => {
  const conversationId =
    typeof conversation === 'string' ? conversation : conversation?._id;

  const { userInfo: user } = useSelector((state) => state.auth);

  const otherUser = conversation?.members?.find(
    (p) => p?._id !== (currentUserId || user.userId)
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const bodyRef = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (anchorRef && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      
      setPosition({
        x: rect.left - 310, 
        y: rect.bottom - 400
      });
    }
  }, [anchorRef]);

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = e.currentTarget.parentNode.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset]);
  const formatDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();

    const time = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return isToday
      ? `Today • ${time}`
      : `${dateObj.toLocaleDateString()} • ${time}`;
  };

  useEffect(() => {
    if (conversationId) {
      socket.emit('joinConversation', conversationId);
    }
  }, [conversationId]);

  const fetchMessages = async (pageNum = 1) => {
    if (!conversationId || loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/v1/messages/${conversationId}?page=${pageNum}&limit=10`,
        { credentials: 'include' } 
      );
      const data = await res.json();

      const formatted = data.messages.map((msg) => ({
        text: msg.text,
        sender:
          msg.sender?._id === currentUserId ? 'You' : otherUser?.name || 'Them',
        time: formatDateTime(msg.createdAt),
      }));

      setMessages((prev) =>
        pageNum === 1 ? formatted : [...formatted, ...prev]
      );

      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [conversationId]);

  const handleScroll = () => {
    if (!bodyRef.current) return;
    if (bodyRef.current.scrollTop === 0 && hasMore && !loading) {
      fetchMessages(page + 1);
    }
  };

useEffect(() => {
  if (bottomRef.current) {
    const container = bottomRef.current.parentElement;
    if (container) {
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}, [messages]);
useEffect(() => {
  if (messages.length > 0 && page === 1) {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
  }
}, [messages.length, page]);
  useEffect(() => {
    const handleReceive = (message) => {
      if (message.conversationId !== conversationId) return;
      if (message.sender === currentUserId) return;

      setMessages((prev) => [
        ...prev,
        {
          text: message.text,
          sender: otherUser?.name || 'Them',
          time: formatDateTime(new Date()),
        },
      ]);
    };

    socket.on('receiveMessage', handleReceive);
    return () => socket.off('receiveMessage', handleReceive);
  }, [conversationId, currentUserId, otherUser]);
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { text: input, sender: 'You', time: formatDateTime(new Date()) },
    ]);

    try {
      await axios.post(
        '/api/v1/messages',
        { text: input, conversationId },
        { withCredentials: true } 
      );

      socket.emit('sendMessage', {
        text: input,
        conversationId,
        sender: currentUserId,
      });
    } catch (err) {
      console.error('Send failed:', err);
    }

    setInput('');
  };

  const styles = {
    container: {
      position: 'fixed',
      left: position.x,
      top: position.y,
      width: 300,
      maxHeight: 400,
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999,
      visibility: position.x === 0 ? 'hidden' : 'visible',
    },
    header: {
      background: '#4caf50',
      color: '#fff',
      padding: 10,
      cursor: 'move',
      display: 'flex',
      justifyContent: 'space-between',
    },
    body: {
      flexGrow: 1,
      overflowY: 'auto',
      padding: 10,
    },
    footer: {
      display: 'flex',
      padding: 8,
      gap: 5,
      borderTop: '1px solid #ccc',
    },
    input: { flex: 1, padding: 6 },
    sendBtn: { background: '#4caf50', color: '#fff', border: 'none' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} onMouseDown={handleMouseDown}>
        {otherUser?.name || 'Chat'}
        <button onClick={onClose}>×</button>
      </div>

      <div style={styles.body} ref={bodyRef} onScroll={handleScroll}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent:
                msg.sender === 'You' ? 'flex-end' : 'flex-start',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                background:
                  msg.sender === 'You' ? '#d1ffda' : '#f1f1f1',
                padding: 8,
                borderRadius: 10,
                maxWidth: '70%',
              }}
            >
              <strong>{msg.sender}:</strong> {msg.text}
              <div style={{ fontSize: 10 }}>{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.footer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button style={styles.sendBtn} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;