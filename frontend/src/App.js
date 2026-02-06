import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import socket from './utils/socket';

import Header from './components/Header';
import Footer from './components/Footer';
import ChatBar from './components/ChatBar'; 
import { setConversations } from './slices/chatSlice'; 

import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const dispatch = useDispatch();
  const { userInfo: user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('/api/v1/messages/conversations', {
          withCredentials: true 
        });
        
        dispatch(setConversations(res.data));
        console.log('Fetched conversations:', res.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    if (user?.userId || user?._id) {
      fetchConversations();
    }
  }, [user, dispatch]);

  return (
    <div className='position-relative'>
      <Header />
      <main className='py-3'>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      <ToastContainer autoClose={1000} />
      {user && <ChatBar />}
    </div>
  );
};

export default App;