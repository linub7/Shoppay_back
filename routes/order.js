const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  placeOrder,
  getOrder,
  payWithStripe,
  getAllOrders,
  getAllUserOrders,
} = require('../controllers/order');
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

router.route('/orders').get(protect, authorize('admin'), getAllOrders);

router.route('/orders/:id').get(protect, getOrder);

router.post('/orders/:id/pay-with-stripe', protect, payWithStripe);

router.post('/orders/place-order', protect, placeOrder);

router.route('/user/orders').get(protect, getAllUserOrders);

module.exports = router;
