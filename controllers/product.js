const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllProducts = factory.getAll(Product);

exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  let {
    params: { id },
    query: { style, size },
  } = req;
  style = style || 0;
  size = size || 0;
  const product = await Product.findOne({ id });
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
