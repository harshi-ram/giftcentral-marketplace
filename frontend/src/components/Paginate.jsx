import React from 'react';
import { Container, Pagination } from 'react-bootstrap';

const Paginate = ({ currentPage, totalPage, pageHandler }) => {
  const windowSize = 4;
  
  let startPage = currentPage;
  let endPage = Math.min(currentPage + windowSize - 1, totalPage);

  if (endPage - startPage < windowSize - 1) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <Container className='d-flex justify-content-center mt-5'>
      <style>{`
        .custom-active-page .page-link {
          background-color: #22c55e !important;
          border-color: #22c55e !important;
          color: white !important;
          box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
        }
        .page-link {
          color: #22c55e !important;
          border: 1px solid #22c55e !important;
          margin: 0 4px;
          border-radius: 6px !important;
        }
        .page-link:hover {
          background-color: #dcfce7 !important;
          text-decoration: none;
        }
        .page-item.disabled .page-link {
          color: #9ca3af !important;
          background-color: #f3f4f6 !important;
          border-color: #e5e7eb !important;
          cursor: not-allowed;
        }
      `}</style>

      <Pagination size='sm'>
        <Pagination.First
          onClick={() => pageHandler(1)}
          disabled={currentPage <= 1}
        >
          First
        </Pagination.First>
        
        <Pagination.Prev
          onClick={() => pageHandler(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Prev 
        </Pagination.Prev>

        {visiblePages.map((number) => (
          <Pagination.Item
            key={number}
            active={number === currentPage}
            onClick={() => pageHandler(number)}
            className={number === currentPage ? 'custom-active-page' : ''}
          >
            {number}
          </Pagination.Item>
        ))}

        <Pagination.Next
          onClick={() => pageHandler(currentPage + 1)}
          disabled={currentPage >= totalPage}
        >
          Next
        </Pagination.Next>
        
        <Pagination.Last
          onClick={() => pageHandler(totalPage)}
          disabled={currentPage >= totalPage}
        >
          Last
        </Pagination.Last>
      </Pagination>
    </Container>
  );
};

export default Paginate;