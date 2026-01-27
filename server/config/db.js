const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');

        // If we have a URI, try to connect to it
        if (process.env.MONGODB_URI) {
            const conn = await mongoose.connect(process.env.MONGODB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } else {
            console.log('No external MongoDB URI found. Starting In-Memory MongoDB...');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
            console.log('Note: Data will be cleared when the server restarts.');
        }
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.log('Attempting to use In-Memory MongoDB as fallback...');
        try {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('Fallback: Connected to In-Memory MongoDB');
        } catch (fallbackError) {
            console.error('Critical Error: Failed to connect to any database.');
        }
    }
};

module.exports = connectDB;
