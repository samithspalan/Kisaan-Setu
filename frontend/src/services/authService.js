/**
 * Authentication Service
 * Handles all API calls related to user authentication
 * 
 * Features:
 * - User signup/registration
 * - User login with email/password
 * - User logout
 * - Get current authenticated user
 * - Google OAuth login
 * 
 * All requests include credentials: 'include' to handle JWT cookies
 */

const API_BASE = 'http://localhost:5000/api';

export const authService = {
  /**
   * Sign up a new farmer account
   * @param {string} username - Farmer's name
   * @param {string} email - Farm email address
   * @param {string} password - Account password (min 6 characters)
   * @returns {Promise<Object>} Response with user data and success message
   * 
   * Success Response:
   * {
   *   "message": "User created successfully",
   *   "user": { "_id": "...", "Username": "...", "email": "..." }
   * }
   * 
   * Error Response:
   * { "message": "User already exists" }
   */
  farmerSignup: async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ Username: username, email, password })
      });
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Log in to existing farmer account
   * @param {string} email - Account email
   * @param {string} password - Account password
   * @returns {Promise<Object>} Response with user data
   * 
   * Success Response:
   * {
   *   "user": { "_id": "...", "Username": "...", "email": "..." }
   * }
   * 
   * The JWT token is automatically set in httpOnly cookie by the server
   */
  farmerLogin: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Log out and clear JWT cookie
   * @returns {Promise<Object>} Logout confirmation
   * 
   * Response: { "message": "User logged out successfully" }
   */
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user details
   * Requires valid JWT token (automatically sent via cookies)
   * @returns {Promise<Object>} Current user data
   * 
   * Success Response:
   * {
   *   "user": { "_id": "...", "Username": "...", "email": "..." }
   * }
   * 
   * Error Response (401):
   * { "message": "User not authenticated" }
   */
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  /**
   * Log in using Google OAuth token
   * @param {string} token - Google ID token from Google OAuth
   * @returns {Promise<Object>} Response with user data
   * 
   * Success Response:
   * {
   *   "user": { "_id": "...", "Username": "...", "email": "..." }
   * }
   */
  googleLogin: async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token })
      });
      return await response.json();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }
};
