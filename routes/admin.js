const express = require('express');
const { getAdminDashboardStuff } = require('../controllers/admin');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/admin/dashboard')
  .get(protect, authorize('admin'), getAdminDashboardStuff);

module.exports = router;
