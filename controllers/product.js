const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllProducts = factory.getAll(Product);

exports.getSingleProduct = factory.getSingleOne(Product, [
  { path: 'user' },
  { path: 'category' },
  { path: 'subcategories' },
]);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.createProduct = asyncHandler(async (req, res, next) => {});
