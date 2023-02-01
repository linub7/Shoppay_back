const User = require('../models/User');
const Order = require('../models/Order');
const factory = require('./handlerFactory');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

exports.payWithStripe = asyncHandler(async (req, res, next) => {
  const {
    body: { amount, id },
    user,
  } = req;
  const payment = await stripe.paymentIntents.create({
    amount: Math.round(amount * 1000),
    currency: 'USD',
    description: 'MUME Shop',
    payment_method: id,
    confirm: true,
  });

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order was not found.', 404));
  if (order.user !== user.id)
    return next(new AppError('Invalid Credentials', 401));

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: payment?.id,
    status: payment?.status,
    email: payment?.email_address,
  };
  await order.save();
  return res.json({
    status: 'success',
  });
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('products', 'product name')
    .sort('-createdAt');

  res.json({
    status: 'success',
    data: {
      data: orders,
    },
  });
});
