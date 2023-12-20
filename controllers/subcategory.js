const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.getAllSubCategories = factory.getAll(SubCategory, 'parent');

exports.getSingleSubCategory = factory.getSingleOne(SubCategory, 'parent');

exports.deleteSubCategory = factory.deleteOne(SubCategory);

exports.updateSubCategory = factory.updateOne(SubCategory);

exports.createSubCategory = asyncHandler(async (req, res, next) => {
  const {
    body: { name, parent },
  } = req;

  if (!parent)
    return next(new AppError('Please enter a parent category.', 400));
  //TODO: solve slug unique in every subs
  const isSubCategoryExisted = await SubCategory.findOne({ name, parent });

  if (isSubCategoryExisted)
    return next(new AppError('SubCategory is already created', 400));

  const isCategoryExisted = await Category.findById(parent);

  if (!isCategoryExisted)
    return next(new AppError(`SubCategory with ${parent} was not found`, 404));

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

exports.getSubCategoriesBasedOneCategory = asyncHandler(
  async (req, res, next) => {
    const {
      params: { categoryId },
    } = req;

    const subCategories = await SubCategory.find({ parent: categoryId }).select(
      'name'
    );

    return res.json({
      status: 'success',
      data: {
        data: subCategories,
      },
    });
  }
);
