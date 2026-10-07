/**
 * MongoDB Atlas Connection Manager
 * Caches connection promise for fast re-use across requests and serverless executions.
 */

const mongoose = require('mongoose');
require('dotenv').config();

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  if (!process.env.MONGODB_URI) {
    console.warn('[-] MONGODB_URI not found in environment.');
    return null;
  }

  cachedPromise = mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }).then(db => {
    console.log(`[+] MongoDB Connected: ${db.connection.host}`);
    return db;
  }).catch(error => {
    cachedPromise = null;
    console.error(`[-] MongoDB Connection Error: ${error.message}`);
    return null;
  });

  return cachedPromise;
};

// Initiate connection in background on boot
if (process.env.MONGODB_URI) {
  connectDB();
}

module.exports = connectDB;
