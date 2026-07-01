'use client'

import { useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiOptions {
  score?: number
  threshold?: number
  particleCount?: number
  spread?: number
  colors?: string[]
}

export function useConfetti() {
  const triggerConfetti = useCallback((options: ConfettiOptions = {}) => {
    const {
      score = 0,
      threshold = 80,
      particleCount = 100,
      spread = 70,
      colors = ['#26c6da', '#0097a7', '#006064', '#ffd54f', '#ffb300', '#ff8f00', '#4caf50', '#2e7d32']
    } = options

    // Trigger confetti if score meets threshold
    if (score >= threshold) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread, ticks: 60, zIndex: 9999 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Fire from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors,
        })

        // Fire from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors,
        })
      }, 250)

      // Extra burst for high scores
      if (score >= 95) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ffd700', '#ffecb3', '#ffc107', '#ff9800', '#ff5722'],
            startVelocity: 45,
          })
        }, 500)
      }
    }
  }, [])

  const fireSuccess = useCallback(() => {
    const count = 200
    const defaults = { startVelocity: 30, spread: 360, ticks: 50, zIndex: 9999 }

    confetti({
      ...defaults,
      particleCount: count,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#4caf50', '#8bc34a', '#cddc39', '#009688', '#00bcd4'],
    })
  }, [])

  const fireSubmit = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#26c6da', '#0097a7', '#4caf50', '#ffb300'],
      startVelocity: 35,
    })
  }, [])

  return {
    triggerConfetti,
    fireSuccess,
    fireSubmit,
  }
}

// Component wrapper for automatic triggering
interface ConfettiTriggerProps {
  trigger: boolean
  score?: number
  threshold?: number
  onComplete?: () => void
}

export function ConfettiTrigger({ trigger, score, threshold = 80, onComplete }: ConfettiTriggerProps) {
  const { triggerConfetti } = useConfetti()

  useEffect(() => {
    if (trigger) {
      triggerConfetti({ score, threshold })
      onComplete?.()
    }
  }, [trigger, score, threshold, triggerConfetti, onComplete])

  return null
}
