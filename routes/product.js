const express = require('express');
const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product');
const factory = require('../controllers/handlerFactory');

const { protect, getMe, authorize } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

router
  .route('/products')
  .get(getAllProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/products/:slug')
  .get(getSingleProduct)
  .patch(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
