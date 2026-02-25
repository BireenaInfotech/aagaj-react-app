// Backend/config/database.js
// Database configuration file

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from Backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Connect to MongoDB
 * @returns {Promise} - MongoDB connection promise
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        
        if (!mongoURI) {
            throw new Error('❌ MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(mongoURI);

        console.log("✅ MongoDB Connected Successfullyok");
        return mongoose.connection;
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1); // Exit application on DB connection failure
    }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("✅ MongoDB Disconnected");
    } catch (err) {
        console.error("❌ Disconnect Error:", err.message);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    mongoose
};
