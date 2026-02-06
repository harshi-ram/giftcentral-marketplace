import React, { useState } from 'react';
import { Row, Col, ListGroup, Button, Image, Card, Form } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetProductDetailsQuery,
  useCreateProductReviewMutation,
  useDeleteReviewMutation,
} from '../slices/productsApiSlice';

import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addCurrency } from '../utils/addCurrency';
import Reviews from '../components/Reviews';

const ProductPage = () => {
  const { id: productId } = useParams();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { userInfo } = useSelector((state) => state.auth);
  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);
  
  const [createProductReview, { isLoading: isCreateProductReviewLoading }] = useCreateProductReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview({ productId, reviewId }).unwrap();
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await createProductReview({
        productId,
        rating,
        comment,
      }).unwrap();
      toast.success(res.message);
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <>
      <Meta title={product.name} description={product.description} />
      
      <Link to='/' className='btn btn-light my-3 border'>
        <i className='fas fa-arrow-left me-2'></i>Back to Results
      </Link>

      <Row className="gx-5">
        <Col lg={7}>
          <div className="bg-white p-3 rounded border text-center mb-4 shadow-sm">
            <Image 
                src={product.image} 
                alt={product.name} 
                fluid 
                className="rounded" 
                style={{ maxHeight: '500px', objectFit: 'contain' }} 
            />
          </div>
          
          <div className="mt-4">
            <hr />
            <Reviews
              product={product}
              userInfo={userInfo}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              loading={isCreateProductReviewLoading}
              submitHandler={submitHandler}
              handleDeleteReview={handleDeleteReview}
            />
          </div>
        </Col>

        <Col lg={5}>
          <ListGroup variant='flush' className="mb-4">
            <ListGroup.Item className="border-0 px-0">
              <h1 className="display-6" style={{ fontWeight: '600', fontSize: '2rem' }}>{product.name}</h1>
              <div className="d-flex align-items-center py-2">
                <Rating value={product.rating} text={`${product.numReviews} reviews`} />
              </div>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 px-0">
              <h3 className="fw-bold" style={{ color: '#e91e63' }}>{addCurrency(product.price)}</h3>
            </ListGroup.Item>

            <ListGroup.Item className="px-0">
              <p className="text-muted mb-1 fw-bold small text-uppercase">Description</p>
              <div className="lh-base" style={{ fontSize: '0.95rem', color: '#444' }}>
                {product.description}
              </div>
            </ListGroup.Item>

            <ListGroup.Item className="px-0 border-0">
              <span className="text-muted">Listed by: </span>
              <Link to={`/users/${product.user?.name}`} style={{color:'#22c55e'}} className="text-decoration-none fw-bold">
                {product.user?.name}
              </Link>
            </ListGroup.Item>
            
            <ListGroup.Item className="px-0 border-0">
              <span className="text-muted">Category: </span>
              <span className="badge bg-light text-dark border" dangerouslySetInnerHTML={{ __html: product.category }}></span>
            </ListGroup.Item>
          </ListGroup>

          <Card className="shadow-sm border-0 bg-light">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between mb-3">
                <span>Price:</span>
                <span className="fw-bold text-dark">{addCurrency(product.price)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Status:</span>
                <span className={product.countInStock > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                  {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                </span>
              </div>

              {product.countInStock > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span>Quantity:</span>
                  <Form.Control
                    as='select'
                    value={qty}
                    className="w-50 border-secondary-subtle"
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {[...Array(product.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </Form.Control>
                </div>
              )}

              <Button
                onClick={addToCartHandler}
                className='w-100 py-2 shadow-sm'
                type='button'
                disabled={product.countInStock === 0}
                style={{ 
                    backgroundColor: '#fce4ec', 
                    borderColor: '#fce4ec',
                    color: '#000000',
                    
                    
                }}
              >
                Add To Cart
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductPage;