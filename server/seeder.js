const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const FoodListing = require('./models/FoodListing');
const DonationRequest = require('./models/DonationRequest');

// Load env vars
dotenv.config();

const seedData = async (exitOnComplete = true) => {
  try {
    // If not connected, connect using MONGODB_URI
    if (mongoose.connection.readyState === 0) {
      if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not set in .env file');
        if (exitOnComplete) process.exit(1);
        return;
      }
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('[Seeder] Connected to MongoDB Atlas...');
    }

    // Clear existing data
    await User.deleteMany();
    await FoodListing.deleteMany();
    await DonationRequest.deleteMany();
    console.log('[Seeder] Cleared previous records.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        organizationName: 'AaharShare Moderation Board',
        email: 'admin@foodshare.org',
        password: 'adminpassword123',
        role: 'admin',
        phone: '+91 9876543210',
        address: { street: 'Central Tech Hub', city: 'Bangalore', zipCode: '560001' },
        isVerified: true,
      },
      {
        name: 'Chef Rajesh Sharma',
        organizationName: 'Grand Palace Hotel & Banquets',
        email: 'grandpalace@donor.com',
        password: 'password123',
        role: 'donor',
        phone: '+91 9811122233',
        address: { street: '45 MG Road, Ashok Nagar', city: 'Bangalore', zipCode: '560025' },
        isVerified: true,
      },
      {
        name: 'Priya Verma',
        organizationName: 'Royal Delight Caterers',
        email: 'delightcaterers@donor.com',
        password: 'password123',
        role: 'donor',
        phone: '+91 9822233344',
        address: { street: '12 Indiranagar 100ft Rd', city: 'Bangalore', zipCode: '560038' },
        isVerified: true,
      },
      {
        name: 'Sister Mary',
        organizationName: 'Helping Hands Community Foundation',
        email: 'helpinghands@ngo.org',
        password: 'password123',
        role: 'ngo',
        phone: '+91 9833344455',
        address: { street: '88 Koramangala 4th Block', city: 'Bangalore', zipCode: '560034' },
        isVerified: true,
      },
      {
        name: 'Amit Patel',
        organizationName: 'Feed The City Relief Care',
        email: 'feedthecity@ngo.org',
        password: 'password123',
        role: 'ngo',
        phone: '+91 9844455566',
        address: { street: '21 Whitefield Main Rd', city: 'Bangalore', zipCode: '560066' },
        isVerified: false,
      },
    ]);

    const donor1 = users[1];
    const donor2 = users[2];

    // Expiry thresholds for mock listings
    const fourHoursFromNow = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const sixHoursFromNow = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // 2. Create Sample Listings
    await FoodListing.create([
      {
        donor: donor1._id,
        title: 'Fresh Buffet Lunch Surplus (Jeera Rice, Paneer Butter Masala, Dal Makhani)',
        foodType: 'Cooked Meals',
        dietaryType: 'Veg',
        quantity: { value: 50, unit: 'servings' },
        preparedTime: new Date(Date.now() - 60 * 60 * 1000),
        bestBefore: fourHoursFromNow,
        pickupAddress: {
          street: donor1.address.street,
          city: donor1.address.city,
          contactPhone: donor1.phone,
        },
        specialNotes: 'Freshly prepared for an afternoon banquet. Kept under warmers. Please bring clean containers.',
        status: 'available',
      },
      {
        donor: donor2._id,
        title: 'Assorted Fresh Bakery Items (Croissants, Dinner Rolls, Muffin Boxes)',
        foodType: 'Bakery / Desserts',
        dietaryType: 'Egg',
        quantity: { value: 35, unit: 'packets' },
        preparedTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        bestBefore: sixHoursFromNow,
        pickupAddress: {
          street: donor2.address.street,
          city: donor2.address.city,
          contactPhone: donor2.phone,
        },
        specialNotes: 'Sealed individually in food-grade packaging. Ready for immediate pickup.',
        status: 'available',
      },
      {
        donor: donor1._id,
        title: 'Surplus Fresh Farm Produce (Tomatoes, Capsicum, Potatoes)',
        foodType: 'Raw Groceries',
        dietaryType: 'Vegan',
        quantity: { value: 30, unit: 'kg' },
        preparedTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        bestBefore: twoDaysFromNow,
        pickupAddress: {
          street: donor1.address.street,
          city: donor1.address.city,
          contactPhone: donor1.phone,
        },
        specialNotes: 'Stored in kitchen crates. Suitable for community kitchen meal preparation.',
        status: 'available',
      },
      {
        donor: donor2._id,
        title: 'Sealed Breakfast Packs & Dairy (UHT Milk, Cornflakes, Fruit Jams)',
        foodType: 'Packaged Food',
        dietaryType: 'Veg',
        quantity: { value: 40, unit: 'packets' },
        preparedTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
        bestBefore: new Date(Date.now() + 72 * 60 * 60 * 1000),
        pickupAddress: {
          street: donor2.address.street,
          city: donor2.address.city,
          contactPhone: donor2.phone,
        },
        specialNotes: 'Factory-sealed individual cartons with manufacturer expiry labels intact.',
        status: 'available',
      },
    ]);

    console.log('[Seeder] Successfully seeded Users and Sample Food Listings!');
    console.log('--- Test Accounts Available ---');
    console.log('Admin:       admin@foodshare.org       / adminpassword123');
    console.log('Donor 1:     grandpalace@donor.com     / password123');
    console.log('Donor 2:     delightcaterers@donor.com / password123');
    console.log('NGO 1:       helpinghands@ngo.org      / password123');
    console.log('NGO 2:       feedthecity@ngo.org       / password123');
    console.log('-------------------------------');

    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Error]:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
