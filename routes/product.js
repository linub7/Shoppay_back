const express = require('express');
const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsNameSub,
} = require('../controllers/product');
const factory = require('../controllers/handlerFactory');

const { protect, getMe, authorize } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const { isValidObjectId } = require('mongoose');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router
  .route('/products')
  .get(getAllProducts)
  .post(protect, authorize('admin'), createProduct);

router.get(
  '/products/name-sub',
  protect,
  authorize('admin'),
  getProductsNameSub
);

router
  .route('/products/:id')
  .get(getSingleProduct)
  .patch(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
