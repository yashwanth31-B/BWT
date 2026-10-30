const User = require('../models/User');

// @desc    Register a new user (Donor or NGO)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, organizationName, email, password, role, phone, street, city, zipCode } = req.body;

    // Validation: Prevent public registration of admin accounts
    let userRole = role ? role.toLowerCase() : 'donor';
    if (userRole === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly.',
      });
    }

    if (!['donor', 'ngo'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "donor" or "ngo".',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      organizationName,
      email,
      password,
      role: userRole,
      phone,
      address: {
        street: street || '',
        city: city || 'City',
        zipCode: zipCode || '',
      },
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        organizationName: user.organizationName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user (include password field which is select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        organizationName: user.organizationName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
