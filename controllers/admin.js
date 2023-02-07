const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getAdminDashboardStuff = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).limit(10).sort('-createdAt');
  const products = await Product.find({}).sort('-createdAt');
  const orders = await Order.find({})
    .populate('user', 'name email')
    .limit(5)
    .sort('-createdAt');

  return res.json({
    status: 'success',
    data: {
      data: {
        users,
        products,
        orders,
      },
    },
  });
});
