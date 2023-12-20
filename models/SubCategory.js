const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;

const SubCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      minlength: [2, 'Subcategory name must be at least 2 character'],
      maxlength: [32, 'Subcategory name can not be more than 32 character'],
    },
    slug: {
      type: String,
      // unique: true,
      index: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will not show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

SubCategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('SubCategory', SubCategorySchema);
