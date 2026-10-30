const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Pre-seeded demo user fallback when running in serverless without Atlas connection
const DEMO_USERS_MAP = {
  'grandpalace@donor.com': {
    _id: '672233445566778899aabb01',
    name: 'Chef Rajesh Sharma',
    organizationName: 'Grand Palace Hotel & Banquets',
    email: 'grandpalace@donor.com',
    role: 'donor',
    phone: '+91 9811122233',
    address: { street: '45 MG Road, Ashok Nagar', city: 'Bangalore', zipCode: '560025' },
    isVerified: true,
  },
  'delightcaterers@donor.com': {
    _id: '672233445566778899aabb02',
    name: 'Priya Verma',
    organizationName: 'Royal Delight Caterers',
    email: 'delightcaterers@donor.com',
    role: 'donor',
    phone: '+91 9822233344',
    address: { street: '12 Indiranagar 100ft Rd', city: 'Bangalore', zipCode: '560038' },
    isVerified: true,
  },
  'helpinghands@ngo.org': {
    _id: '672233445566778899aabb03',
    name: 'Sister Mary',
    organizationName: 'Helping Hands Community Foundation',
    email: 'helpinghands@ngo.org',
    role: 'ngo',
    phone: '+91 9833344455',
    address: { street: '88 Koramangala 4th Block', city: 'Bangalore', zipCode: '560034' },
    isVerified: true,
  },
  'feedthecity@ngo.org': {
    _id: '672233445566778899aabb04',
    name: 'Amit Patel',
    organizationName: 'Feed The City Relief Care',
    email: 'feedthecity@ngo.org',
    role: 'ngo',
    phone: '+91 9844455566',
    address: { street: '21 Whitefield Main Rd', city: 'Bangalore', zipCode: '560066' },
    isVerified: false,
  },
  'admin@foodshare.org': {
    _id: '672233445566778899aabb05',
    name: 'Admin User',
    organizationName: 'AaharShare Moderation Board',
    email: 'admin@foodshare.org',
    role: 'admin',
    phone: '+91 9876543210',
    address: { street: 'Central Tech Hub', city: 'Bangalore', zipCode: '560001' },
    isVerified: true,
  },
};

// Helper to sign JWT
const createJwtToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_hackathon_jwt_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user (Donor or NGO)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, organizationName, email, password, role, phone, street, city, zipCode } = req.body;

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

    // If MongoDB is connected, execute real DB insert
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists.',
        });
      }

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

      return res.status(201).json({
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
    }

    // In-memory / Serverless fallback when Atlas is not yet configured
    const mockId = new mongoose.Types.ObjectId().toString();
    const mockUser = {
      _id: mockId,
      name,
      organizationName,
      email: email.toLowerCase(),
      role: userRole,
      phone,
      address: { street: street || '', city: city || 'Bangalore', zipCode: zipCode || '' },
      isVerified: false,
    };
    const token = createJwtToken(mockId, userRole);

    res.status(201).json({
      success: true,
      token,
      user: mockUser,
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, authenticate against database
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
      }

      const token = user.getSignedJwtToken();

      return res.status(200).json({
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
    }

    // 2. Serverless / Demo fallback when MongoDB Atlas is connecting or not set
    const demoUser = DEMO_USERS_MAP[cleanEmail];
    if (demoUser) {
      const validPass = cleanEmail.includes('admin') ? 'adminpassword123' : 'password123';
      if (password === validPass) {
        const token = createJwtToken(demoUser._id, demoUser.role);
        return res.status(200).json({
          success: true,
          token,
          user: demoUser,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
      }
    }

    // Generic demo user if not explicitly listed
    const genericRole = cleanEmail.includes('ngo') ? 'ngo' : cleanEmail.includes('admin') ? 'admin' : 'donor';
    const genericId = new mongoose.Types.ObjectId().toString();
    const genericUser = {
      _id: genericId,
      name: cleanEmail.split('@')[0],
      organizationName: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: genericRole,
      phone: '+91 9811122233',
      address: { city: 'Bangalore', street: 'MG Road' },
      isVerified: true,
    };
    const token = createJwtToken(genericId, genericRole);
    return res.status(200).json({
      success: true,
      token,
      user: genericUser,
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
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id);
      return res.status(200).json({
        success: true,
        user,
      });
    }

    // Fallback: Return attached user from authMiddleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  DEMO_USERS_MAP,
};
