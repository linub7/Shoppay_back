const express = require('express');
const { isValidObjectId } = require('mongoose');
const { createCoupon, getAllCoupons } = require('../controllers/coupon');

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
  .route('/coupons')
  .get(getAllCoupons)
  .post(protect, authorize('admin'), createCoupon);

// router
//   .route('/categories/:id')
//   .get(getSingleCategory)
//   .patch(protect, authorize('admin'), updateCategory)
//   .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
