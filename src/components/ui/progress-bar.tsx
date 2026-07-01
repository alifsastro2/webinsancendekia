'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  animated?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'default',
  animated = true,
  className
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-500 to-blue-600',
    success: 'bg-gradient-to-r from-green-400 to-green-500',
    warning: 'bg-gradient-to-r from-amber-400 to-amber-500',
    danger: 'bg-gradient-to-r from-red-400 to-red-500',
  }

  const getAutoVariant = () => {
    if (percentage >= 80) return 'success'
    if (percentage >= 50) return 'warning'
    return 'danger'
  }

  const finalVariant = variant === 'default' ? getAutoVariant() : variant

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            variantClasses[finalVariant]
          )}
        >
          {/* Shimmer effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />
          )}
        </motion.div>
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}

// Quiz progress indicator with steps
interface QuizProgressProps {
  current: number
  total: number
  answered: number[]
  className?: string
}

export function QuizProgress({ current, total, answered, className }: QuizProgressProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Soal <span className="font-semibold text-gray-900">{current + 1}</span> dari {total}
        </span>
        <span className="text-gray-500">
          {answered.length}/{total} terjawab
        </span>
      </div>
      <ProgressBar
        value={answered.length}
        max={total}
        variant="default"
        size="sm"
      />
    </div>
  )
}

// Circular progress for timer
interface CircularProgressProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  variant?: 'default' | 'warning' | 'danger'
  className?: string
}

export function CircularProgress({
  value,
  max,
  size = 60,
  strokeWidth = 6,
  showValue = true,
  variant = 'default',
  className
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const variantColors = {
    default: { stroke: '#3b82f6', bg: '#e5e7eb' },
    warning: { stroke: '#f59e0b', bg: '#fef3c7' },
    danger: { stroke: '#ef4444', bg: '#fee2e2' },
  }

  const colors = percentage <= 20 ? variantColors.danger :
    percentage <= 50 ? variantColors.warning :
      variantColors.default

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      {showValue && (
        <span
          className={cn(
            'absolute text-sm font-bold',
            percentage <= 20 ? 'text-red-600' :
              percentage <= 50 ? 'text-amber-600' : 'text-gray-700'
          )}
        >
          {value}
        </span>
      )}
    </div>
  )
}
