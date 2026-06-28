'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Logo from '@/components/common/logo'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nama: '', username: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nama || !form.username || !form.password) {
      toast.error('Semua field wajib diisi')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success('Akun guru berhasil dibuat! Silakan login.')
      setTimeout(() => router.push('/login'), 1000)
    } catch (err: any) {
      toast.error(err.message || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-rose-600 relative overflow-hidden flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Logo size="lg" showName={false} />
            </div>
            <h1 className="text-2xl font-bold text-white">Daftar Guru</h1>
            <p className="text-white/80 text-sm mt-1">Buat akun guru baru</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-gray-700 font-semibold text-sm">Nama Lengkap</Label>
                <Input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama lengkap"
                  className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold text-sm">Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Username"
                  className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold text-sm">Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="mt-2 h-12 border-2 border-gray-200 focus:border-red-400 rounded-xl"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Daftar
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
