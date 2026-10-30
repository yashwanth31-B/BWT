const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const DonationRequest = require('../models/DonationRequest');

// @desc    Get aggregate platform metrics & statistics
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNgos = await User.countDocuments({ role: 'ngo' });
    const verifiedNgos = await User.countDocuments({ role: 'ngo', isVerified: true });
    
    const activeListings = await FoodListing.countDocuments({ status: 'available' });
    const completedListings = await FoodListing.countDocuments({ status: 'completed' });
    const totalListings = await FoodListing.countDocuments();

    // Calculate total meals/servings saved from completed listings
    const completedItems = await FoodListing.find({ status: 'completed' });
    const totalServingsSaved = completedItems.reduce((acc, curr) => {
      return acc + (curr.quantity?.value || 0);
    }, 0);

    const recentRequests = await DonationRequest.find()
      .populate('donor', 'organizationName name')
      .populate('ngo', 'organizationName name')
      .populate('listing', 'title foodType quantity')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalDonors,
        totalNgos,
        verifiedNgos,
        activeListings,
        completedListings,
        totalListings,
        totalServingsSaved,
      },
      recentRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or unverify a user/NGO
// @route   PATCH /api/admin/verify-user/:id
// @access  Private (Admin only)
const toggleUserVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.organizationName} verification status updated to ${user.isVerified}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserVerification,
};
