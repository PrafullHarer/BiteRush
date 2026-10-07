/**
 * User Model
 * Manages user schema and database operations with MongoDB Atlas.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const UserModel = {
  findByEmail: async (email) => {
    if (!email) return null;
    await connectDB();
    const cleanEmail = email.toLowerCase().trim();
    return await User.findOne({ email: cleanEmail });
  },

  findById: async (id) => {
    if (!id) return null;
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await User.findById(id).select('-password');
    }
    return null;
  },

  create: async (fullname, email, passwordHash) => {
    await connectDB();
    const cleanEmail = email.toLowerCase().trim();
    const user = new User({
      fullname: fullname.trim(),
      email: cleanEmail,
      password: passwordHash
    });
    const saved = await user.save();
    console.log(`[+] User saved in MongoDB: ${saved.email} (${saved._id})`);
    return saved;
  },

  seedDemoUser: async () => {
    try {
      await connectDB();
      const demoEmail = 'demo@example.com';
      const existing = await User.findOne({ email: demoEmail });
      if (!existing) {
        const passwordHash = bcrypt.hashSync('password123', 10);
        await User.create({ fullname: 'Demo User', email: demoEmail, password: passwordHash });
        console.log('[+] Demo Account Ready in MongoDB -> demo@example.com | password123');
      }
    } catch (err) {
      console.warn('Demo user seed check:', err.message);
    }
  }
};

module.exports = UserModel;
