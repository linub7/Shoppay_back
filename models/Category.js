const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      minlength: [2, 'category name must be at least 2 character'],
      maxlength: [32, 'category name can not be more than 32 character'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will not show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
