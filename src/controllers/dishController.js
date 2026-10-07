const { Dish, Order } = require('../models/dishModel');
const mongoose = require('mongoose');

const DEFAULT_DISHES = [
  { _id: 'dish_1', id: 'dish_1', name: 'Cheesy Pizza', emoji: '🍕', price: 12.99, category: 'Popular Dishes' },
  { _id: 'dish_2', id: 'dish_2', name: 'Double Burger', emoji: '🍔', price: 8.99, category: 'Popular Dishes' },
  { _id: 'dish_3', id: 'dish_3', name: 'Crispy Tacos', emoji: '🌮', price: 6.99, category: 'Popular Dishes' }
];

const localOrders = [];

const DishController = {
  // GET /api/dishes
  getDishes: async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const dishes = await Dish.find();
        if (dishes && dishes.length > 0) {
          return res.json({ success: true, dishes });
        }
      }
    } catch (err) {
      console.error('Error querying MongoDB dishes:', err.message);
    }
    res.json({ success: true, dishes: DEFAULT_DISHES });
  },

  // POST /api/orders
  createOrder: async (req, res) => {
    try {
      const { items, totalAmount } = req.body;
      const rawUserId = req.user ? (req.user.id || req.user._id) : null;
      const userId = rawUserId ? rawUserId.toString() : null;

      if (mongoose.connection.readyState === 1) {
        const order = new Order({
          userId,
          items,
          totalAmount,
          status: 'Placed'
        });
        await order.save();
        return res.status(201).json({ success: true, message: 'Order placed successfully in MongoDB!', order });
      }
    } catch (err) {
      console.error('MongoDB Order Create Error:', err.message);
    }

    const localOrder = {
      _id: 'ord_' + Date.now(),
      userId: req.user ? (req.user.id || req.user._id) : null,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      status: 'Placed',
      createdAt: new Date()
    };
    localOrders.push(localOrder);
    res.status(201).json({ success: true, message: 'Order placed successfully!', order: localOrder });
  },

  // GET /api/orders
  getOrders: async (req, res) => {
    try {
      const rawUserId = req.user ? (req.user.id || req.user._id) : null;
      const userId = rawUserId ? rawUserId.toString() : null;

      if (mongoose.connection.readyState === 1) {
        const query = userId ? { userId } : {};
        const orders = await Order.find(query).sort({ createdAt: -1 });
        return res.json({ success: true, orders });
      }
    } catch (err) {
      console.error('MongoDB Order Fetch Error:', err.message);
    }

    const userOrders = req.user
      ? localOrders.filter(o => !o.userId || o.userId === (req.user.id || req.user._id))
      : localOrders;
    res.json({ success: true, orders: userOrders });
  }
};

module.exports = DishController;
