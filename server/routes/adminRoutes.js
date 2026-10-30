const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserVerification,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here require Admin authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/metrics', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/verify-user/:id', toggleUserVerification);

module.exports = router;
