'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/login-form'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (data: { username: string; password: string }) => {
    setIsLoading(true)
    try {
      // Get user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, is_active, kelas_id, nama')
        .eq('username', data.username)
        .single()

      if (userError || !userData) {
        throw new Error('Username tidak ditemukan')
      }

      if (!userData.is_active) {
        throw new Error('Akun Anda dinonaktifkan. Hubungi guru.')
      }

      // Sign in with Supabase Auth
      if (!userData.email) {
        throw new Error('Email tidak ditemukan')
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: data.password,
      })

      if (signInError) {
        throw new Error(signInError.message || 'Password salah')
      }

      toast.success(`Selamat datang, ${userData.nama}!`)

      // Redirect based on role
      setTimeout(() => {
        if (userData.role === 'guru') {
          router.push('/guru')
        } else {
          router.push('/siswa')
        }
      }, 500)
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
}