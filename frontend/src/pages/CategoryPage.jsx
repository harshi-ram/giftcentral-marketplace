import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';

import Loader from '../components/Loader';
import Message from '../components/Message';
import Product from '../components/Product';
import Paginate from '../components/Paginate';



const CategoryPage = () => {
  const { categoryName } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 4; 
  const skip = (currentPage - 1) * limit;

  const [sortOrder, setSortOrder] = useState('Newest');

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    limit,
    skip,
    search: '',
    category: categoryName,
    sortOrder,
  });

  const total = data?.total || 0;
  const totalPage = Math.ceil(total / limit);

  const pageHandler = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPage && pageNum !== currentPage) {
      setCurrentPage(pageNum);
    }
  };
  useEffect(() => {
    setCurrentPage(1); 
    refetch();
  }, [categoryName, sortOrder, refetch]);

  return (
    <div className="container py-4">
      <h2 className="mb-3 text-capitalize">
        {categoryName.replace(/-/g, ' ')}
      </h2>

      <Row className="align-items-center mb-3">
        <Col md={3}>
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="PriceLowToHigh">Price: Low to High</option>
            <option value="PriceHighToLow">Price: High to Low</option>
          </select>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : data?.products?.length === 0 ? (
        <Message>No products found in this category.</Message>
      ) : (
        <>
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>

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

export default CategoryPage;
