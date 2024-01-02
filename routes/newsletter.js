const express = require('express');
const { addSubscribe } = require('../controllers/newsletter');

const { protect, getMe, authorize } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

router.route('/newsletters').post(addSubscribe);

module.exports = router;
