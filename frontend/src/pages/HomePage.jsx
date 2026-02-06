import React, { useEffect, useState } from 'react';

import { Row, Col } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';


import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';


const HomePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(0);
  const [skip, setSkip] = useState(0);
  const { search } = useSelector(state => state.search);
  const { userResults, userLoading, userError } = useSelector((state) => state.searchUser);

  console.log('User search results:', userResults);


  const { category } = useParams();
  console.log('URL category:', category);


  const [sortOrder, setSortOrder] = useState('Newest');


  const { data, isLoading, error } = useGetProductsQuery({
    limit,
    skip,
    search,
    category,
    sortOrder
  });

  useEffect(() => {
    if (data) {
      setLimit(4);
      setSkip((currentPage - 1) * limit);
      setTotal(data.total);
      setTotalPage(Math.ceil(total / limit));
    }
  }, [currentPage, data, limit, total, search, sortOrder]);

  const pageHandler = pageNum => {
    if (pageNum >= 1 && pageNum <= totalPage && pageNum !== currentPage) {
      setCurrentPage(pageNum);
    }
  };

  console.log('Sending category:', category);


  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta />

          <center> <h1>WELCOME TO GIFTCENTRAL!</h1> </center>
          <Row className='align-items-center mb-3'>
             <Col md={3}>
               <select
               className='form-select'
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value)}
             >
               <option value='Newest'>Newest</option>
               <option value='Oldest'>Oldest</option>
               <option value="PriceLowToHigh">Price: Low to High</option>
               <option value="PriceHighToLow">Price: High to Low</option>
             </select>
           </Col>
         </Row>

        <h2>Gifts</h2>
        {isLoading ? (
           <Loader />
        ) : error ? (
           <Message variant="danger">{error?.data?.message || 'Failed to load products.'}</Message>
        ) : data?.products?.length === 0 ? (
           <Message variant="info">No products found.</Message>
        ) : (
           <Row>
       {data.products.map((product) => (
           <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
             <Product product={product} />
           </Col>
       ))}
      </Row>
       )}
        {totalPage > 1 && !search && (
          <Paginate
            currentPage={currentPage}
            totalPage={totalPage}
            pageHandler={pageHandler}
          />
        )}
        </>
      )}
    </>
  );
};

export default HomePage;
