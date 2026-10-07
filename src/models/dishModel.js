const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: '🍕' },
  price: { type: Number, required: true },
  category: { type: String, default: 'Popular' }
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  items: [{
    dishId: String,
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Placed' }
}, {
  timestamps: true
});

const Dish = mongoose.model('Dish', dishSchema);
const Order = mongoose.model('Order', orderSchema);

const seedDishes = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const count = await Dish.countDocuments();
    if (count === 0) {
      await Dish.insertMany([
        { name: 'Cheesy Pizza', emoji: '🍕', price: 12.99, category: 'Popular Dishes' },
        { name: 'Double Burger', emoji: '🍔', price: 8.99, category: 'Popular Dishes' },
        { name: 'Crispy Tacos', emoji: '🌮', price: 6.99, category: 'Popular Dishes' }
      ]);
      console.log('[+] Default dishes seeded successfully into MongoDB.');
    }
  } catch (err) {
    console.error('[-] Seed Dishes Error:', err.message);
  }
};

module.exports = { Dish, Order, seedDishes };
