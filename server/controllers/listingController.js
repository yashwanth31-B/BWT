const FoodListing = require('../models/FoodListing');

// @desc    Create a new food listing
// @route   POST /api/listings
// @access  Private (Donor only)
const createListing = async (req, res, next) => {
  try {
    const {
      title,
      foodType,
      dietaryType,
      quantityValue,
      quantityUnit,
      preparedTime,
      bestBefore,
      pickupStreet,
      pickupCity,
      pickupPhone,
      specialNotes,
    } = req.body;

    const listing = await FoodListing.create({
      donor: req.user._id,
      title,
      foodType,
      dietaryType: dietaryType || 'Veg',
      quantity: {
        value: quantityValue,
        unit: quantityUnit || 'servings',
      },
      preparedTime: preparedTime || Date.now(),
      bestBefore,
      pickupAddress: {
        street: pickupStreet || req.user.address.street || '',
        city: pickupCity || req.user.address.city || '',
        contactPhone: pickupPhone || req.user.phone,
      },
      specialNotes: specialNotes || '',
      status: 'available',
    });

    res.status(201).json({
      success: true,
      message: 'Food listing published successfully',
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available food listings (with filtering)
// @route   GET /api/listings
// @access  Public / NGO
const getAllListings = async (req, res, next) => {
  try {
    const { city, foodType, dietaryType, status } = req.query;

    const filter = {};

    // Filter by status (default to 'available' if not explicitly queried)
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'available';
    }

    // Filter by city
    if (city) {
      filter['pickupAddress.city'] = new RegExp(city.trim(), 'i');
    }

    // Filter by food category
    if (foodType) {
      filter.foodType = foodType;
    }

    // Filter by dietary type (Veg, Non-Veg, etc.)
    if (dietaryType) {
      filter.dietaryType = dietaryType;
    }

    const listings = await FoodListing.find(filter)
      .populate('donor', 'organizationName name phone address isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('donor', 'organizationName name phone address isVerified')
      .populate('activeRequest');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found',
      });
    }

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get listings created by the logged-in donor
// @route   GET /api/listings/my-listings
// @access  Private (Donor only)
const getMyListings = async (req, res, next) => {
  try {
    const listings = await FoodListing.find({ donor: req.user._id })
      .populate('activeRequest')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food listing
// @route   PUT /api/listings/:id
// @access  Private (Donor owner only)
const updateListing = async (req, res, next) => {
  try {
    let listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found',
      });
    }

    // Check ownership
    if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing',
      });
    }

    if (listing.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a completed donation listing',
      });
    }

    listing = await FoodListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel / Delete a food listing
// @route   DELETE /api/listings/:id
// @access  Private (Donor owner or Admin)
const deleteListing = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found',
      });
    }

    if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing',
      });
    }

    // Mark as cancelled or remove
    listing.status = 'cancelled';
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Food listing marked as cancelled',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
};
