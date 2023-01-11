const mongoose = require('mongoose');

const { Schema } = mongoose;

const CartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: {
          type: String,
        },
        image: {
          type: String,
        },
        size: {
          type: String,
        },
        // style: {
        //   style: String,
        //   color: String,
        //   image: String,
        // },
        qty: {
          type: Number,
        },
        color: {
          color: String,
          image: String,
        },
        price: Number,
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will not show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Cart', CartSchema);
