/**
 * Zustand authentication state store.
 * 
 * Manages user session data in memory (not persisted to localStorage
 * for security reasons). Handles login, logout, and user updates.
 */
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  /** Currently authenticated user object */
  user: null,
  /** JWT access token */
  token: null,
  /** Authentication status flag */
  isAuthenticated: false,
  /** Token expiration timestamp */
  tokenExpiry: null,

  /**
   * Set authenticated user state after successful login.
   * @param {Object} userData - User profile data
   * @param {string} token - JWT access token
   * @param {Date} expiry - Token expiration time
   */
  login: (userData, token, expiry) =>
    set({ user: userData, token, isAuthenticated: true, tokenExpiry: expiry }),

  /**
   * Clear all authentication state on logout.
   */
  logout: () =>
    set({ user: null, token: null, isAuthenticated: false, tokenExpiry: null }),

  /**
   * Partial update of user profile data.
   * @param {Object} userData - Fields to update
   */
  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),
}))

export default useAuthStore
