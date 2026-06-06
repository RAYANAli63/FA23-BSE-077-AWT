const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, getDashboardStats, getUnverifiedDoctors } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'super_admin'), getDashboardStats);
router.get('/users', protect, authorize('admin', 'super_admin'), getAllUsers);
router.put('/users/:id/toggle', protect, authorize('admin', 'super_admin'), toggleUserStatus);
router.get('/doctors/unverified', protect, authorize('admin', 'super_admin'), getUnverifiedDoctors);

module.exports = router;
