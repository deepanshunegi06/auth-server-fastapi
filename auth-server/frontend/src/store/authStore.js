import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  tokenExpiry: null,

  // Store credentials in memory only
  login: (userData, token, expiry) =>
    set({ user: userData, token, isAuthenticated: true, tokenExpiry: expiry }),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false, tokenExpiry: null }),

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),
}))

export default useAuthStore
