import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import {
  useCreateProductMutation,
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation
} from '../slices/productsApiSlice';

import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

const UserProductEditPage = () => {
  const { id: productId } = useParams();
  const isUpdateMode = !!productId;
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(0);
  const [countInStock, setCountInStock] = useState(0);

  const {
    data: product,
    isLoading,
    error
  } = useGetProductDetailsQuery(productId, { skip: !isUpdateMode });

  const [createProduct, { isLoading: isCreateLoading }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdateLoading }] =
    useUpdateProductMutation();
  const [uploadProductImage, { isLoading: isUploadLoading }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isUpdateMode && product) {
      setName(product.name);
      setImage(product.image);
      setDescription(product.description);
      setBrand(product.brand);
      setCategory(product.category);
      setPrice(product.price);
      setCountInStock(product.countInStock);
    }
  }, [isUpdateMode, product]);

  const uploadFileHandler = async e => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      setImage(res.imageUrl);
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitHandler = async e => {
    e.preventDefault();

    const productData = {
      name,
      image,
      description,
      brand,
      category,
      price,
      countInStock
    };

    try {
      if (isUpdateMode) {
        const { data } = await updateProduct({ productId, ...productData });
        toast.success(data.message);
      } else {
        const { data } = await createProduct(productData);
        toast.success(data.message);
      }
      navigate('/manage-listings');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const goBackLink = '/manage-listings';

  return (
    <>
      <Meta title={isUpdateMode ? 'Edit Product' : 'Create Product'} />

      <Link to={goBackLink} className='btn btn-light my-3'>
        Go Back
      </Link>

      {(isCreateLoading || isUpdateLoading || isUploadLoading) && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <FormContainer>
          <h1>{isUpdateMode ? 'Edit Your Product' : 'Create New Product'}</h1>

          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Enter product name'
              />
            </Form.Group>

            <Form.Group controlId='price'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder='Enter price'
              />
            </Form.Group>

            <Form.Group controlId='image'>
              <Form.Label>Image</Form.Label>
              <Form.Control type='file' onChange={uploadFileHandler} />
            </Form.Group>

            {image && (
              <img
                src={image}
                alt='preview'
                style={{ width: '120px', marginTop: '10px' }}
              />
            )}

            <Form.Group controlId='brand'>
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type='text'
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder='Enter brand'
              />
            </Form.Group>

            <Form.Group controlId='countInStock'>
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type='number'
                value={countInStock}
                onChange={e => setCountInStock(e.target.value)}
                placeholder='Enter stock count'
              />
            </Form.Group>

            <Form.Group controlId='category'>
              <Form.Label>Category</Form.Label>
              <Form.Control
                as='select'
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value=''>-- Select a category --</option>
                <option value='Mugs & Drinkware'>Mugs & Drinkware</option>
                <option value='T-Shirts & Apparel'>T-Shirts & Apparel</option>
                <option value='Jewelry'>Jewelry</option>
                <option value='Home Decor'>Home Decor</option>
                <option value='Stationery'>Stationery</option>
                <option value='Phone & Tech Accessories'>Phone & Tech Accessories</option>
                <option value='Bags & Accessories'>Bags & Accessories</option>
                <option value='Toys & Games'>Toys & Games</option>
                <option value='Photo Gifts'>Photo Gifts</option>
                <option value='Crafted Items'>Crafted Items</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Enter description'
              />
            </Form.Group>

            <Button
              type='submit'
              style={{ backgroundColor: '#fce4ec', borderColor: '#fce4ec', color: '#000000',marginTop: '1rem' }}
            >
              {isUpdateMode ? 'Update Product' : 'Create Product'}
            </Button>
          </Form>
        </FormContainer>
      )}
    </>
  );
};

export default UserProductEditPage;