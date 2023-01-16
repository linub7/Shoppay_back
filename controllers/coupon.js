const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
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

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const {
    body: { coupon },
    user,
  } = req;

  if (!coupon) return next(new AppError('Please enter a coupon', 400));

  const existedCoupon = await Coupon.findOne({ coupon });

  if (!existedCoupon) return next(new AppError('Invalid Coupon', 400));

  const userCart = await Cart.findOne({ user: user.id });

  if (!userCart)
    return next(new AppError('There is not any cart with this user', 400));

  const totalAfterDiscount =
    userCart?.cartTotal - (userCart?.cartTotal * existedCoupon?.discount) / 100;

  await Cart.findOneAndUpdate(
    { user: user.id },
    { totalAfterDiscount },
    { new: true, runValidators: true }
  );

  return res.status(201).json({
    status: 'success',
    data: {
      data: {
        totalAfterDiscount: totalAfterDiscount?.toFixed(2),
        discount: existedCoupon?.discount,
      },
    },
  });
});

exports.getSingleCoupon = factory.getSingleOne(Coupon);

exports.updateCoupon = factory.updateOne(Coupon);

exports.deleteCoupon = factory.deleteOne(Coupon);
