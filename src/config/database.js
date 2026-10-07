/**
 * MongoDB Atlas Connection Manager
 * Caches connection promise for fast re-use across requests and Vercel serverless executions.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DEFAULT_MONGODB_URI = 'mongodb+srv://harerprafull_db_user:IeOSsDdE9kU2MwC2@app1.cnggvlg.mongodb.net/biterush?retryWrites=true&w=majority';

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    try {
      return await cachedPromise;
    } catch (e) {
      cachedPromise = null;
    }
  }

  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  cachedPromise = mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    family: 4
  });

  try {
    const db = await cachedPromise;
    console.log(`[+] MongoDB Connected: ${db.connection.host}`);
    return db;
  } catch (error) {
    cachedPromise = null;
    console.error(`[-] MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

// Initiate connection in background on module load
connectDB().catch(() => {});

module.exports = connectDB;
