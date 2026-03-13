/**
 * Utility functions for the AuthCore frontend application.
 * 
 * Includes helpers for:
 * - Tailwind CSS class merging
 * - Date/time formatting
 * - JWT token parsing
 * - Password strength validation
 */
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * @param {...string} inputs - CSS class strings to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date, options = {}) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

// Format date with time
export function formatDateTime(date) {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Parse JWT token payload
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

// Parse JWT header
export function parseJwtHeader(token) {
  try {
    const base64Url = token.split('.')[0]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Format role for display
export function formatRole(role) {
  if (!role) return { label: 'Unknown', color: 'text-slate-400' }
  const roles = {
    admin: { label: 'Admin', color: 'text-purple-400' },
    moderator: { label: 'Moderator', color: 'text-amber-400' },
    user: { label: 'User', color: 'text-brand' },
  }
  return roles[role] || { label: role.charAt(0).toUpperCase() + role.slice(1), color: 'text-slate-400' }
}

// Check password strength
export function passwordStrength(password) {
  if (!password) return { score: 0, label: 'None', color: 'gray' }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'red' }
  if (score <= 4) return { score, label: 'Medium', color: 'yellow' }
  return { score, label: 'Strong', color: 'green' }
}
