import apiClient from './apiClient';

// Auth endpoints don't need token, so we use the base apiClient
// The interceptor will just not add token if none exists

export const authService = {
  /**
   * Register a new user
   * @param {string} username
   * @param {string} password
   * @param {string} email (optional)
   * @returns {Promise<{token, user_id, username}>}
   */
  async register(username, password, email = '') {
    const response = await apiClient.post('/auth/register/', {
      username,
      password,
      email,
    });

    // Store token automatically after registration
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        username: response.data.username,
      }));
    }

    return response.data;
  },

  /**
   * Login and get token
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token, user_id, username}>}
   */
  async login(username, password) {
    const response = await apiClient.post('/auth/login/', {
      username,
      password,
    });

    // Store token
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        username: response.data.username,
      }));
    }

    return response.data;
  },

  /**
   * Logout - clear local storage and invalidate token on server
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      // Even if server logout fails, clear local storage
      console.warn('Server logout failed:', error);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  /**
   * Get current user info from server
   * @returns {Promise<{user_id, username, email}>}
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  /**
   * Check if user is logged in (has token in localStorage)
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get stored user info from localStorage
   * @returns {object|null}
   */
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get token from localStorage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('authToken');
  },
};

export default authService;
