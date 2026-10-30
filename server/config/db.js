const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb')) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`[Database] Connected to MongoDB Atlas: ${conn.connection.host}`);
      return;
    }

    // Resilient fallback for local testing & hackathon demonstration
    console.log('[Database] MONGODB_URI not found in .env. Initializing local in-memory MongoDB cluster...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    
    const conn = await mongoose.connect(uri);
    console.log(`[Database] In-Memory MongoDB connected: ${conn.connection.host}`);

    // Auto-seed sample accounts & listings for immediate zero-setup evaluation
    const seedData = require('../seeder');
    await seedData(false);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
