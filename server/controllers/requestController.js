const DonationRequest = require('../models/DonationRequest');
const FoodListing = require('../models/FoodListing');

// @desc    Submit a donation request for a food listing
// @route   POST /api/requests
// @access  Private (NGO only)
const createRequest = async (req, res, next) => {
  try {
    const { listingId, pickupEta, notes } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid food listing ID',
      });
    }

    const listing = await FoodListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found',
      });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `This food listing is currently ${listing.status} and cannot be requested.`,
      });
    }

    // Check if food is already past bestBefore date
    if (new Date(listing.bestBefore) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This food listing has already expired and cannot be claimed.',
      });
    }

    // Check if this NGO has already placed an active request for this listing
    const existingRequest = await DonationRequest.findOne({
      listing: listingId,
      ngo: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active request for this food listing.',
      });
    }

    const request = await DonationRequest.create({
      listing: listing._id,
      donor: listing.donor,
      ngo: req.user._id,
      pickupEta: pickupEta || null,
      notes: notes || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully. Awaiting donor approval.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incoming requests for the logged-in donor
// @route   GET /api/requests/donor
// @access  Private (Donor only)
const getDonorRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({ donor: req.user._id })
      .populate('listing')
      .populate('ngo', 'organizationName name email phone address isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests made by the logged-in NGO
// @route   GET /api/requests/ngo
// @access  Private (NGO only)
const getNgoRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({ ngo: req.user._id })
      .populate('listing')
      .populate('donor', 'organizationName name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a donation request & generate 4-digit pickup OTP
// @route   PATCH /api/requests/:id/accept
// @access  Private (Donor only)
const acceptRequest = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found',
      });
    }

    // Verify ownership
    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a request that is already ${request.status}`,
      });
    }

    const listing = await FoodListing.findById(request.listing);
    if (!listing || listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Listing is no longer available for reservation',
      });
    }

    // Generate random 4-digit OTP for secure pickup verification
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    request.status = 'accepted';
    request.pickupOtp = generatedOtp;
    await request.save();

    // Mark listing as reserved
    listing.status = 'reserved';
    listing.activeRequest = request._id;
    await listing.save();

    // Optionally reject other pending requests for this listing
    await DonationRequest.updateMany(
      { listing: listing._id, _id: { $ne: request._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    res.status(200).json({
      success: true,
      message: 'Request accepted. The NGO has been issued their pickup code.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a donation request
// @route   PATCH /api/requests/:id/reject
// @access  Private (Donor only)
const rejectRequest = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found',
      });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request',
      });
    }

    request.status = 'rejected';
    await request.save();

    // If listing was reserved by this request, release it back to available
    const listing = await FoodListing.findById(request.listing);
    if (listing && listing.activeRequest?.toString() === request._id.toString()) {
      listing.status = 'available';
      listing.activeRequest = null;
      await listing.save();
    }

    res.status(200).json({
      success: true,
      message: 'Request has been rejected.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 4-digit OTP and complete pickup
// @route   POST /api/requests/:id/verify-pickup
// @access  Private (Donor only)
const verifyPickup = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the 4-digit pickup code presented by the NGO',
      });
    }

    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found',
      });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to confirm pickup for this request',
      });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot verify pickup for request with status: ${request.status}`,
      });
    }

    if (request.pickupOtp !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup verification code. Please check with the NGO representative.',
      });
    }

    // Successful OTP match
    request.status = 'completed';
    request.completedAt = Date.now();
    await request.save();

    // Update listing to completed
    const listing = await FoodListing.findById(request.listing);
    if (listing) {
      listing.status = 'completed';
      await listing.save();
    }

    res.status(200).json({
      success: true,
      message: 'Pickup verified successfully! Food donation marked as completed.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getDonorRequests,
  getNgoRequests,
  acceptRequest,
  rejectRequest,
  verifyPickup,
};
