const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// In-Memory Fallback Cache for local offline operation
const localUsers = [];

const UserModel = {
  findByEmail: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.findOne({ email: cleanEmail });
      }
    } catch (e) {}
    return localUsers.find(u => u.email === cleanEmail);
  },

  findById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.findById(id).select('-password');
      }
    } catch (e) {}
    const u = localUsers.find(u => u.id === id || u._id === id);
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  },

  create: async (fullname, email, passwordHash) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      if (mongoose.connection.readyState === 1) {
        const user = new User({ fullname: fullname.trim(), email: cleanEmail, password: passwordHash });
        const saved = await user.save();
        return { id: saved._id, fullname: saved.fullname, email: saved.email, password: saved.password };
      }
    } catch (e) {}

    const newUser = {
      id: 'usr_' + Date.now(),
      _id: 'usr_' + Date.now(),
      fullname: fullname.trim(),
      email: cleanEmail,
      password: passwordHash,
      created_at: new Date()
    };
    localUsers.push(newUser);
    return newUser;
  },

  seedDemoUser: async () => {
    const demoEmail = 'demo@example.com';
    const passwordHash = bcrypt.hashSync('password123', 10);
    try {
      if (mongoose.connection.readyState === 1) {
        const existing = await User.findOne({ email: demoEmail });
        if (!existing) {
          await User.create({ fullname: 'Demo User', email: demoEmail, password: passwordHash });
          console.log('[+] Demo Account Ready in MongoDB -> demo@example.com | password123');
        }
        return;
      }
    } catch (err) {}

    if (!localUsers.find(u => u.email === demoEmail)) {
      localUsers.push({
        id: 'usr_demo',
        _id: 'usr_demo',
        fullname: 'Demo User',
        email: demoEmail,
        password: passwordHash,
        created_at: new Date()
      });
      console.log('[+] Demo Account Ready (Local Fallback) -> demo@example.com | password123');
    }
  }
};

module.exports = UserModel;
