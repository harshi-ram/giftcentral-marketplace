import React from 'react';
import socket from '../utils/socket';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { toast } from 'react-toastify';
import SearchBox from './SearchBox';
import { incrementGiftRequestCount, setGiftRequestCount } from '../slices/giftRequestsReceivedSlice';
import { setMailboxUpdates, addMailboxUpdate, markMailboxRead, incrementMailbox } from '../slices/mailboxSlice';
import { resetCart } from '../slices/cartSlice';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log('userInfo in Header:', userInfo);
  const { giftRequestCount } = useSelector((state) => state.giftRequestsReceived);
  const { count: mailboxCount } = useSelector((state) => state.mailbox);


useEffect(() => {
  if (!userInfo) return;
  console.log("➡️ Emitting joinUser for:", userInfo.userId);

  socket.emit("joinUser", userInfo.userId);

  socket.on("giftRequest:new", (request) => {
    console.log("🔔 Received gift request via socket", request);
    dispatch(incrementGiftRequestCount());
  });

  return () => {
    console.log("🧹 Cleaning up giftRequest:new listener");
    socket.off("giftRequest:new");
  };
}, [userInfo, dispatch]);


useEffect(() => {
  if (!userInfo) return;
  
  axios.get('/api/v1/gift-requests/received', {
    withCredentials: true
  })
  .then(res => {
    dispatch(setGiftRequestCount(res.data.giftRequestCount));
  })
  .catch(err => console.error(err));

}, [userInfo, dispatch]);

useEffect(() => {
  if (!userInfo) return;

  socket.emit("joinUser", userInfo.userId);

  const handleMailbox = (update) => {
    console.log("📩 New mailbox notification:", update);

    dispatch(addMailboxUpdate(update));
  };

  socket.on("mailbox:new", handleMailbox);

  axios
    .get("/api/v1/gift-requests/mailbox", {
      withCredentials: true
    })
    .then((res) => dispatch(setMailboxUpdates(res.data)))
    .catch((err) => console.error(err));

  return () => {
    socket.off("mailbox:new", handleMailbox);
  };
}, [userInfo, dispatch]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
      toast.success('Logout successful');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const categories = [
    'Drinkware',
    'Clothing',
    'Jewelry',
    'Home Decor',
    'Stationery',
    'Technology',
    'Accessories',
    'Toys and Games',
    'Photo Gifts',
    'Crafted Items'
  ];

  const totalCount = giftRequestCount + mailboxCount;

  return (
    <div className='w-100 px-3 py-2 bg-transparent'>
      <Navbar
        expand='md'
        bg='white'
        className='rounded-4 px-4 py-3 border border-light-subtle mx-auto'
        style={{
          maxWidth: '1400px',
          boxShadow: '0 4px 12px rgb(194, 231, 210)',
        }}
      >
        <Container fluid>
          <div className='d-flex align-items-center gap-3'>
            <LinkContainer to='/'>
              <Navbar.Brand className='fw-bold text-success fs-4 mb-0'>GiftCentral</Navbar.Brand>
            </LinkContainer>

            <NavDropdown
              title='Categories'
              id='categories-dropdown'
              className='px-3 py-1 rounded-pill'
              style={{
                border: '1px solid #ffc0cb',
                backgroundColor: 'white',
              }}
            >
              {categories.map((category) => (
                <LinkContainer
                  key={category}
                  to={`/category/${category}`}
                >
                  <NavDropdown.Item>{category}</NavDropdown.Item>
                </LinkContainer>
              ))}
            </NavDropdown>
          </div>

          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto align-items-center gap-2'>
              <SearchBox />

              <LinkContainer to='/cart'>
                <Nav.Link className='bg-light rounded-pill px-3'>
                     <FaShoppingCart className='me-1 text-secondary' />
                      Cart
                     {cartItems.length > 0 && (
                    <Badge
                    pill
                    className='ms-2 text-dark'
                    bg=""
                    style={{ 
                    fontSize: '0.75rem',
                    backgroundColor: '#ffc0cb', 
                    color: 'black'
                    }}
                    >
                   {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </Badge>
                 )}
              </Nav.Link>
            </LinkContainer>


              {userInfo ? (
                <NavDropdown
                  title={<span className='text-dark'>{userInfo.name}
                        {totalCount > 0 && (
                      <Badge bg="danger" pill className="ms-2">
                         {totalCount}
                     </Badge>
                  )}
                  
                  </span>}
                  id='username'
                >
                  <LinkContainer to={`/users/${userInfo.name}`}>
                    <NavDropdown.Item>My Profile</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/add-product'>
                    <NavDropdown.Item>Add Listing</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/manage-listings'>
                    <NavDropdown.Item>Manage My Listings</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/gift-requests'>
                    <NavDropdown.Item>Gift Requests{" "}
                   {giftRequestCount > 0 && (
                    <Badge bg="danger" pill className="ms-2">
                       {giftRequestCount}
                    </Badge>
                    )}</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/mailbox'>
                    <NavDropdown.Item>Mailbox{" "}
                    {mailboxCount > 0 && (
                   <Badge bg="danger" pill className="ms-2">
                      {mailboxCount}
                    </Badge>
                    )}
                   </NavDropdown.Item>
                  </LinkContainer>
                  
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <LinkContainer to='/login'>
                    <Nav.Link className='bg-light rounded-pill px-3'>Login</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/signup'>
                    <Nav.Link className='bg-light rounded-pill px-3'>Signup</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
