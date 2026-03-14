import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

// Tailwind class merging helper
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format ISO date string for display
export function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

// Relative time display
export function timeAgo(date) {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Role display metadata
export function formatRole(role) {
  const map = {
    admin:     { label: 'Admin',     color: 'badge-admin' },
    moderator: { label: 'Moderator', color: 'badge-moderator' },
    user:      { label: 'User',      color: 'badge-user' },
  }
  return map[role] || { label: role, color: 'badge-user' }
}

// Role accent color for borders/rings
export function getRoleColor(role) {
  const map = {
    admin:     'border-purple-500 text-purple-400',
    moderator: 'border-amber-500 text-amber-400',
    user:      'border-brand text-brand',
  }
  return map[role] || 'border-brand text-brand'
}

// Decode JWT payload without verification (display only)
export function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Decode JWT header
export function parseJwtHeader(token) {
  try {
    const base64 = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// Password strength score 0-3
export function passwordStrength(password) {
  let score = 0
  if (password.length >= 8)  score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 3)
}
