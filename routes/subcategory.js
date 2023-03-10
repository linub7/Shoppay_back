const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  getAllSubCategories,
  createSubCategory,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesBasedOneCategory,
} = require('../controllers/subcategory');
const factory = require('../controllers/handlerFactory');

const { protect, getMe, authorize } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router.param('categoryId', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router
  .route('/subcategories')
  .get(getAllSubCategories)
  .post(protect, authorize('admin'), createSubCategory);

router
  .route('/subcategories/categories/:categoryId')
  .get(protect, authorize('admin'), getSubCategoriesBasedOneCategory);

router
  .route('/subcategories/:id')
  .get(protect, authorize('admin'), getSingleSubCategory)
  .patch(protect, authorize('admin'), updateSubCategory)
  .delete(protect, authorize('admin'), deleteSubCategory);

module.exports = router;
