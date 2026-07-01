'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
}

const COLORS = [
  '#ffd700', // Gold
  '#ff6b6b', // Red
  '#4ecdc4', // Teal
  '#a855f7', // Purple
  '#f97316', // Orange
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#ec4899', // Pink
]

interface SparkleAnimationProps {
  isActive: boolean
  onComplete?: () => void
  duration?: number
  particleCount?: number
  className?: string
}

export function SparkleAnimation({
  isActive,
  onComplete,
  duration = 1000,
  particleCount = 20,
  className
}: SparkleAnimationProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    if (isActive) {
      // Generate random sparkles
      const newSparkles: Sparkle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
      }))
      setSparkles(newSparkles)

      // Clear after animation
      const timer = setTimeout(() => {
        setSparkles([])
        onComplete?.()
      }, duration + 500)

      return () => clearTimeout(timer)
    }
  }, [isActive, particleCount, duration, onComplete])

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{
              x: `${sparkle.x}%`,
              y: `${sparkle.y}%`,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              delay: sparkle.delay,
              ease: 'easeOut',
            }}
            className="absolute"
          >
            {/* Star shape */}
            <svg
              width={sparkle.size}
              height={sparkle.size}
              viewBox="0 0 24 24"
              fill={sparkle.color}
            >
              <path d="M12 0L14.59 8.41L24 11L17 18.59L18.59 24L12 20L5.41 24L7 18.59L0 11L9.41 8.41L12 0Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Button with sparkle effect on click
interface SparkleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  showSparkle?: boolean
  sparkleColors?: string[]
}

export function SparkleButton({
  children,
  isLoading,
  showSparkle = true,
  sparkleColors,
  className,
  disabled,
  onClick,
  ...props
}: SparkleButtonProps) {
  const [isSparkling, setIsSparkling] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (showSparkle && !disabled && !isLoading) {
      const rect = e.currentTarget.getBoundingClientRect()
      setPosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
      setIsSparkling(true)
    }
    onClick?.(e)
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        className={cn(
          'relative transition-all',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
      </motion.button>

      {/* Sparkle effect */}
      <AnimatePresence>
        {isSparkling && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: `${position.x}%`,
                  y: `${position.y}%`,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${position.x + (Math.random() - 0.5) * 200}%`,
                  y: `${position.y + (Math.random() - 0.5) * 200}%`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.02 }}
                className="absolute"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill={(sparkleColors || COLORS)[i % (sparkleColors?.length || COLORS.length)]}
                >
                  <path d="M12 0L14.59 8.41L24 11L17 18.59L18.59 24L12 20L5.41 24L7 18.59L0 11L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Success sparkle burst
interface SuccessSparkleProps {
  isActive: boolean
  onComplete?: () => void
  icon?: React.ReactNode
}

export function SuccessSparkle({ isActive, onComplete, icon }: SuccessSparkleProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    if (isActive) {
      const newSparkles: Sparkle[] = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return {
          id: i,
          x: 50 + Math.cos(angle) * 30,
          y: 50 + Math.sin(angle) * 30,
          size: Math.random() * 8 + 4,
          color: COLORS[i % COLORS.length],
          delay: 0,
        }
      })
      setSparkles(newSparkles)

      const timer = setTimeout(() => {
        setSparkles([])
        onComplete?.()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Icon */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {icon}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{
            x: `${sparkle.x}%`,
            y: `${sparkle.y}%`,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${sparkle.x + Math.cos((sparkle.id / 12) * Math.PI * 2) * 100}%`,
            y: `${sparkle.y + Math.sin((sparkle.id / 12) * Math.PI * 2) * 100}%`,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute"
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 24 24"
            fill={sparkle.color}
          >
            <path d="M12 0L14.59 8.41L24 11L17 18.59L18.59 24L12 20L5.41 24L7 18.59L0 11L9.41 8.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
