const validator = require('validator');
const axios = require('axios');

const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const { mailchimpHandler } = require('../utils/mailchimp');

exports.addSubscribe = asyncHandler(async (req, res, next) => {
  const {
    body: { email },
  } = req;
  if (!email) return next(new AppError('Please provide an email', 400));
  if (!validator.isEmail(email))
    return next(new AppError('Please provide a valid email', 400));

  const { url, data, headers } = mailchimpHandler(email);
  await axios.post(url, data, { headers });

  return res.json({
    status: 'success',
    message: 'You have been added to our newsletter successfully.',
  });
});
