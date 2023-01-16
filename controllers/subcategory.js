const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllSubCategories = factory.getAll(SubCategory);

exports.getSingleSubCategory = factory.getSingleOne(SubCategory, 'parent');

exports.deleteSubCategory = factory.deleteOne(SubCategory);

exports.updateSubCategory = factory.updateOne(SubCategory);

exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const {
    body: { name, parent },
  } = req;

  if (!parent)
    return next(new AppError('Please enter a parent category.', 400));

  const isSubCategoryExisted = await SubCategory.findOne({ name });

  if (isSubCategoryExisted)
    return next(new AppError('Category is already created', 400));

  const isCategoryExisted = await Category.findById(parent);

  if (!isCategoryExisted)
    return next(new AppError(`Category with ${parent} was not found`, 404));

  const newSubCategory = await SubCategory.create({
    name,
    parent: isCategoryExisted._id,
  });

  return res.status(201).json({
    status: 'success',
    data: {
      subCategory: newSubCategory,
    },
  });
});
