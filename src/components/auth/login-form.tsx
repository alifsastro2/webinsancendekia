'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Logo from '@/components/common/logo'

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => Promise<void>
  isLoading?: boolean
  error?: string
}

export default function LoginForm({ onSubmit, isLoading = false, error = '' }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!username || !password) {
      setLocalError('Username dan password harus diisi')
      return
    }

    try {
      await onSubmit({ username, password })
    } catch (err: any) {
      setLocalError(err.message || 'Gagal login. Silakan coba lagi.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-green-600 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-green-400/30 to-emerald-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative min-h-screen flex items-center justify-center p-4"
      >
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-green-600 to-orange-500 p-8 pb-16">
              {/* Wave decoration */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                </svg>
              </div>

              {/* Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                  <Logo size="lg" showName={false} />
                </div>
                <h1 className="text-2xl font-bold text-white text-center">
                  Insan Cendekia Nusantara
                </h1>
                <p className="text-white/90 text-sm mt-1">
                  Platform Pembelajaran Digital
                </p>
              </motion.div>
            </div>

            {/* Form Section */}
            <div className="p-8 -mt-8">
              {(error || localError) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {error || localError}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="username" className="text-gray-700 font-medium text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="mt-2 h-12 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all rounded-xl"
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="mt-2 h-12 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all rounded-xl"
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-700 via-green-600 to-orange-500 hover:from-blue-800 hover:via-green-700 hover:to-orange-600 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all rounded-xl relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Masuk...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Masuk
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.p
                className="mt-8 text-center text-gray-400 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                © 2024 Insan Cendekia Nusantara
              </motion.p>
            </div>
          </div>

          {/* Bottom decoration */}
          <motion.div
            className="mt-8 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-8 h-1 bg-white/30 rounded-full"
                animate={{
                  scaleX: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}