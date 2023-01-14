const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');

exports.placeOrder = asyncHandler(async (req, res, next) => {
  const {
    body: { products, shippingAddress, paymentMethod, total },
    user,
  } = req;

  if (!products || products?.length === 0)
    return next(new AppError('Products is required', 400));
  if (!shippingAddress)
    return next(new AppError('Shipping Address is required', 400));
  if (!paymentMethod)
    return next(new AppError('Payment Method is required', 400));
  if (!total) return next(new AppError('Total is required', 400));

  const usr = await User.findById(user.id);

  const newOrder = await Order.create({
    user: usr._id,
    products,
    shippingAddress,
    paymentMethod,
    total,
  });

  return res.status(201).json({
    status: 'success',
    data: {
      data: {
        orderId: newOrder._id,
      },
    },
  });
});
