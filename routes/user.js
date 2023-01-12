const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  updatePassword,
  signoutUser,
} = require('../controllers/auth.js');
const factory = require('../controllers/handlerFactory');
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  saveCartToDb,
  getUserCart,
  saveAddressToDb,
  changeAddressState,
} = require('../controllers/user');
const { protect, getMe, authorize } = require('../middleware/auth');
const User = require('../models/User');
const AppError = require('../utils/AppError');
// const { uploadImage } = require('../middleware/multer');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router.post('/auth/forgot-password', forgotPassword);
router.patch('/auth/reset-password/:token', resetPassword);
router.patch('/auth/update-my-password', protect, updatePassword);

router.post('/auth/signup', signup);
router.post('/auth/signin', signin);
router.get('/auth/signout', protect, signoutUser);

router
  .route('/user/cart')
  .get(protect, getUserCart)
  .post(protect, saveCartToDb);

router.route('/user/address').post(protect, saveAddressToDb);
router.route('/user/manage-address').patch(protect, changeAddressState);

// router.route('/users').get(protect, authorize('admin'), getAllUsers);

// router.get('/me', protect, getMe, factory.getSingleOne(User));
// router.patch('/me/update', uploadImage.single('photo'), protect, updateMe);
// router.delete('/me/delete', protect, deleteMe);

// router
//   .route('/users/:id')
//   .get(protect, authorize('admin'), getSingleUser)
//   .patch(protect, authorize('admin'), updateUser)
//   .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
