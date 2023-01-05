const SubCategory = require('../models/SubCategory');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllSubCategories = factory.getAll(SubCategory);

exports.getSingleSubCategory = factory.getSingleOne(SubCategory);

exports.deleteSubCategory = factory.deleteOne(SubCategory);

exports.updateSubCategory = factory.updateOne(SubCategory);

exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const {
    body: { name },
  } = req;

  const isSubCategoryExisted = await SubCategory.findOne({ name });

  if (isSubCategoryExisted)
    return next(new AppError('Category is already created', 400));

  const newSubCategory = await SubCategory.create({ name });

  return res.status(201).json({
    status: 'success',
    data: {
      category: newSubCategory,
    },
  });
});
