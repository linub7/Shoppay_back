const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllProducts = factory.getAll(Product);

exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  const {
    params: { slug },
    query: { style, size },
  } = req;
  const product = await Product.findOne({ slug });
  if (!product)
    return next(new AppError(`Product with ${slug} was not found`, 404));
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

exports.createProduct = asyncHandler(async (req, res, next) => {});
