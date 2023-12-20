const { isValidObjectId } = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');
const { filterArray, removeDuplicates } = require('../utils/arrayUtils');

exports.getAllProducts = factory.getAll(Product);

exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  let {
    params: { id },
    query: { style, size },
  } = req;
  style = style || 0;
  size = size || 0;
  const product = await Product.findById(id);
  if (!product)
    return next(new AppError(`Product with ${id} was not found`, 404));
  const discount = product.subProducts[style].discount;
  const priceBefore = product.subProducts[style].sizes[size].price;
  const price = discount ? priceBefore - priceBefore / discount : priceBefore;
  return res.json({
    status: 'success',
    data: {
      data: {
        _id: product.name,
        style: Number(style),
        name: product.name,
        description: product.description,
        slug: product.slug,
        sku: product.subProducts[style].sku,
        brand: product.brand,
        category: product?.category,
        subCategories: product?.subCategories,
        shipping: product.shipping,
        images: product.subProducts[style].images,
        color: product.subProducts[style].color,
        size: product.subProducts[style].sizes[size].size,
        price,
        priceBefore,
        quantity: product.subProducts[style].sizes[size].qty,
      },
    },
  });
});

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.getProductsNameSub = asyncHandler(async (req, res, next) => {
  const products = await Product.find({}).select('name subProducts');
  return res.json({
    status: 'success',
    data: {
      data: products,
    },
  });
});

exports.uploadProductImages = asyncHandler(async (req, res, next) => {});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    body: {
      parent,
      sku,
      color,
      images,
      sizes,
      discount,
      name,
      description,
      brand,
      category,
      subCategories,
      details,
      questions,
    },
    user,
  } = req;

  if (parent) {
    const existedProduct = await Product.findById(parent);
    if (!existedProduct)
      return next(new AppError('Product was not found', 404));

    const updatedProduct = await Product.findByIdAndUpdate(
      parent,
      {
        $push: {
          subProducts: {
            sku,
            images,
            color,
            sizes,
            discount,
          },
        },
      },
      { new: true, runValidators: true }
    );
    return res.json({
      status: 'success',
      data: {
        data: 'product is updated successfully',
      },
    });
  } else {
    const newProduct = await Product.create({
      name,
      description,
      brand,
      user: user._id,
      category,
      subCategories,
      details,
      questions,
      subProducts: [
        {
          sku,
          images,
          color,
          sizes,
          discount,
        },
      ],
    });
    return res.json({
      status: 'success',
      data: {
        data: 'Product is created successfully.',
      },
    });
  }
});

exports.addReview = asyncHandler(async (req, res, next) => {
  const {
    params: { productId },
    body: { rating, review, size, style, fit, images },
    user,
  } = req;

  if (!isValidObjectId(productId))
    return next(new AppError('Please provide a valid id', 400));

  const product = await Product.findById(productId).populate(
    'reviews',
    'reviewBy'
  );

  if (!product) return next(new AppError('Product was not found', 404));

  const isAlreadyWroteReview = product?.reviews?.find(
    (review) => review?.reviewBy?.toString() === user?._id?.toString()
  );
  if (isAlreadyWroteReview) {
    await Product.findOneAndUpdate(
      {
        _id: productId,
        'reviews._id': isAlreadyWroteReview._id,
      },
      {
        $set: {
          'reviews.$.review': review,
          'reviews.$.fit': fit,
          'reviews.$.images': images,
          'reviews.$.size': size,
          'reviews.$.style': style,
          'reviews.$.rating': rating,
        },
      },
      { new: true, runValidators: true }
    );
    const updatedProduct = await Product.findById(productId).populate(
      'reviews'
    );
    updatedProduct.numReviews = updatedProduct?.reviews?.length;
    updatedProduct.rating =
      updatedProduct?.reviews?.reduce((a, r) => a + r.rating, 0) /
      updatedProduct.reviews?.length;
    await updatedProduct.save();

    return res.json({
      status: 'success',
      data: {
        data: updatedProduct.reviews.reverse(),
      },
    });
  } else {
    const newReview = await Review.create({
      reviewBy: user._id,
      fit,
      images,
      rating,
      review,
      size,
      style,
    });

    product?.reviews?.push(newReview);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, r) => a + r.rating, 0) /
      product.reviews.length;

    await product?.save();

    return res.json({
      status: 'success',
      data: {
        data: product.reviews.reverse(),
      },
    });
  }
});

exports.getProductsDetails = asyncHandler(async (req, res, next) => {
  const colors = await Product.find({}).distinct('subProducts.color.color');
  const brandsDb = await Product.find({}).distinct('brand');
  const sizes = await Product.find({}).distinct('subProducts.sizes.size');
  const details = await Product.find({}).distinct('details');
  const stylesDb = filterArray(details, 'Style');
  const patternTypeDb = filterArray(details, 'Pattern Type');
  const materialDb = filterArray(details, 'Material');
  const styles = removeDuplicates(stylesDb);
  const patternType = removeDuplicates(patternTypeDb);
  const material = removeDuplicates(materialDb);
  const brands = removeDuplicates(brandsDb);

  const payload = {
    colors,
    brands,
    sizes,
    details,
    styles,
    patternType,
    material,
  };

  return res.json({
    status: 'success',
    data: {
      data: payload,
    },
  });
});
