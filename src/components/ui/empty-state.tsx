'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Ilustrasi SVG untuk berbagai empty state
const EmptyIllustrations = {
  book: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M24 32C24 28.6863 26.6863 26 30 26H98C101.314 26 104 28.6863 104 32V96C104 99.3137 101.314 102 98 102H30C26.6863 102 24 99.3137 24 96V32Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <motion.path
        d="M64 26V102"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
      />
      <motion.path
        d="M40 42H52M40 54H52M40 66H52M76 42H88M76 54H88M76 66H88"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
    </svg>
  ),
  quiz: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.rect
        x="24"
        y="28"
        width="80"
        height="72"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      />
      <motion.circle
        cx="44"
        cy="52"
        r="6"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      />
      <motion.circle
        cx="64"
        cy="52"
        r="6"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
      <motion.circle
        cx="84"
        cy="52"
        r="6"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      <motion.path
        d="M40 72H88"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      />
      <motion.path
        d="M40 82H72"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
      {/* Floating elements */}
      <motion.circle
        cx="100"
        cy="24"
        r="4"
        fill="currentColor"
        className="opacity-50"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="108"
        cy="40"
        r="3"
        fill="currentColor"
        className="opacity-30"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  ),
  users: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="64"
        cy="44"
        r="20"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      />
      <motion.path
        d="M28 104C28 87.4315 41.4315 74 58 74H70C86.5685 74 100 87.4315 100 104"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* Plus icon */}
      <motion.g
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
      >
        <circle cx="96" cy="32" r="16" fill="currentColor" className="text-primary" />
        <path d="M96 24V40M88 32H104" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  ),
  folder: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M16 36V100C16 103.314 18.6863 106 22 106H106C109.314 106 112 103.314 112 100V46C112 42.6863 109.314 40 106 40H58L44 26H22C18.6863 26 16 28.6863 16 32V36Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      {/* Floating paper */}
      <motion.div
        initial={{ y: 20, opacity: 0, rotate: -10 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute top-8 right-8"
      >
        <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="white" />
          <path d="M12 16H28M12 22H28M12 28H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
      {/* Sparkles */}
      <motion.circle
        cx="24"
        cy="24"
        r="3"
        fill="currentColor"
        className="text-amber-400"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle
        cx="104"
        cy="20"
        r="2"
        fill="currentColor"
        className="text-amber-400"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  ),
  check: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="64"
        cy="64"
        r="40"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.path
        d="M44 64L58 78L84 52"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      {/* Confetti */}
      <motion.rect
        x="20"
        y="20"
        width="8"
        height="8"
        rx="1"
        fill="currentColor"
        className="text-green-400"
        animate={{ rotate: [0, 360], y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.rect
        x="100"
        y="24"
        width="6"
        height="6"
        rx="1"
        fill="currentColor"
        className="text-blue-400"
        animate={{ rotate: [0, -360], y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="24"
        cy="80"
        r="4"
        fill="currentColor"
        className="text-purple-400"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
    </svg>
  ),
  clock: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="64"
        cy="64"
        r="44"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.path
        d="M64 32V64L84 76"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      {/* Hour markers */}
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.circle
          key={angle}
          cx={64 + 36 * Math.cos((angle - 90) * Math.PI / 180)}
          cy={64 + 36 * Math.sin((angle - 90) * Math.PI / 180)}
          r="4"
          fill="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
        />
      ))}
      {/* Animated pendulum */}
      <motion.line
        x1="64"
        y1="64"
        x2="64"
        y2="24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ rotate: [-5, 5, -5] }}
        style={{ originX: "64px", originY: "64px" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  ),
  search: (
    <svg className="w-32 h-32" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.circle
        cx="56"
        cy="56"
        r="28"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.line
        x1="76"
        y1="76"
        x2="100"
        y2="100"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />
      {/* Magnifying glass moving */}
      <motion.g
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="56" cy="56" r="28" stroke="currentColor" strokeWidth="3" fill="white" />
        <line x1="76" y1="76" x2="100" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
    </svg>
  ),
}

export type EmptyIllustrationType = keyof typeof EmptyIllustrations

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  illustration?: EmptyIllustrationType
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  illustration = 'book',
  action,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
        className="relative mb-6"
      >
        <div className="text-gray-300 dark:text-gray-600">
          {EmptyIllustrations[illustration]}
        </div>

        {/* Floating particles */}
        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-amber-400"
          animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-blue-400"
          animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
        />
        <motion.div
          className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-green-400"
          animate={{ x: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
        />
      </motion.div>

      {/* Icon fallback */}
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="mb-4"
        >
          <Icon className="w-12 h-12 text-gray-300" />
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-xl font-semibold text-gray-700 mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-gray-500 text-sm max-w-sm mb-6"
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
