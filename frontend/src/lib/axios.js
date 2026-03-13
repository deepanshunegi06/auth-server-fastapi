/**
 * Axios API client configuration for AuthCore frontend.
 * 
 * Provides a pre-configured axios instance with:
 * - Base URL from environment or localhost default
 * - Automatic JWT token attachment to requests
 * - Global 401 unauthorized handling
 */
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Callback function triggered on 401 unauthorized responses */
let onUnauthorized = null

/**
 * Register a callback to be invoked when a 401 response is received.
 * @param {Function} callback - Function to call on unauthorized response
 */
export const setUnauthorizedCallback = (callback) => {
  onUnauthorized = callback
}

// Request interceptor - attach token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from zustand store (if available in memory)
    const token = window.__authToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state and trigger logout
      window.__authToken = null
      if (onUnauthorized) {
        onUnauthorized()
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Store the JWT token for API requests.
 * @param {string} token - The JWT access token
 */
export const setAuthToken = (token) => {
  window.__authToken = token
}

/**
 * Clear the stored JWT token (used on logout).
 */
export const clearAuthToken = () => {
  window.__authToken = null
}

export default api
