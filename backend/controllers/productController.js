import Product from '../models/productModel.js';
import { deleteFile } from '../utils/file.js';

const getProducts = async (req, res, next) => {
  try {
    const maxLimit = process.env.PAGINATION_MAX_LIMIT;
    const limit = Number(req.query.limit) || maxLimit;
    const skip = Number(req.query.skip) || 0;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = {
      name: { $regex: search, $options: 'i' },
    };

    if (category) {
      query.category = category;
    }

    const sortOrder = req.query.sortOrder || 'Newest';
    let sortOption = { createdAt: -1 };
    if (sortOrder === 'Oldest') sortOption = { createdAt: 1 };
    else if (sortOrder === 'PriceLowToHigh') sortOption = { price: 1 };
    else if (sortOrder === 'PriceHighToLow') sortOption = { price: -1 };

    const total = await Product.countDocuments(query);
    const maxSkip = total === 0 ? 0 : total - 1;

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit > maxLimit ? maxLimit : limit)
      .skip(skip > maxSkip ? maxSkip : skip < 0 ? 0 : skip);

    res.status(200).json({
      products,
      total, 
      maxLimit,
      maxSkip,
    });
  } catch (error) {
    next(error);
  }
};


const getUserProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const skip = Number(req.query.skip) || 0;

    const query = { user: req.user._id };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 }) 
      .limit(limit)
      .skip(skip);

    res.json({
      products,
      total,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);

    if (!products) {
      res.statusCode = 404;
      throw new Error('Product not found!');
    }

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findById(productId).populate('user', 'name');

    if (!product) {
      res.statusCode = 404;
      throw new Error('Product not found!');
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, image, description, brand, category, price, countInStock } =
      req.body;
    console.log(req.file);
    const product = new Product({
      user: req.user._id,
      name,
      image,
      description,
      brand,
      category,
      price,
      countInStock
    });
    const createdProduct = await product.save();

    res.status(200).json({ message: 'Product created', createdProduct });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { name, image, description, brand, category, price, countInStock } =
      req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Product not found!');
    }

    const previousImage = product.image;

    product.name = name || product.name;
    product.image = image || product.image;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.price = price || product.price;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();

    if (previousImage && previousImage !== updatedProduct.image) {
      deleteFile(previousImage);
    }

    res.status(200).json({ message: 'Product updated', updatedProduct });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Product not found!');
    }
    await Product.deleteOne({ _id: product._id });
    deleteFile(product.image); 

    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

const createProductReview = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Product not found!');
    }

    const alreadyReviewed = product.reviews.find(
      review => review.user._id.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.statusCode = 400;
      throw new Error('Product already reviewed');
    }

    const review = {
      user: req.user,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews = [...product.reviews, review];

    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    next(error);
  }
};



const deleteProductReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    console.log('Params:', { productId, reviewId });

    const product = await Product.findById(productId);

    if (!product) {
      console.log('Product not found');
      res.status(404);
      throw new Error('Product not found');
    }

    console.log('Found product:', product.name);

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      console.log('Review not found in product');
      res.status(404);
      throw new Error('Review not found');
    }

    const deletedReview = product.reviews[reviewIndex];
    product.reviews.splice(reviewIndex, 1);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      (product.reviews.length || 1);

    await product.save();
    console.log('Deleted review:', deletedReview._id);

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};


export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview, 
  getTopProducts,
  getUserProducts
};