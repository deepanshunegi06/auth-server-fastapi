import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ToastProvider, ToastItem } from '@/components/ui/Toast.jsx'
import useAuthStore from '@/store/authStore.js'
import { setUnauthorizedCallback, clearAuthToken } from '@/lib/axios.js'
import LandingPage from '@/pages/LandingPage.jsx'
import AuthPage from '@/pages/AuthPage.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'
import ApiDemoPage from '@/pages/ApiDemoPage.jsx'
import AdminPage from '@/pages/AdminPage.jsx'

// Toast context for global notifications
export const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const [toasts, setToasts] = useState([])
  const logout = useAuthStore((state) => state.logout)

  // Set up global 401 handler
  useEffect(() => {
    setUnauthorizedCallback(() => {
      clearAuthToken()
      logout()
    })
  }, [logout])

  const showToast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now()
    setToasts((prev) => [...prev.slice(-2), { id, title, description, variant, open: true }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/demo" element={<ApiDemoPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global toast notifications */}
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              open={t.open}
              onOpenChange={(open) => !open && dismissToast(t.id)}
              title={t.title}
              description={t.description}
              variant={t.variant}
            />
          ))}
        </BrowserRouter>
      </ToastProvider>
    </ToastContext.Provider>
  )
}
