/**
 * index.js - Controller for index.html (General Information & Landing Page)
 * Handles Header Authentication State and Navigation Interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[🏠 Landing Page] BiteRush homepage loaded successfully.");
  renderHeaderAuthState();
  setupSmoothScroll();
});

/**
 * Update Header Buttons Based on User Authentication State
 */
function renderHeaderAuthState() {
  const container = document.getElementById("headerAuthSlot");
  if (!container) return;

  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("auth_user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const firstName = user.fullname ? user.fullname.split(" ")[0] : "User";

      console.log(`[👤 Auth State] Authenticated as: ${user.fullname} (${user.email})`);

      container.innerHTML = `
        <a href="dashboard.html" class="btn-secondary">My Dashboard</a>
        <a href="dashboard.html" class="btn-primary">
          <span>Hello, ${firstName}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      `;
      return;
    } catch (e) {
      console.warn("[⚠️ Auth State] Error parsing stored user data:", e.message);
    }
  }

  // Unauthenticated State
  console.log("[🔓 Auth State] No active session. Showing Sign In / Get Started buttons.");
  container.innerHTML = `
    <a href="login.html" class="btn-secondary">Sign In</a>
    <a href="register.html" class="btn-primary">Get Started</a>
  `;
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        console.log(`[🔗 Navigation] Smooth scrolling to: ${targetId}`);
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  console.log("[🔗 Navigation] Smooth scroll listeners initialized.");
}
