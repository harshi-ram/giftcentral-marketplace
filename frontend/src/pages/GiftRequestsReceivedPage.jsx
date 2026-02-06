import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReceivedGiftRequests,
  acceptGiftRequest,
  declineGiftRequest,
  markGiftRequestsAsRead,
} from '../slices/giftRequestsReceivedSlice';
import Paginate from '../components/Paginate';

const GiftRequestsReceivedPage = () => {
  const dispatch = useDispatch();
  const { received, loading, error } = useSelector(
    (state) => state.giftRequestsReceived
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; 
  const totalPage = Math.ceil(received.length / itemsPerPage);

  const paginatedData = received.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageHandler = (pageNum) => setCurrentPage(pageNum);

  useEffect(() => {
    dispatch(markGiftRequestsAsRead());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchReceivedGiftRequests());
  }, [dispatch]);

  const handleAccept = (id) => dispatch(acceptGiftRequest(id));
  const handleDecline = (id) => dispatch(declineGiftRequest(id));

  return (
    <div className="container mt-4">
      <h2 className="mb-4" style={{ color: '#000000ff' }}>
        Gift Requests Received
      </h2>

      {loading && <p style={{ color: '#22c55e' }}>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {received.length === 0 ? (
        <p style={{ color: '#198754' }}>No gift requests yet.</p>
      ) : (
        <>
          <ul className="list-group">
            {paginatedData.map((req) => (
              <li
                key={req._id}
                className="list-group-item d-flex justify-content-between align-items-start shadow-sm"
                style={{
                  borderLeft:
                    req.status === 'accepted'
                      ? '6px solid #198754'
                      : '6px solid #a3e635',
                  backgroundColor:
                    req.status === 'accepted' ? '#e9fce9' : '#f4fff4',
                }}
              >
                <div>
                  <p className="mb-1">
                    <strong>From:</strong> {req.sender?.name}
                  </p>
                  <p className="mb-1">
                    <strong>Description:</strong> {req.description}
                  </p>
                  <p className="mb-1">
                    <strong>Budget:</strong> ₹{req.budget}
                  </p>
                  <small className="text-muted">
                    {new Date(req.createdAt).toLocaleString()}
                  </small>
                </div>

                {req.status === 'pending' && (
                  <div className="d-flex flex-column gap-2">
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="btn btn-success btn-sm"
                      style={{ minWidth: '50px' }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleDecline(req._id)}
                      className="btn btn-danger btn-sm"
                      style={{ minWidth: '50px' }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <span className="badge bg-success align-self-center">
                    Accepted
                  </span>
                )}

                {req.status === 'declined' && (
                  <span className="badge bg-danger align-self-center">
                    Declined
                  </span>
                )}
              </li>
            ))}
          </ul>

          {totalPage > 1 && (
            <Paginate
              currentPage={currentPage}
              totalPage={totalPage}
              pageHandler={pageHandler}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GiftRequestsReceivedPage;
