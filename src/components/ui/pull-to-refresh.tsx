'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  pullThreshold?: number
  className?: string
  disabled?: boolean
}

export function PullToRefresh({
  onRefresh,
  children,
  pullThreshold = 80,
  className,
  disabled = false
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const y = useMotionValue(0)
  const springY = useSpring(y, {
    stiffness: 300,
    damping: 30,
    mass: 1,
  })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return

    // Only activate when at top of scroll
    if (containerRef.current && containerRef.current.scrollTop > 0) return

    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return

    // Only activate when at top of scroll
    if (containerRef.current && containerRef.current.scrollTop > 0) return

    const touch = e.touches[0]
    const deltaY = Math.max(0, touch.clientY - (e.target as HTMLElement).getBoundingClientRect().top)

    // Apply resistance as user pulls further
    const resistance = 0.5
    const newY = Math.min(deltaY * resistance, pullThreshold * 1.5)
    y.set(newY)
  }, [disabled, isRefreshing, isPulling, y, pullThreshold])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return

    setIsPulling(false)

    const currentY = y.get()
    if (currentY >= pullThreshold) {
      setIsRefreshing(true)
      y.set(40)

      try {
        await onRefresh()
      } finally {
        y.set(0)
        setIsRefreshing(false)
      }
    } else {
      y.set(0)
    }
  }, [disabled, isRefreshing, y, pullThreshold, onRefresh])

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn('overflow-y-auto h-full', className)}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {isPulling && !isRefreshing && (
          <motion.div
            style={{ y: springY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center items-center py-2 bg-gradient-to-b from-gray-100 to-transparent z-10"
          >
            <motion.div
              animate={{
                rotate: y.get() > pullThreshold ? 180 : 0,
                scale: y.get() > pullThreshold ? 1.2 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
              <motion.div
                animate={{
                  rotate: y.get() > pullThreshold ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <RefreshCw className={cn(
                  'w-5 h-5 text-gray-600',
                  y.get() > pullThreshold && 'text-blue-600'
                )} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refreshing indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex justify-center items-center py-4 bg-gradient-to-b from-blue-50 to-transparent"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full bg-blue-500 shadow-lg flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}

// Simple refresher for mobile lists
interface MobileRefresherProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function MobileRefresher({ onRefresh, children, className }: MobileRefresherProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      pullThreshold={60}
      className={cn('touch-pan-y', className)}
    >
      {children}
    </PullToRefresh>
  )
}
