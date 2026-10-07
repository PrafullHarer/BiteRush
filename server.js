/**
 * Server Entry Point
 * Boots the Express server on the configured PORT.
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[🚀] Server running smoothly at: http://localhost:${PORT}`);
  console.log(`[📦] BiteRush Food Delivery Platform`);
});
