'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface TimerProps {
  initialSeconds: number
  onExpire?: () => void
  onTick?: (remaining: number) => void
  isPaused?: boolean
  showWarning?: boolean
  warningThreshold?: number // seconds
  criticalThreshold?: number // seconds
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Timer({
  initialSeconds,
  onExpire,
  onTick,
  isPaused = false,
  showWarning = true,
  warningThreshold = 60, // 1 minute
  criticalThreshold = 10, // 10 seconds
  size = 'md',
  className
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire?.()
          return 0
        }
        const newValue = prev - 1
        onTick?.(newValue)
        return newValue
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, onExpire, onTick])

  useEffect(() => {
    setIsWarning(seconds <= warningThreshold && seconds > criticalThreshold)
    setIsCritical(seconds <= criticalThreshold)
  }, [seconds, warningThreshold, criticalThreshold])

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-sm',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5 text-base',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2 text-lg',
      icon: 'w-5 h-5',
    },
  }

  const isExpired = seconds === 0
  const showPulse = isCritical && !isExpired

  return (
    <motion.div
      animate={showPulse ? {
        scale: [1, 1.05, 1],
        backgroundColor: [
          'rgb(254, 242, 242)',
          'rgb(254, 226, 226)',
          'rgb(254, 242, 242)',
        ],
      } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-mono font-bold transition-colors',
        sizeClasses[size].container,
        isExpired && 'bg-red-100 text-red-700',
        isCritical && !isExpired && 'bg-red-50 text-red-600 animate-timer-critical',
        isWarning && !isCritical && 'bg-amber-50 text-amber-600',
        !isWarning && !isCritical && !isExpired && 'bg-gray-100 text-gray-700',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isCritical && !isExpired ? (
          <motion.div
            key="alert"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <AlertTriangle className={cn(sizeClasses[size].icon, 'text-red-500')} />
          </motion.div>
        ) : (
          <motion.div
            key="clock"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Clock className={cn(
              sizeClasses[size].icon,
              isExpired ? 'text-red-600' :
                isCritical ? 'text-red-500' :
                  isWarning ? 'text-amber-500' : 'text-gray-500'
            )} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        animate={showPulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        {isExpired ? 'Waktu Habis!' : formatTime(seconds)}
      </motion.span>

      {/* Warning indicator dot */}
      {showWarning && isWarning && !isExpired && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-amber-500"
        />
      )}

      {showWarning && isCritical && !isExpired && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
      )}
    </motion.div>
  )
}

// Timer with progress bar underneath
interface TimerWithProgressProps extends TimerProps {
  showProgress?: boolean
  progressColor?: string
}

export function TimerWithProgress({
  showProgress = true,
  progressColor,
  ...props
}: TimerWithProgressProps) {
  const percentage = (props.initialSeconds - props.initialSeconds + (props.initialSeconds - props.initialSeconds)) / props.initialSeconds

  return (
    <div className="space-y-2">
      <Timer {...props} />
      {showProgress && (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full transition-colors',
              progressColor ||
              (props.initialSeconds <= 10 ? 'bg-red-500' :
                props.initialSeconds <= 60 ? 'bg-amber-500' : 'bg-blue-500')
            )}
            initial={{ width: '100%' }}
            animate={{
              width: `${(props.initialSeconds / props.initialSeconds) * 100}%`,
            }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  )
}

// Compact timer for inline display
export function CompactTimer({ seconds, className }: { seconds: number; className?: string }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isWarning = seconds <= 60 && seconds > 10
  const isCritical = seconds <= 10

  return (
    <motion.span
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      className={cn(
        'font-mono font-bold',
        isCritical && 'text-red-600',
        isWarning && !isCritical && 'text-amber-600',
        !isWarning && !isCritical && 'text-gray-600',
        className
      )}
    >
      {mins}:{secs.toString().padStart(2, '0')}
    </motion.span>
  )
}
