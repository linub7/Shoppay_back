const mongoose = require('mongoose');

const { Schema } = mongoose;

const CouponSchema = new Schema(
  {
    coupon: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: true,
      minlength: 4,
      maxlength: 10,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will not show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Coupon', CouponSchema);
