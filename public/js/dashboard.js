/**
 * dashboard.js — Controller for dashboard.html
 * Implements MongoDB data access, order history, cart management, and console logging consistent with login.js.
 */

let cart = [];
let dishes = [];
let orders = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('[📊 Dashboard] Page loaded successfully.');

  // Check auth session
  checkDashboardSession();

  // Fetch dishes and order history
  fetchDishes();
  fetchOrderHistory();

  // Event Listeners
  document.getElementById('cartBtn').addEventListener('click', toggleCart);
  document.getElementById('closeCartBtn').addEventListener('click', toggleCart);
  document.getElementById('orderNowBtn').addEventListener('click', placeOrder);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

/**
 * Session Verification with /api/me
 */
async function checkDashboardSession() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('[🔓 Session] No auth token found. Redirecting to login page...');
    window.location.href = 'login.html';
    return;
  }

  // Pre-populate username from cached user data immediately for smooth UI
  const cachedUserStr = localStorage.getItem('auth_user');
  if (cachedUserStr) {
    try {
      const cached = JSON.parse(cachedUserStr);
      const pillName = document.getElementById('userPillName');
      if (pillName && cached && cached.fullname) {
        pillName.textContent = cached.fullname.split(' ')[0];
      }
    } catch (e) {}
  }

  console.log('[🔑 Session] Auth token found. Verifying session with server...');

  try {
    const response = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user;
      console.log(`[✅ Session] Verified! Welcome back, ${user.fullname}.`);
      
      const pillName = document.getElementById('userPillName');
      if (pillName && user) {
        pillName.textContent = user.fullname.split(' ')[0];
      }
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else if (response.status === 401 || response.status === 403) {
      console.warn('[⚠️ Session] Token expired or invalid. Clearing session...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = 'login.html';
    } else {
      console.warn(`[⚠️ Session] Server response: ${response.status}. Maintaining local session.`);
    }
  } catch (err) {
    console.warn('[⚠️ Session] Verification network error. Session preserved:', err.message);
  }
}

/**
 * Fetch Popular Dishes from MongoDB API
 */
async function fetchDishes() {
  console.log('[📥 Dishes] Fetching popular dishes from MongoDB API...');
  try {
    const res = await fetch('/api/dishes');
    const data = await res.json();
    if (data.success && data.dishes) {
      dishes = data.dishes;
      console.log(`[✅ Dishes] Loaded ${dishes.length} dishes successfully.`);
      renderDishes(dishes);
    }
  } catch (err) {
    console.error('[❌ Dishes] Error fetching dishes:', err.message);
  }
}

/**
 * Render Dish List
 */
function renderDishes(dishList) {
  const container = document.getElementById('dishesList');
  if (!container) return;

  container.innerHTML = dishList.map(dish => `
    <div class="dish-card">
      <div class="dish-left">
        <span class="dish-emoji">${dish.emoji || '🍕'}</span>
        <span class="dish-name">${dish.name}</span>
      </div>
      <div class="dish-right">
        <span class="dish-price">$${dish.price.toFixed(2)}</span>
        <button class="add-btn" onclick="addToCart('${dish._id}')">Add to Order</button>
      </div>
    </div>
  `).join('');
}

/**
 * Fetch Order History from MongoDB API
 */
async function fetchOrderHistory() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  console.log('[📦 Orders] Fetching user order history from MongoDB...');
  try {
    const res = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success && data.orders) {
      orders = data.orders;
      console.log(`[✅ Orders] Fetched ${orders.length} historical orders.`);
      renderOrderHistory(orders);
    }
  } catch (err) {
    console.error('[❌ Orders] Failed to fetch order history:', err.message);
  }
}

/**
 * Render Order History List
 */
function renderOrderHistory(orderList) {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  if (orderList.length === 0) {
    container.innerHTML = `<div class="no-orders">No previous orders found. Place your first order above!</div>`;
    return;
  }

  container.innerHTML = orderList.map(order => {
    const itemsSummary = order.items
      ? order.items.map(i => `${i.name} x${i.quantity || 1}`).join(', ')
      : 'Meal Item';
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent';
    const orderId = order._id ? `BR-${order._id.substring(order._id.length - 6).toUpperCase()}` : 'BR-ORDER';

    return `
      <div class="order-card">
        <div class="order-card-header">
          <span class="order-id">${orderId} · ${dateStr}</span>
          <span class="order-status-badge">${order.status || 'Placed'}</span>
        </div>
        <div class="order-card-body">
          <span class="order-items-text">${itemsSummary}</span>
          <span class="order-total-text">$${(order.totalAmount || 0).toFixed(2)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Add Dish to Cart
 */
function addToCart(dishId) {
  const dish = dishes.find(d => d._id === dishId);
  if (!dish) return;

  console.log(`[🛒 Cart] Adding item to cart: ${dish.name} ($${dish.price})`);

  const existing = cart.find(item => item.dishId === dishId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      dishId: dish._id,
      name: dish.name,
      price: dish.price,
      quantity: 1
    });
  }

  updateCartUI();
  showToast(`Added ${dish.name} to order!`);
}

/**
 * Update Cart UI
 */
function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartCount.textContent = totalCount;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="color: var(--text-muted); text-align: center; font-size: 0.88rem;">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span>${item.name} x${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
}

/**
 * Toggle Cart Drawer Panel
 */
function toggleCart() {
  const panel = document.getElementById('cartPanel');
  panel.classList.toggle('hidden');
  console.log(`[🛒 Cart] Cart drawer toggled. Hidden: ${panel.classList.contains('hidden')}`);
}

/**
 * Place Order to MongoDB
 */
async function placeOrder() {
  if (cart.length === 0) {
    console.warn('[⚠️ Order] Cannot place order with empty cart.');
    showToast('Your cart is empty!');
    return;
  }

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('[⚠️ Order] User not authenticated.');
    showToast('Please log in to place an order.');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  console.log(`[📤 Order] Submitting order for ${cart.length} items. Total: $${totalPrice.toFixed(2)}`);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        totalAmount: totalPrice
      })
    });

    if (res.status === 401 || res.status === 403) {
      showToast('Session expired. Please log in again.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      return;
    }

    const data = await res.json();
    if (data.success) {
      console.log('[✅ Order] Order placed successfully in MongoDB!');
      showToast('🎉 Order placed successfully!');
      cart = [];
      updateCartUI();
      document.getElementById('cartPanel').classList.add('hidden');
      fetchOrderHistory(); // Refresh order history list
    } else {
      console.error('[❌ Order Failed]', data.message);
      showToast('Error: ' + data.message);
    }
  } catch (err) {
    console.error('[❌ Order Error] Failed to reach server:', err.message);
    showToast('Failed to connect to server.');
  }
}

/**
 * Show Toast Notification
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

/**
 * Sign Out & Clear Session
 */
function handleLogout() {
  console.log('[🚪 Logout] Clearing authentication token & redirecting to login page...');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.location.href = 'login.html';
}
