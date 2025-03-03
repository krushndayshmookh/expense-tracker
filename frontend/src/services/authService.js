import { api } from "src/boot/axios";

/**
 * Authentication service to interact with the backend auth API
 */
export const authService = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - API response with user data and token
   */
  async register(email, password) {
    const response = await api.post("/auth/register", { email, password });
    // Store the JWT token
    if (response.data && response.data.token) {
      localStorage.setItem("jwt_token", response.data.token);
    }
    return response.data;
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - API response with user data and token
   */
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    // Store the JWT token
    if (response.data && response.data.token) {
      localStorage.setItem("jwt_token", response.data.token);
    }
    return response.data;
  },

  /**
   * Get user profile
   * @returns {Promise} - API response with user data
   */
  async getProfile() {
    const response = await api.get("/auth/profile");
    return response;
  },

  /**
   * Logout user
   */
  logout() {
    // Clear token from localStorage
    localStorage.removeItem("jwt_token");
    // Reset API header
    delete api.defaults.headers.common["Authorization"];
    // Note: The auth store token is reset in the store's sign_out method
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user has token
   */
  isAuthenticated() {
    return !!localStorage.getItem("jwt_token");
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - API response
   */
  async requestPasswordReset(email) {
    const response = await api.post("/auth/request-reset", { email });
    return response.data;
  },

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {Promise} - API response with validation status
   */
  async verifyResetToken(token) {
    const response = await api.get(`/auth/verify-reset/${token}`);
    return response.data;
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} - API response with user data and token
   */
  async resetPassword(token, password) {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    // Store the JWT token
    if (response.data.token) {
      localStorage.setItem("jwt_token", response.data.token);
    }
    return response.data;
  },
};
