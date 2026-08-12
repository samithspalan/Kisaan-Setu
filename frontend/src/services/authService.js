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

import { API_BASE } from '../config/api'

const parseJsonSafe = async (response) => {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return {
      message: `Invalid server response (status ${response.status}).`
    }
  }
}

const toApiError = (response, payload, fallbackMessage) => ({
  message:
    payload?.message ||
    `${fallbackMessage} (status ${response.status}). Check backend URL/CORS and redeploy.`
})

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
        body: JSON.stringify({ Username: username, email, password, role: 'farmer' })
      });

      const result = await parseJsonSafe(response)
      if (!response.ok) {
        return toApiError(response, result, 'Signup failed')
      }

      // Save user data to localStorage
      if (result.user) {
        localStorage.setItem('userId', result.user._id)
        localStorage.setItem('userName', result.user.Username)
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', result.user.role)
      }

      return result;
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
        body: JSON.stringify({ Username: username, email, password, role: 'customer' })
      });

      const result = await parseJsonSafe(response)
      if (!response.ok) {
        return toApiError(response, result, 'Signup failed')
      }

      // Save user data to localStorage
      if (result.user) {
        localStorage.setItem('userId', result.user._id)
        localStorage.setItem('userName', result.user.Username)
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', result.user.role)
      }

      return result;
    } catch (error) {
      console.error('[AUTH] Signup error:', error);
      return {
        message: error.message || 'Failed to connect to server. Please make sure the backend is running on port 8000.'
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

      const result = await parseJsonSafe(response)
      if (!response.ok) {
        return toApiError(response, result, 'Login failed')
      }

      // Save user data to localStorage
      if (result.user) {
        localStorage.setItem('userId', result.user._id)
        localStorage.setItem('userName', result.user.Username)
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', result.user.role)
      }

      return result;
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

      const result = await parseJsonSafe(response)
      if (!response.ok) {
        return toApiError(response, result, 'Login failed')
      }

      // Save user data to localStorage
      if (result.user) {
        localStorage.setItem('userId', result.user._id)
        localStorage.setItem('userName', result.user.Username)
        localStorage.setItem('userEmail', result.user.email)
        localStorage.setItem('userType', result.user.role)
      }

      return result;
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
      const result = await parseJsonSafe(response)
      
      if (!response.ok) {
        console.log('Logout failed with status:', response.status);
      }

      return result;
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
        return { user: null };
      }

      const data = await parseJsonSafe(response)
      if (data.user) {
        localStorage.setItem('userType', data.user.role)
      }
      return data;
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null };
    }
  },

  /**
   * Log in using Google OAuth token
   * @param {string} token - Google ID token from Google OAuth
   * @param {string} role - Intended role ('farmer' or 'customer'), only used the first
   *   time this account signs in; existing accounts keep their original role.
   * @returns {Promise<Object>} Response with user data
   *
   * Success Response:
   * {
   *   "user": { "_id": "...", "Username": "...", "email": "...", "role": "..." }
   * }
   */
  googleLogin: async (token, role = 'farmer') => {
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, role })
      });
      const result = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error(toApiError(response, result, 'Google login failed').message)
      }
      if (result.user) {
        localStorage.setItem('userType', result.user.role)
      }
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  /**
   * Dev-only shortcut: logs in as a fixed local farmer account, creating
   * it via signup the first time it's used against a fresh database.
   * Goes through the real signup/login endpoints — never fabricates a
   * client-side session — so it can't drift from the server's actual
   * auth/role state.
   *
   * The import.meta.env.DEV check lives here (not just at the call
   * site) so the credentials and this function's body are dead code
   * that Vite's production build strips from the shipped bundle,
   * rather than merely unreachable via the UI.
   */
  devLogin: async () => {
    if (!import.meta.env.DEV) {
      return { message: 'Dev login is not available in production.' }
    }

    const email = 'dev@kisansetu.test'
    const password = 'DevLogin123!'

    const loginResult = await authService.farmerLogin(email, password)
    if (loginResult.user) return loginResult

    return authService.farmerSignup('Dev Farmer', email, password)
  }
};
