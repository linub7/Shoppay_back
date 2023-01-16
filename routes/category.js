const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category');
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

router
  .route('/categories')
  .get(getAllCategories)
  .post(protect, authorize('admin'), createCategory);

router
  .route('/categories/:id')
  .get(protect, authorize('admin'), getSingleCategory)
  .patch(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
