const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if your MongoDB Atlas cluster is running');
    console.log('2. Verify your IP address is whitelisted in MongoDB Atlas');
    console.log('3. Check your internet connection');
    console.log('4. Verify username and password are correct');
    process.exit(1);
  }
};

module.exports = connectDB; 