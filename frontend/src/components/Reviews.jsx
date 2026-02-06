import React from 'react';
import Message from './Message';
import { Link } from 'react-router-dom';
import { Button, Form, ListGroup } from 'react-bootstrap';
import Rating from './Rating';

const Reviews = ({
  product,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  loading,
  handleDeleteReview,
}) => {
  console.log('UserInfo inside Reviews:', userInfo);

  console.log('UserInf ID:', userInfo?.userId);

  return (
    <>
      <h2>Reviews</h2>
      {product.reviews.length === 0 && <Message>No Reviews</Message>}
      <ListGroup variant='flush'>
        {product.reviews.map((review) => {
          console.log('UserInfo ID:', userInfo?._id);
          console.log('Review User:', review.user);

          return (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating value={review.rating} />
              <p>{new Date(review.createdAt).toDateString()}</p>
              <p>{review.comment}</p>
              {userInfo &&
               (() => {
                 console.log('Review._id:', review._id);
                 console.log('Review.user:', review.user);
                 console.log('userInfo.userId:', userInfo.userId);

                 return (userInfo.userId === (review.user?.userId || review.user) || userInfo.isAdmin);
                 })() && (
                  <Button
                      variant='danger'
                      size='sm'
                      onClick={() => handleDeleteReview(review._id)}
                      className='mt-2'
                  >
                   Delete
                  </Button>
              )}

              
            </ListGroup.Item>
          );
        })}
        <ListGroup.Item>
          <h2>Write a Customer Review</h2>

          {userInfo ? (
            <Form onSubmit={submitHandler}>
              <Form.Group className='my-2' controlId='rating'>
                <Form.Label>Rating</Form.Label>
                <Form.Control
                  as='select'
                  required
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value=''>Select...</option>
                  <option value='1'>1 - Poor</option>
                  <option value='2'>2 - Fair</option>
                  <option value='3'>3 - Good</option>
                  <option value='4'>4 - Very Good</option>
                  <option value='5'>5 - Excellent</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className='my-2' controlId='comment'>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></Form.Control>
              </Form.Group>
              <Button
                className='w-100'
                disabled={loading}
                type='submit'
                variant='warning'
                style={{backgroundColor: '#fce4ec', borderColor: '#fce4ec'}}
              >
                Submit
              </Button>
            </Form>
          ) : (
            <Message>
              Please <Link to='/login'>sign in</Link> to write a review
            </Message>
          )}
        </ListGroup.Item>
      </ListGroup>
    </>
  );
};

export default Reviews;