const express = require('express');
const router = express.Router();
const {
  createRequest,
  getDonorRequests,
  getNgoRequests,
  acceptRequest,
  rejectRequest,
  verifyPickup,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// NGO routes
router.post('/', protect, authorize('ngo'), createRequest);
router.get('/ngo', protect, authorize('ngo'), getNgoRequests);

// Donor routes
router.get('/donor', protect, authorize('donor'), getDonorRequests);
router.patch('/:id/accept', protect, authorize('donor'), acceptRequest);
router.patch('/:id/reject', protect, authorize('donor'), rejectRequest);
router.post('/:id/verify-pickup', protect, authorize('donor'), verifyPickup);

module.exports = router;
