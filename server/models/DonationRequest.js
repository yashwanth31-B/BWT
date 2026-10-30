const mongoose = require('mongoose');

const DonationRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    pickupEta: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    pickupOtp: {
      type: String,
      default: null, // Populated with a 4-digit numeric code when Donor accepts
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick queries
DonationRequestSchema.index({ donor: 1, status: 1 });
DonationRequestSchema.index({ ngo: 1, status: 1 });
DonationRequestSchema.index({ listing: 1 });

module.exports = mongoose.model('DonationRequest', DonationRequestSchema);
