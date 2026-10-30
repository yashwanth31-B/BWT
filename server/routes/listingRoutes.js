const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to view listings / filtered search
router.get('/', getAllListings);

// Donor route to view their own posted listings
router.get('/my-listings', protect, authorize('donor'), getMyListings);

// Get single listing by id
router.get('/:id', getListingById);

// Donor route to post new food listing
router.post('/', protect, authorize('donor'), createListing);

// Donor route to update a listing
router.put('/:id', protect, authorize('donor', 'admin'), updateListing);

// Donor / Admin route to delete / cancel listing
router.delete('/:id', protect, authorize('donor', 'admin'), deleteListing);

module.exports = router;
