const express = require('express');
const { isValidObjectId } = require('mongoose');
const { placeOrder } = require('../controllers/order');
const factory = require('../controllers/handlerFactory');

const { protect, getMe, authorize } = require('../middleware/auth');
// const AppError = require('../utils/AppError');

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   if (!isValidObjectId(val)) {
//     return next(new AppError('Please provide a valid id', 400));
//   }
//   next();
// });

router.post('/orders/place-order', protect, placeOrder);

module.exports = router;
