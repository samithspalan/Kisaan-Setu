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

const API_BASE = 'http://localhost:8000/api';

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
      
      if (!response.ok) {
        const error = await response.json();
        return error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      return {
        message: error.message || 'Failed to connect to server. Please make sure the backend is running on port 5000.'
      };
    }
  },

  /**
   * Sign up a new customer account
   * @param {string} username - Customer's name
   * @param {string} email - Customer email address
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
  customerSignup: async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ Username: username, email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      return {
        message: error.message || 'Failed to connect to server. Please make sure the backend is running on port 5000.'
      };
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
      
      if (!response.ok) {
        const error = await response.json();
        return error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return {
        message: error.message || 'Failed to connect to server. Please make sure the backend is running on port 5000.'
      };
    }
  },

  /**
   * Log in to existing customer account
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
  customerLogin: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return {
        message: error.message || 'Failed to connect to server. Please make sure the backend is running on port 5000.'
      };
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
      
      if (!response.ok) {
        console.log('Logout failed with status:', response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      // Still return success even if the API call fails
      // because we're going to clear localStorage anyway
      return { message: 'Logged out' };
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
      
      if (!response.ok) {
        console.log('Auth check failed with status:', response.status);
        return { user: null };
      }
      
      const data = await response.json();
      console.log('getCurrentUser response:', data);
      return data;
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null };
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
