'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export default function Logo({ size = 'md', showName = true, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      className={`flex flex-col items-center ${className}`}
    >
      <div className="relative">
        {/* Logo Image - Replace with actual logo file */}
        <Image
          src="/images/logo.png"
          alt="Logo Sekolah"
          width={sizeMap[size].width}
          height={sizeMap[size].height}
          className="rounded-lg"
          onError={(e) => {
            // Fallback if logo not found
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.removeAttribute('hidden')
          }}
        />
        {/* Fallback Icon */}
        <svg
          className="text-blue-600 hidden"
          width={sizeMap[size].width}
          height={sizeMap[size].height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9M12 18.82L7 16.09V12.91L12 15.82L17 12.91V16.09L12 18.82ZM21 9L12 4.18L3 9L12 13.82L21 9Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {showName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-3 text-center"
        >
          <h1 className={`font-bold bg-gradient-to-r from-blue-700 via-green-600 to-orange-500 bg-clip-text text-transparent ${
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'
          }`}>
            Insan Cendekia Nusantara
          </h1>
        </motion.div>
      )}
    </motion.div>
  )
}