const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  reviewBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  review: {
    type: String,
    required: true,
  },
  size: {
    type: String,
  },
  style: {
    color: String,
    image: String,
  },
  fit: {
    type: String,
  },
  images: [
    {
      type: Object,
      url: String,
      public_id: String,
    },
  ],
  likes: [],
});

module.exports = mongoose.model('Review', ReviewSchema);
