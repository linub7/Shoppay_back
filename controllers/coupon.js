const Coupon = require('../models/Coupon');
const asyncHandler = require('../middleware/async');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');

exports.getAllCoupons = factory.getAll(Coupon);

exports.createCoupon = asyncHandler(async (req, res, next) => {
  const {
    body: { coupon, startDate, endDate, discount },
  } = req;

  const alreadyExistedCoupon = await Coupon.findOne({ coupon });

  if (alreadyExistedCoupon)
    return next(
      new AppError('This coupon is already existed, please try another', 400)
    );

  const newCoupon = await Coupon.create({
    coupon,
    startDate,
    endDate,
    discount,
  });

  return res.status(201).json({
    status: 'success',
    data: {
      data: newCoupon,
    },
  });
});
