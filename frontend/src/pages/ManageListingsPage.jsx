import React, { useState } from 'react';
import { Button, Row, Col, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useGetMyProductsQuery, useDeleteProductMutation } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addCurrency } from '../utils/addCurrency';
import { Link, useNavigate } from 'react-router-dom';

const ManageListingsPage = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8; 
  const skip = (currentPage - 1) * limit;

 
  const { data, isLoading, error, refetch } = useGetMyProductsQuery({
    limit,
    skip,
  });

  const [deleteProduct, { isLoading: isDeleteProductLoading }] = useDeleteProductMutation();

  const deleteHandler = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId).unwrap();
        toast.success('Product deleted successfully');
        refetch(); 
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const pageHandler = (pageNum) => {
    setCurrentPage(pageNum);
  };


  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <Meta title={'Manage Listings'} />
          <h1>Manage Listings</h1>
        </Col>
        <Col className='text-end'>
          <Button 
            className='my-3' 
            onClick={() => navigate('/add-product')} 
            style={{ backgroundColor: '#fce4ec', borderColor: '#fce4ec', color: '#000000'}}
          >
            Add Product
          </Button>
        </Col>
      </Row>

      {isDeleteProductLoading && <Loader />}
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Row>
            {data.products && data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Card className='my-3 p-3 rounded'>
                  <Link to={`/product/${product._id}`}>
                    <Card.Img
                      src={product.image}
                      variant='top'
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  </Link>
                  <Card.Body>
                    <Card.Title as='div' className='product-title'>
                      <strong>{product.name}</strong>
                    </Card.Title>
                    <Card.Text as='h5'>
                      {addCurrency(product.price)}
                    </Card.Text>
                    <div className='d-flex justify-content-between mt-3'>
                      <LinkContainer to={`/product/update/${product._id}`}>
                        <Button variant='light' className='btn-sm'>
                          <FaEdit />
                        </Button>
                      </LinkContainer>

                      <Button
                        variant='light'
                        className='btn-sm'
                        onClick={() => deleteHandler(product._id)}
                      >
                        <FaTrash style={{ color: 'red' }} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <Paginate
              currentPage={currentPage}
              totalPage={totalPages}
              pageHandler={pageHandler}
            />
          )}
        </>
      )}
    </>
  );
};

export default ManageListingsPage;
