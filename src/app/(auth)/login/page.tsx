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
      // 1. Validasi user di database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, is_active, kelas_id, nama, email')
        .eq('username', data.username)
        .single()

      if (userError || !userData) {
        toast.error('Akun tidak ditemukan. Pastikan username sudah benar.')
        return
      }

      if (!userData.is_active) {
        toast.error('Akun Anda dinonaktifkan. Silakan hubungi guru.')
        return
      }

      // 2. Login dengan Supabase Auth - pakai email dari database
      const authEmail = userData.email || `${data.username.toLowerCase()}@insancendekia.com`

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: data.password,
      })

      if (signInError) {
        toast.error('Username atau password salah. Silakan coba lagi.')
        return
      }

      toast.success(`Selamat datang, ${userData.nama}!`)

      // 3. Redirect menggunakan full page reload
      // Ini memastikan cookies di-set sebelum middleware berjalan
      if (userData.role === 'guru') {
        window.location.href = '/guru'
      } else {
        window.location.href = '/siswa'
      }
    } catch (error: any) {
      toast.error('Terjadi kesalahan. Silakan coba lagi nanti.')
    } finally {
      setIsLoading(false)
    }
  }

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
}
