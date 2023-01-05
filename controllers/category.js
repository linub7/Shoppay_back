const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllCategories = factory.getAll(Category);

exports.getSingleCategory = factory.getSingleOne(Category);

exports.deleteCategory = factory.deleteOne(Category);

exports.updateCategory = factory.updateOne(Category);

exports.createCategory = asyncHandler(async (req, res, next) => {
  const {
    body: { name },
  } = req;

  const isCategoryExisted = await Category.findOne({ name });

  if (isCategoryExisted)
    return next(new AppError('Category is already created', 400));

  const newCategory = await Category.create({ name });

  return res.status(201).json({
    status: 'success',
    data: {
      category: newCategory,
    },
  });
});
