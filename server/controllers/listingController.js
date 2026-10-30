const mongoose = require('mongoose');
const FoodListing = require('../models/FoodListing');

const DEFAULT_MOCK_LISTINGS = [
  {
    _id: '672233445566778899aaee01',
    title: 'Fresh Buffet Lunch Surplus (Jeera Rice, Paneer Butter Masala, Dal)',
    foodType: 'Cooked Meals',
    dietaryType: 'Veg',
    quantity: { value: 50, unit: 'servings' },
    preparedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '45 MG Road, Ashok Nagar',
      city: 'Bangalore',
      contactPhone: '+91 9811122233',
    },
    specialNotes: 'Freshly prepared for an afternoon banquet. Packed in clean insulated containers.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb01',
      name: 'Chef Rajesh Sharma',
      organizationName: 'Grand Palace Hotel & Banquets',
      phone: '+91 9811122233',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '672233445566778899aaee02',
    title: 'Fresh Artisan Bakery Surplus (Croissants, Dinner Rolls & Cupcakes)',
    foodType: 'Bakery / Desserts',
    dietaryType: 'Egg',
    quantity: { value: 35, unit: 'packets' },
    preparedTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '12 Indiranagar 100ft Rd',
      city: 'Bangalore',
      contactPhone: '+91 9822233344',
    },
    specialNotes: 'Freshly baked today morning. Individually sealed in food-grade packaging.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb02',
      name: 'Priya Verma',
      organizationName: 'Royal Delight Caterers',
      phone: '+91 9822233344',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '672233445566778899aaee03',
    title: 'Surplus Fresh Farm Produce (Tomatoes, Bell Peppers, Potatoes)',
    foodType: 'Raw Groceries',
    dietaryType: 'Vegan',
    quantity: { value: 30, unit: 'kg' },
    preparedTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '88 Whitefield Main Road',
      city: 'Bangalore',
      contactPhone: '+91 9811122233',
    },
    specialNotes: 'High quality raw produce. Ideal for community shelter cooking.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb01',
      name: 'Chef Rajesh Sharma',
      organizationName: 'Grand Palace Hotel & Banquets',
      phone: '+91 9811122233',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '672233445566778899aaee04',
    title: 'Sealed Breakfast Packs & Dairy (UHT Milk, Cornflakes, Fruit Jams)',
    foodType: 'Packaged Food',
    dietaryType: 'Veg',
    quantity: { value: 40, unit: 'packets' },
    preparedTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    bestBefore: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    pickupAddress: {
      street: '12 Indiranagar 100ft Rd',
      city: 'Bangalore',
      contactPhone: '+91 9822233344',
    },
    specialNotes: 'Factory-sealed individual cartons with manufacturer expiry labels intact.',
    status: 'available',
    donor: {
      _id: '672233445566778899aabb02',
      name: 'Priya Verma',
      organizationName: 'Royal Delight Caterers',
      phone: '+91 9822233344',
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

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

    if (mongoose.connection.readyState === 1) {
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
          street: pickupStreet || req.user.address?.street || '',
          city: pickupCity || req.user.address?.city || '',
          contactPhone: pickupPhone || req.user.phone,
        },
        specialNotes: specialNotes || '',
        status: 'available',
      });

      return res.status(201).json({
        success: true,
        message: 'Food listing published successfully',
        listing,
      });
    }

    // In-memory / serverless mock creation
    const mockListing = {
      _id: new mongoose.Types.ObjectId().toString(),
      donor: req.user,
      title,
      foodType,
      dietaryType: dietaryType || 'Veg',
      quantity: { value: Number(quantityValue), unit: quantityUnit || 'servings' },
      preparedTime: preparedTime || new Date().toISOString(),
      bestBefore: bestBefore || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      pickupAddress: {
        street: pickupStreet || req.user.address?.street || '',
        city: pickupCity || req.user.address?.city || 'Bangalore',
        contactPhone: pickupPhone || req.user.phone || '+91 9811122233',
      },
      specialNotes: specialNotes || '',
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    DEFAULT_MOCK_LISTINGS.unshift(mockListing);

    res.status(201).json({
      success: true,
      message: 'Food listing published successfully',
      listing: mockListing,
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

    if (mongoose.connection.readyState === 1) {
      const filter = {};

      if (status) {
        filter.status = status;
      } else {
        filter.status = 'available';
      }

      if (city) {
        filter['pickupAddress.city'] = new RegExp(city.trim(), 'i');
      }

      if (foodType) {
        filter.foodType = foodType;
      }

      if (dietaryType) {
        filter.dietaryType = dietaryType;
      }

      const listings = await FoodListing.find(filter)
        .populate('donor', 'organizationName name phone address isVerified')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: listings.length,
        listings,
      });
    }

    // Fallback: Filter mock listings
    let filtered = DEFAULT_MOCK_LISTINGS;
    if (foodType && foodType !== 'All') {
      filtered = filtered.filter((l) => l.foodType === foodType);
    }
    if (dietaryType && dietaryType !== 'All') {
      filtered = filtered.filter((l) => l.dietaryType === dietaryType);
    }
    if (city && city !== 'All') {
      filtered = filtered.filter((l) => l.pickupAddress?.city?.toLowerCase().includes(city.toLowerCase()));
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      listings: filtered,
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
    if (mongoose.connection.readyState === 1) {
      const listing = await FoodListing.findById(req.params.id)
        .populate('donor', 'organizationName name phone address isVerified')
        .populate('activeRequest');

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Food listing not found',
        });
      }

      return res.status(200).json({
        success: true,
        listing,
      });
    }

    const listing = DEFAULT_MOCK_LISTINGS.find((l) => l._id === req.params.id) || DEFAULT_MOCK_LISTINGS[0];
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
    if (mongoose.connection.readyState === 1) {
      const listings = await FoodListing.find({ donor: req.user._id })
        .populate('activeRequest')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: listings.length,
        listings,
      });
    }

    res.status(200).json({
      success: true,
      count: DEFAULT_MOCK_LISTINGS.length,
      listings: DEFAULT_MOCK_LISTINGS,
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
