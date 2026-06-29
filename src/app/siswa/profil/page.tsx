'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Save, GraduationCap, Key, Shield, Edit3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { slideUpVariants } from '@/components/common/motion'

export default function siswaProfil() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    username: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('users')
        .select(`
          *,
          kelas:kelas(nama)
        `)
        .eq('id', session.user.id)
        .single()

      if (data) {
        setUser(data)
        setFormData({
          nama: data.nama,
          email: data.email || '',
          username: data.username
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.nama || !formData.username) {
      toast.error('Nama dan username wajib diisi')
      return
    }

    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi tidak valid')

      const { error } = await supabase
        .from('users')
        .update({
          nama: formData.nama,
          email: formData.email,
          username: formData.username
        })
        .eq('id', session.user.id)

      if (error) throw error

      toast.success('Profil berhasil diupdate')
      fetchUser()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Semua field password wajib diisi')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak sama')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }

    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi tidak valid')

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      toast.success('Password berhasil diubah')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.nama
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      className="p-4 lg:p-6 xl:p-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-600 mt-1">Kelola informasi akun Anda</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Profile Card */}
        <motion.div variants={slideUpVariants} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-l-4 border-teal-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Informasi Profil</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Kelola data diri Anda</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-teal-600 text-white text-2xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user?.nama}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {(user as any)?.kelas?.nama || 'Belum ada kelas'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">@{user?.username}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama lengkap"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Username"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (Opsional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contoh@email.com"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div variants={slideUpVariants} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Informasi Akun</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Detail dan status akun Anda</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Bergabung sejak:</span>
                <span className="text-gray-900">
                  {new Date(user?.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Badge className={user?.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                  {user?.is_active ? 'Akun Aktif' : 'Akun Nonaktif'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={slideUpVariants} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Key className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Ubah Password</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Ganti password akun Anda</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Password saat ini"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Password baru (minimal 6 karakter)"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi password baru"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={saving}
                variant="outline"
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Mengubah...' : 'Ubah Password'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}