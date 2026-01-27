const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');

        // If we have a URI, we MUST connect to it. No fallbacks.
        if (process.env.MONGODB_URI) {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } else {
            console.warn('WARNING: No MONGODB_URI found in .env file.');
            console.log('Starting In-Memory MongoDB (Non-Persistent/Testing only)...');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Do NOT fallback if we had a URI but failed to connect. 
        // We want to know if our production DB is down.
        process.exit(1);
    }
};

module.exports = connectDB;
