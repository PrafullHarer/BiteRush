const { Dish, Order } = require('../models/dishModel');
const mongoose = require('mongoose');
const connectDB = require('../config/database');

const DEFAULT_DISHES = [
  { _id: 'dish_1', id: 'dish_1', name: 'Cheesy Pizza', emoji: '🍕', price: 12.99, category: 'Popular Dishes' },
  { _id: 'dish_2', id: 'dish_2', name: 'Double Burger', emoji: '🍔', price: 8.99, category: 'Popular Dishes' },
  { _id: 'dish_3', id: 'dish_3', name: 'Crispy Tacos', emoji: '🌮', price: 6.99, category: 'Popular Dishes' }
];

const DishController = {
  // GET /api/dishes
  getDishes: async (req, res) => {
    try {
      await connectDB();
      const dishes = await Dish.find();
      if (dishes && dishes.length > 0) {
        return res.json({ success: true, dishes });
      }
    } catch (err) {
      console.error('Error querying MongoDB dishes:', err.message);
    }
    res.json({ success: true, dishes: DEFAULT_DISHES });
  },

  // POST /api/orders
  createOrder: async (req, res) => {
    try {
      await connectDB();
      const { items, totalAmount } = req.body;
      const rawUserId = req.user ? (req.user.id || req.user._id) : null;
      const userId = rawUserId ? rawUserId.toString() : null;

      const order = new Order({
        userId,
        items,
        totalAmount,
        status: 'Placed'
      });
      await order.save();
      console.log(`[+] Order saved in MongoDB: ${order._id} for user ${userId}`);
      return res.status(201).json({ success: true, message: 'Order placed successfully in MongoDB!', order });
    } catch (err) {
      console.error('MongoDB Order Create Error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to place order in database: ' + err.message });
    }
  },

  // GET /api/orders
  getOrders: async (req, res) => {
    try {
      await connectDB();
      const rawUserId = req.user ? (req.user.id || req.user._id) : null;
      const userId = rawUserId ? rawUserId.toString() : null;

      const query = userId ? { userId } : {};
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    } catch (err) {
      console.error('MongoDB Order Fetch Error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to retrieve orders: ' + err.message, orders: [] });
    }
  }
};

module.exports = DishController;
