/**
 * Server Entry Point
 * Boots the Express server on the configured PORT or exports for Vercel Serverless Function.
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[🚀] Server running smoothly at: http://localhost:${PORT}`);
    console.log(`[📦] BiteRush Food Delivery Platform`);
  });
}

module.exports = app;
