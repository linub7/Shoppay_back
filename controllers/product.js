const { isValidObjectId } = require('mongoose');

const Product = require('../models/Product');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');
const {
  filterArray,
  removeDuplicates,
  createRegex,
} = require('../utils/arrayUtils');
const { extractMinMax } = require('../utils/helpers');

exports.getSearchedProducts = asyncHandler(async (req, res, next) => {
  const {
    query: {
      searchTerm,
      category,
      brand,
      style,
      size,
      color,
      pattern,
      material,
      gender,
      price,
      shipping,
      rating,
      sort,
    },
  } = req;
  if (searchTerm && searchTerm?.length < 2)
    return next(new AppError('Please enter some proper key to search', 400));

  console.log({ rating });

  let categoryFilter = {};
  let brandFilter = {};
  let styleFilter = {};
  let sizeFilter = {};
  let colorFilter = {};
  let patternFilter = {};
  let materialFilter = {};
  let genderFilter = {};
  let priceFilter = {};
  let shippingFilter = {};
  let ratingFilter = {};
  let sortFilter = {};

  if (category !== '' && category !== undefined && !isValidObjectId(category))
    return next(new AppError('Please enter correct category', 400));

  // search term query
  const search =
    searchTerm && searchTerm !== ''
      ? {
          name: {
            $regex: searchTerm,
            $options: 'i',
          },
        }
      : {};

  // category query
  if (category === undefined || category === '') {
    categoryFilter = {};
  } else {
    categoryFilter = category && category !== '' ? { category } : {};
  }

  // brand query
  if (brand === undefined || brand === '') {
    brandFilter = {};
  } else {
    const brandQuery = brand?.split('_');
    const brandRegex = `^${brandQuery[0]}`;
    const brandSearchRegex = createRegex(brandQuery, brandRegex);
    brandFilter =
      brand && brand !== ''
        ? {
            brand: {
              $regex: brandSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // style query
  if (style === undefined || style === '') {
    styleFilter = {};
  } else {
    const styleQuery = style?.split('_');
    const styleRegex = `^${styleQuery[0]}`;
    const styleSearchRegex = createRegex(styleQuery, styleRegex);
    styleFilter =
      style && style !== ''
        ? {
            'details.value': {
              $regex: styleSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // size query
  if (size === undefined || size === '') {
    sizeFilter = {};
  } else {
    const sizeQuery = size?.split('_');
    const sizeRegex = `^${sizeQuery[0]}`;
    const sizeSearchRegex = createRegex(sizeQuery, sizeRegex);
    sizeFilter =
      size && size !== ''
        ? {
            'subProducts.sizes.size': {
              $regex: sizeSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // color query
  if (color === undefined || color === '') {
    colorFilter = {};
  } else {
    const colorQuery = color?.split('_');
    let tmpColorQuery = [];
    for (const item of colorQuery) {
      const newItem = item?.slice(0, 0) + '#' + item?.slice(0);
      tmpColorQuery?.push(newItem);
    }

    const colorRegex = `^${tmpColorQuery[0]}`;
    const colorSearchRegex = createRegex(tmpColorQuery, colorRegex);
    colorFilter =
      color && color !== ''
        ? {
            'subProducts.color.color': {
              $regex: colorSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // pattern query
  if (pattern === undefined || pattern === '') {
    patternFilter = {};
  } else {
    const patternQuery = pattern?.split('_');
    const patternRegex = `^${patternQuery[0]}`;
    const patternSearchRegex = createRegex(patternQuery, patternRegex);
    patternFilter =
      pattern && pattern !== ''
        ? {
            'details.value': {
              $regex: patternSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // material query
  if (material === undefined || material === '') {
    materialFilter = {};
  } else {
    const materialQuery = material?.split('_');
    const materialRegex = `^${materialQuery[0]}`;
    const materialSearchRegex = createRegex(materialQuery, materialRegex);
    materialFilter =
      material && material !== ''
        ? {
            'details.value': {
              $regex: materialSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // gender query
  if (gender === undefined || gender === '') {
    genderFilter = {};
  } else {
    const genderQuery = gender?.split('_');
    const genderRegex = `^${genderQuery[0]}`;
    const genderSearchRegex = createRegex(genderQuery, genderRegex);
    genderFilter =
      gender && gender !== ''
        ? {
            'details.value': {
              $regex: genderSearchRegex,
              $options: 'i',
            },
          }
        : {};
  }

  // price query
  if (price === undefined || price === '') {
    priceFilter = {};
  } else {
    const { min, max } = extractMinMax(price);

    priceFilter =
      (min !== undefined || max !== undefined) && min === max
        ? {
            'subProducts.sizes.price': {
              $gte: min,
            },
          }
        : (min !== undefined || max !== undefined) &&
          min === 0 &&
          max !== undefined
        ? {
            'subProducts.sizes.price': {
              $lte: max,
            },
          }
        : min !== undefined && max !== undefined && max !== min
        ? {
            'subProducts.sizes.price': {
              $gte: min,
              $lte: max,
            },
          }
        : {};
  }

  // shipping query
  if (shipping === undefined || shipping === '') {
    shippingFilter = {};
  } else {
    shippingFilter = shipping === '0' ? { shipping: 0 } : {};
  }

  // rating query
  if (rating === undefined || rating === '') {
    ratingFilter = {};
  } else {
    ratingFilter =
      rating && rating !== ''
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
  }

  // sort query
  if (sort === undefined) {
    sortFilter = {};
  } else {
    sortFilter =
      sort === 'recommended'
        ? {}
        : sort === 'popular'
        ? {
            rating: -1,
            'subProducts.sold': -1,
          }
        : sort === 'newest'
        ? {
            createdAt: -1,
          }
        : sort === 'top-selling'
        ? {
            'subProducts.sold': -1,
          }
        : sort === 'top-reviewed'
        ? {
            rating: -1,
          }
        : sort === 'price-high-to-low'
        ? {
            'subProducts.sizes.price': -1,
          }
        : sort === 'price-low-to-high'
        ? {
            'subProducts.sizes.price': 1,
          }
        : {};
  }

  const searchedProducts = await Product.find({
    ...search,
    ...categoryFilter,
    ...brandFilter,
    ...styleFilter,
    ...sizeFilter,
    ...colorFilter,
    ...patternFilter,
    ...materialFilter,
    ...genderFilter,
    ...priceFilter,
    ...shippingFilter,
    ...ratingFilter,
  }).sort(sortFilter);

  return res.json({
    status: 'success',
    result: searchedProducts?.length,
    data: searchedProducts,
  });
});

exports.getAllProducts = factory.getAll(Product);

exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  let {
    params: { id },
    query: { style, size },
  } = req;
  style = style || 0;
  size = size || 0;
  const product = await Product.findById(id);
  if (!product)
    return next(new AppError(`Product with ${id} was not found`, 404));
  const discount = product.subProducts[style].discount;
  const priceBefore = product.subProducts[style].sizes[size].price;
  const price = discount ? priceBefore - priceBefore / discount : priceBefore;
  return res.json({
    status: 'success',
    data: {
      data: {
        _id: product.name,
        style: Number(style),
        name: product.name,
        description: product.description,
        slug: product.slug,
        sku: product.subProducts[style].sku,
        brand: product.brand,
        category: product?.category,
        subCategories: product?.subCategories,
        shipping: product.shipping,
        images: product.subProducts[style].images,
        color: product.subProducts[style].color,
        size: product.subProducts[style].sizes[size].size,
        price,
        priceBefore,
        quantity: product.subProducts[style].sizes[size].qty,
      },
    },
  });
});

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.getProductsNameSub = asyncHandler(async (req, res, next) => {
  const products = await Product.find({}).select('name subProducts');
  return res.json({
    status: 'success',
    data: {
      data: products,
    },
  });
});

exports.uploadProductImages = asyncHandler(async (req, res, next) => {});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    body: {
      parent,
      sku,
      color,
      images,
      sizes,
      discount,
      name,
      description,
      brand,
      category,
      subCategories,
      details,
      questions,
    },
    user,
  } = req;

  if (parent) {
    const existedProduct = await Product.findById(parent);
    if (!existedProduct)
      return next(new AppError('Product was not found', 404));

    const updatedProduct = await Product.findByIdAndUpdate(
      parent,
      {
        $push: {
          subProducts: {
            sku,
            images,
            color,
            sizes,
            discount,
          },
        },
      },
      { new: true, runValidators: true }
    );
    return res.json({
      status: 'success',
      data: {
        data: 'product is updated successfully',
      },
    });
  } else {
    const newProduct = await Product.create({
      name,
      description,
      brand,
      user: user._id,
      category,
      subCategories,
      details,
      questions,
      subProducts: [
        {
          sku,
          images,
          color,
          sizes,
          discount,
        },
      ],
    });
    return res.json({
      status: 'success',
      data: {
        data: 'Product is created successfully.',
      },
    });
  }
});

exports.addReview = asyncHandler(async (req, res, next) => {
  const {
    params: { productId },
    body: { rating, review, size, style, fit, images },
    user,
  } = req;

  if (!isValidObjectId(productId))
    return next(new AppError('Please provide a valid id', 400));

  const product = await Product.findById(productId).populate(
    'reviews',
    'reviewBy'
  );

  if (!product) return next(new AppError('Product was not found', 404));

  const isAlreadyWroteReview = product?.reviews?.find(
    (review) => review?.reviewBy?.toString() === user?._id?.toString()
  );
  if (isAlreadyWroteReview) {
    await Product.findOneAndUpdate(
      {
        _id: productId,
        'reviews._id': isAlreadyWroteReview._id,
      },
      {
        $set: {
          'reviews.$.review': review,
          'reviews.$.fit': fit,
          'reviews.$.images': images,
          'reviews.$.size': size,
          'reviews.$.style': style,
          'reviews.$.rating': rating,
        },
      },
      { new: true, runValidators: true }
    );
    const updatedProduct = await Product.findById(productId).populate(
      'reviews'
    );
    updatedProduct.numReviews = updatedProduct?.reviews?.length;
    updatedProduct.rating =
      updatedProduct?.reviews?.reduce((a, r) => a + r.rating, 0) /
      updatedProduct.reviews?.length;
    await updatedProduct.save();

    return res.json({
      status: 'success',
      data: {
        data: updatedProduct.reviews.reverse(),
      },
    });
  } else {
    const newReview = await Review.create({
      reviewBy: user._id,
      fit,
      images,
      rating,
      review,
      size,
      style,
    });

    product?.reviews?.push(newReview);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, r) => a + r.rating, 0) /
      product.reviews.length;

    await product?.save();

    return res.json({
      status: 'success',
      data: {
        data: product.reviews.reverse(),
      },
    });
  }
});

exports.getProductsDetails = asyncHandler(async (req, res, next) => {
  const {
    query: { category },
  } = req;

  let categoryFilter = {};
  if (category !== '' && !isValidObjectId(category))
    return next(new AppError('Please enter correct category', 400));

  if (category === undefined || category === '') {
    categoryFilter = {};
  } else {
    categoryFilter = category && category !== '' ? { category } : {};
  }

  const colors = await Product.find({ ...categoryFilter }).distinct(
    'subProducts.color.color'
  );
  const brandsDb = await Product.find({
    ...categoryFilter,
  }).distinct('brand');
  const sizes = await Product.find({ ...categoryFilter }).distinct(
    'subProducts.sizes.size'
  );
  const details = await Product.find({ ...categoryFilter }).distinct('details');
  const stylesDb = filterArray(details, 'Style');
  const patternTypeDb = filterArray(details, 'Pattern Type');
  const materialDb = filterArray(details, 'Material');
  const styles = removeDuplicates(stylesDb);
  const patternType = removeDuplicates(patternTypeDb);
  const material = removeDuplicates(materialDb);
  const brands = removeDuplicates(brandsDb);

  const payload = {
    colors,
    brands,
    sizes,
    details,
    styles,
    patternType,
    material,
  };

  return res.json({
    status: 'success',
    data: {
      data: payload,
    },
  });
});
