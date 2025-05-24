// components/UserBadge.tsx
import React, { useMemo } from 'react'

interface UserMetadata {
  displayName?: string       // from Supabase raw_user_meta_data
  display_name?: string      // alternative key
  name?: string              // generic
  full_name?: string         // alternative
}

interface User {
  user_metadata?: UserMetadata
  email?: string
}

interface UserBadgeProps {
  user: User
  size?: number        // Tailwind scale units (e.g. 8 → w-8 h-8)
  className?: string   // extra Tailwind classes
}

const COLOR_CLASSES = [
  'bg-red-500 text-red-100',
  'bg-green-500 text-green-100',
  'bg-blue-500 text-blue-100',
  'bg-yellow-500 text-yellow-900',
  'bg-indigo-500 text-indigo-100',
  'bg-purple-500 text-purple-100',
  'bg-pink-500 text-pink-100',
  'bg-teal-500 text-teal-100',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const UserBadge: React.FC<UserBadgeProps> = ({
  user,
  size = 10,
  className = '',
}) => {
  // 1. Try Supabase’s camelCase displayName first…
  const rawName =
    user.user_metadata?.displayName?.trim() ||
    user.user_metadata?.display_name?.trim() ||
    user.user_metadata?.name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    ''

  // 2. Fallback to email if no metadata name
  const fullName = rawName || user.email?.trim() || ''

  // 3. Build initials (or “?”)
  const parts = fullName.split(/\s+/).filter(Boolean)
  const initials = (
    (parts[0]?.[0] || '') +
    (parts.length > 1 ? parts[parts.length - 1][0] : '')
  ).toUpperCase() || '?'

  // 4. Stable color based on fullName
  const colorClass = useMemo(() => {
    if (!fullName) return COLOR_CLASSES[0]
    return COLOR_CLASSES[hashString(fullName) % COLOR_CLASSES.length]
  }, [fullName])

  // 5. Tailwind size & font
  const dimension = `w-${size} h-${size}`
  const fontSize =
    size <= 6 ? 'text-base' : size <= 10 ? 'text-lg' : 'text-xl'

  return (
    <div
      className={`
        ${dimension}
        ${fontSize}
        ${colorClass}
        rounded-full
        flex items-center justify-center
        font-semibold
        ${className}
      `}
      title={fullName || 'Unknown User'}
      aria-label={`User initials: ${initials}`}
    >
      {initials}
    </div>
  )
}

export default UserBadge
