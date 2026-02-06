import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addCurrency } from '../utils/addCurrency';
import { addToCart } from '../slices/cartSlice';
import Rating from './Rating';

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addToCartHandler = (e) => {
    e.preventDefault(); 
    dispatch(addToCart({ ...product, qty: 1 }));
    navigate('/cart');
  };

  return (
    <Card className='my-3 p-1 rounded product-card shadow-sm'>
      <Link to={`/product/${product._id}`} className='text-decoration-none'>
        <div className="img-container p-2">
          <Card.Img
            src={product.image}
            variant='top'
            style={{ height: '180px', objectFit: 'contain' }}
          />
        </div>

        <Card.Body className="d-flex flex-column align-items-center">
          <Card.Title as='div' className='product-title mb-2'>
            <strong className="text-dark">{product.name}</strong>
          </Card.Title>

          <div className='mb-2'>
            <Rating value={product.rating} text={`${product.numReviews}`} />
          </div>

          <Card.Text as='h4' className="mb-3" style={{ color: '#e91e63', fontWeight: 'bold' }}>
            {addCurrency(product.price)}
          </Card.Text>

          <Button
            className='w-100 mt-auto'
            variant='outline-primary'
            disabled={product.countInStock === 0}
            onClick={addToCartHandler}
            style={{ 
              backgroundColor: '#fce4ec', 
              color: '#000000', 
              border: '1px solid #fce4ec'
            }}
          >
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </Card.Body>
      </Link>
    </Card>
  );
};

export default Product;