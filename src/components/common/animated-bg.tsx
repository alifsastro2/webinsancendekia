'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'waves' | 'blobs' | 'full'
  className?: string
}

export default function AnimatedBackground({
  variant = 'gradient',
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

  const renderGradient = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(255, 31, 37, 0.15) 0%,
            transparent 50%)`
        }}
        transition={{ duration: 0.3 }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 via-yellow-50 to-cyan-50 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-purple-50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-50 via-rose-50 to-transparent" />
    </div>
  )

  const renderBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="blob-bg blob-1"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob-bg blob-2"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob-bg blob-3"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )

  const renderParticles = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            background: ['#ff1f25', '#ff6b35', '#f7c548', '#00d4ff', '#8b5cf6'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )

  const renderWaves = () => (
    <div className="fixed bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: `linear-gradient(to top, rgba(255, 31, 37, ${0.1 + i * 0.05}), transparent)`,
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )

  const renderFull = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {renderBlobs()}
      {renderParticles()}
      {renderWaves()}
    </div>
  )

  const backgrounds = {
    gradient: renderGradient,
    particles: renderParticles,
    waves: renderWaves,
    blobs: renderBlobs,
    full: renderFull,
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
    <span className={`text-gradient ${className}`}>
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
    <div className={`glass ${className}`}>
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
    <button className={`btn-shine ${className}`} {...props}>
      {children}
    </button>
  )
}