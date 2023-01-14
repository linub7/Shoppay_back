const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');

exports.placeOrder = asyncHandler(async (req, res, next) => {
  const {
    body: {
      products,
      shippingAddress,
      paymentMethod,
      total,
      totalBeforeDiscount,
      couponApplied,
    },
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
    totalBeforeDiscount,
    couponApplied,
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

exports.getOrder = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    user,
  } = req;

  const existedOrder = await Order.findById(id).populate('user');
  if (!existedOrder) return next(new AppError('Order was not found.', 400));

  if (existedOrder?.user !== user.id)
    return next(new AppError('Invalid Credentials', 401));

  return res.json({
    status: 'success',
    data: {
      data: {
        order: existedOrder,
      },
    },
  });
});
