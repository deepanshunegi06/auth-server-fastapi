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

// Logout callback - will be set by App
let onUnauthorized = null
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

// Helper to set token (called from authStore)
export const setAuthToken = (token) => {
  window.__authToken = token
}

export const clearAuthToken = () => {
  window.__authToken = null
}

export default api
