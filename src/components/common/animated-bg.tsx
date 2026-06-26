'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedBackgroundProps {
  variant?: 'minimal' | 'dots' | 'solid'
  className?: string
}

export default function AnimatedBackground({
  variant = 'solid',
  className = ''
}: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const renderSolid = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50">
      {/* Simple pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 82, 155, 0.08) 0%, transparent 50%)`
      }} />
    </div>
  )

  const renderDots = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />
    </div>
  )

  const renderMinimal = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50" />
  )

  const backgrounds = {
    solid: renderSolid,
    dots: renderDots,
    minimal: renderMinimal,
  }

  return (
    <div className={className}>
      {backgrounds[variant]?.()}
    </div>
  )
}

export function GradientText({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={className}>
      {children}
    </span>
  )
}

export function GlassCard({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function ShimmerButton({
  children,
  className = '',
  ...props
}: any) {
  return (
    <button className={`bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-4 py-2 font-medium transition-colors ${className}`} {...props}>
      {children}
    </button>
  )
}