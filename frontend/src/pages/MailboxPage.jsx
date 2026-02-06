import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ListGroup, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { resetMailboxCount, markMailboxRead } from '../slices/mailboxSlice';
import Paginate from '../components/Paginate';

const MailboxPage = () => {
  const dispatch = useDispatch();
  const [updates, setUpdates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 

  useEffect(() => {
    axios.patch('/api/v1/gift-requests/mailbox/mark-read', {})
      .then(() => dispatch(markMailboxRead()));
    dispatch(resetMailboxCount());
  }, [dispatch]);
  useEffect(() => {
  const fetchMailbox = async () => {
    try {
      const { data } = await axios.get(`/api/v1/gift-requests/mailbox?pageNumber=${currentPage}`);
      setUpdates(data.items); 
      setTotalPages(data.pages); 
    } catch (err) {
      console.error("Error fetching mailbox:", err);
    }
  };
  fetchMailbox();
}, [currentPage]); 

  const pageHandler = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4">
      <h2>Mailbox</h2>

      {updates.length === 0 ? (
        <p>No updates yet.</p>
      ) : (
        <>
          <ListGroup>
            {updates.map((u, idx) => (
              <ListGroup.Item
                key={u._id || idx} 
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>Seller:</strong> {u.giftRequest.recipient.name} <br />
                  <strong>Description:</strong> {u.giftRequest.description} <br />
                  <strong>Budget:</strong> ₹{u.giftRequest.budget}
                </div>
                <Badge bg={u.type === 'accepted' ? 'success' : 'danger'}>
                  {u.type}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Paginate
            currentPage={currentPage}
            totalPage={totalPages}
            pageHandler={pageHandler}
          />
        </>
      )}
    </div>
  );
};

export default MailboxPage;

