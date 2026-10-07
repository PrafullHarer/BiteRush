/**
 * MongoDB Atlas Connection Manager
 * Ultra-resilient connection with direct replica set fallback and DNS optimization for Vercel Serverless.
 */

const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Fix AWS Lambda / Vercel SRV DNS timeouts by using public Google/Cloudflare DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

// Standard Direct Replica Set URI (connects directly to cluster nodes without requiring DNS SRV lookups)
const DIRECT_MONGODB_URI = 'mongodb://harerprafull_db_user:IeOSsDdE9kU2MwC2@ac-hpbku1h-shard-00-00.cnggvlg.mongodb.net:27017,ac-hpbku1h-shard-00-01.cnggvlg.mongodb.net:27017,ac-hpbku1h-shard-00-02.cnggvlg.mongodb.net:27017/biterush?ssl=true&replicaSet=atlas-gwh3xo-shard-0&authSource=admin&retryWrites=true&w=majority';

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

  const primaryUri = process.env.MONGODB_URI || DIRECT_MONGODB_URI;

  const connectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  cachedPromise = mongoose.connect(primaryUri, connectOptions)
    .catch(async (primaryErr) => {
      console.warn(`[!] Primary MongoDB attempt failed: ${primaryErr.message}. Connecting via direct replica set...`);
      return mongoose.connect(DIRECT_MONGODB_URI, connectOptions);
    })
    .then(db => {
      console.log(`[+] MongoDB Connected: ${db.connection.host}`);
      return db;
    })
    .catch(err => {
      cachedPromise = null;
      console.error(`[-] MongoDB Connection Error: ${err.message}`);
      throw err;
    });

  return await cachedPromise;
};

// Initiate connection in background on module load
connectDB().catch(() => {});

module.exports = connectDB;
