'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  minutes: number
  onTimeUp: () => void
  className?: string
}

export function Timer({ minutes, onTimeUp, className = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onTimeUp])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  const isLow = timeLeft <= 60 // Less than 1 minute

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isLow ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} ${className}`}>
      <Clock className="h-5 w-5" />
      <span className="font-mono font-bold">
        {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
