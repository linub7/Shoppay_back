const express = require('express');
const {
  uploadMultipleImages,
  uploadColorImage,
} = require('../controllers/uploads');

const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/multer');

const router = express.Router();

router
  .route('/upload/images/products')
  .post(
    protect,
    authorize('admin'),
    uploadImage.array('imageInputFile'),
    uploadMultipleImages
  );

router
  .route('/upload/images/color')
  .post(
    protect,
    authorize('admin'),
    uploadImage.single('colorImageInput'),
    uploadColorImage
  );

module.exports = router;
