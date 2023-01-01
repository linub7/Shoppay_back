const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/mail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (userId, user, statusCode, res) => {
  const token = signToken(userId);

  const cookieOptions = {
    expires: new Date(
      // 24: 24 hours in one day -> 60: minutes in one hour -> 60: seconds in one minute -> 1000: milliseconds in one second
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const {
    body: { name, email, password, passwordConfirm, passwordChangedAt },
  } = req;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });

  newUser.password = undefined;
  const token = signToken(newUser._id);

  const cookieOptions = {
    expires: new Date(
      // 24: 24 hours in one day -> 60: minutes in one hour -> 60: seconds in one minute -> 1000: milliseconds in one second
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  const url = `${process.env.BASE_URL}/activate/${token}`;
  await sendEmail(email, url, '', 'Activate your Account.');
  res.status(201).json({
    status: 'success',
    token,
    data: {
      message:
        'You registered successfully. Please go to your email inbox and confirm your account ✔️.',
      user: newUser,
    },
  });
});

exports.signin = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password },
  } = req;

  // 1) Check if email and password exists
  if (!email || !password)
    return next(new AppError('Please enter a valid email and password', 400));

  // 2) Check if user exists && password is correct
  // we deselect password field in the user model, in order that we have to select password
  // to compare stored password with entered password with .select('+password')
  const existUser = await User.findOne({ email }).select('+password');
  if (!existUser) {
    return next(new AppError('Incorrect Credentials', 401));
  }
  const correct = await existUser.correctPassword(password, existUser.password);

  if (!correct) return next(new AppError('Incorrect Credentials', 401));

  // 3) if everything is ok -> send token to client

  existUser.password = undefined;
  createSendToken(existUser._id, existUser, 200, res);
});

exports.signoutUser = asyncHandler(async (req, res, next) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  return res.status(200).json({
    success: true,
    data: {},
  });
});
