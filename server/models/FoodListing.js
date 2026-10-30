const mongoose = require('mongoose');

const FoodListingSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the food listing'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    foodType: {
      type: String,
      required: [true, 'Please select the food category'],
      enum: ['Cooked Meals', 'Raw Groceries', 'Packaged Food', 'Bakery / Desserts'],
    },
    dietaryType: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Vegan', 'Egg'],
      default: 'Veg',
    },
    quantity: {
      value: {
        type: Number,
        required: [true, 'Please provide the quantity amount'],
        min: [1, 'Quantity must be at least 1'],
      },
      unit: {
        type: String,
        enum: ['servings', 'kg', 'packets', 'boxes'],
        default: 'servings',
      },
    },
    preparedTime: {
      type: Date,
      default: Date.now,
    },
    bestBefore: {
      type: Date,
      required: [true, 'Please provide the expiry / best-before time'],
    },
    pickupAddress: {
      street: { type: String, default: '' },
      city: { type: String, required: [true, 'Please specify pickup city'], trim: true },
      contactPhone: { type: String, required: [true, 'Please specify pickup contact phone'] },
    },
    specialNotes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'cancelled'],
      default: 'available',
    },
    activeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for searching
FoodListingSchema.index({ status: 1, 'pickupAddress.city': 1, foodType: 1 });

module.exports = mongoose.model('FoodListing', FoodListingSchema);
