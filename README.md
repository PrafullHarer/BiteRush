# 🚀 BiteRush — Food Delivery Platform

BiteRush is a fast, full-stack food delivery application built with Node.js, Express, JavaScript, and MongoDB.

---

## 🛠️ Tech Stack & Technologies

- **Backend:** Node.js & Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Frontend:** Vanilla HTML5, CSS3 (Monochrome Dark Theme), Vanilla JavaScript
- **Security:** JWT (JSON Web Tokens), `bcryptjs` Password Hashing

---

## 🌟 Key Features

1. **User Authentication:**
   - Secure Registration & Login with JWT session validation.
   - Profile authentication middleware protecting dashboard routes.

2. **Simple Monochrome Dashboard:**
   - Pure black & white minimalist UI matched to the main landing page aesthetic.
   - **Popular Dishes List:** Quick "Add to Order" action.
   - **Cart Drawer:** Real-time quantity, total price calculation, and order placement.
   - **Order History:** Displays past orders fetched directly from MongoDB.

3. **MongoDB Integration:**
   - Connected via `MONGODB_URI` string.
   - Models for `User`, `Dish`, and `Order`.

---

## 🚦 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/PrafullHarer/BiteRush.git
cd BiteRush

# Install dependencies
npm install

# Start the server
npm start
```

Open `http://localhost:3000` in your browser.

---

## 🔑 Demo Credentials
- **Email:** `demo@example.com`
- **Password:** `password123`
