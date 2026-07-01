'use client'

import { forwardRef, useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface AnimatedFormFieldProps {
  label: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  required?: boolean
  icon?: React.ReactNode
  className?: string
}

export const AnimatedFormField = forwardRef<HTMLInputElement, AnimatedFormFieldProps>(
  ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    disabled,
    required,
    icon,
    className
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const inputId = useId()

    const hasValue = value && value.length > 0
    const isFloating = isFocused || hasValue

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

    return (
      <div className={cn('relative', className)}>
        {/* Floating Label */}
        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            y: isFloating ? -28 : 0,
            x: isFloating ? -4 : 0,
            scale: isFloating ? 0.85 : 1,
            color: error
              ? '#dc2626'
              : isFocused
                ? '#dc2626'
                : '#64748b'
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-4 top-3.5 origin-left pointer-events-none z-10 bg-white px-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </motion.label>

        {/* Input Container */}
        <div className="relative">
          {/* Icon (if provided) */}
          {icon && (
            <motion.div
              animate={{
                color: isFocused ? '#dc2626' : '#94a3b8',
              }}
              transition={{ duration: 0.2 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20"
            >
              {icon}
            </motion.div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full rounded-xl border-2 bg-white px-4 py-3.5 text-sm outline-none transition-all duration-200',
              'focus:ring-4',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-red-400 focus:ring-red-400/10',
              disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
              icon && 'pl-10',
              type === 'password' && 'pr-10'
            )}
          />

          {/* Password Toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Focus Ring Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute -inset-0.5 rounded-xl -z-10',
              error ? 'bg-red-500/20' : 'bg-red-400/20'
            )}
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-red-500 text-xs mt-1.5 pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedFormField.displayName = 'AnimatedFormField'


// ============================================
// Textarea with Animated Label
// ============================================
interface AnimatedTextareaProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  className?: string
}

export const AnimatedTextarea = forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({
    label,
    placeholder,
    value,
    onChange,
    error,
    disabled,
    required,
    rows = 4,
    className
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const textareaId = useId()

    const hasValue = value && value.length > 0
    const isFloating = isFocused || hasValue

    return (
      <div className={cn('relative', className)}>
        {/* Floating Label */}
        <motion.label
          htmlFor={textareaId}
          initial={false}
          animate={{
            y: isFloating ? -28 : 0,
            x: isFloating ? -4 : 0,
            scale: isFloating ? 0.85 : 1,
            color: error
              ? '#dc2626'
              : isFocused
                ? '#dc2626'
                : '#64748b'
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-4 top-3.5 origin-left pointer-events-none z-10 bg-white px-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </motion.label>

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className={cn(
            'w-full rounded-xl border-2 bg-white px-4 py-3.5 text-sm outline-none transition-all duration-200 resize-none',
            'focus:ring-4',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-gray-200 focus:border-red-400 focus:ring-red-400/10',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
          )}
        />

        {/* Focus Ring Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute -inset-0.5 rounded-xl -z-10',
            error ? 'bg-red-500/20' : 'bg-red-400/20'
          )}
        />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-red-500 text-xs mt-1.5 pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedTextarea.displayName = 'AnimatedTextarea'
