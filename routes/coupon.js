const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  createCoupon,
  getAllCoupons,
  applyCoupon,
  getSingleCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/coupon');

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
  .get(protect, authorize('admin'), getAllCoupons)
  .post(protect, authorize('admin'), createCoupon);

router.post('/coupons/apply-coupon', protect, applyCoupon);

router
  .route('/coupons/:id')
  .get(getSingleCoupon)
  .patch(protect, authorize('admin'), updateCoupon)
  .delete(protect, authorize('admin'), deleteCoupon);

module.exports = router;
