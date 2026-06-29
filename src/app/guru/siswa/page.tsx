'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  ShieldCheck,
  Users,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface User {
  id: string
  nama: string
  username: string
  email: string | null
  kelas_id: string | null
  is_active: boolean
  kelas?: { nama: string }
}

interface Kelas {
  id: string
  nama: string
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function KelolaSiswa() {
  const [siswa, setSiswa] = useState<User[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [filteredSiswa, setFilteredSiswa] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    kelas_id: '',
    password: ''
  })

  useEffect(() => {
    fetchKelas()
    fetchSiswa()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = siswa.filter(m =>
        m.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.username.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredSiswa(filtered)
    } else {
      setFilteredSiswa(siswa)
    }
  }, [search, siswa])

  const fetchKelas = async () => {
    const { data } = await supabase.from('kelas').select('*').order('nama')
    if (data) setKelas(data)
  }

  const fetchSiswa = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'siswa')
        .order('nama')

      if (error) {
        console.error('Supabase error:', error)
        toast.error('Gagal memuat data siswa: ' + error.message)
        return
      }

      if (data) {
        // Fetch kelas data for each siswa
        const kelasIds = [...new Set(data.map(s => s.kelas_id).filter(Boolean))]
        let kelasMap: Record<string, string> = {}
        if (kelasIds.length > 0) {
          const { data: kelasData } = await supabase
            .from('kelas')
            .select('id, nama')
            .in('id', kelasIds)
          if (kelasData) {
            kelasMap = Object.fromEntries(kelasData.map(k => [k.id, k.nama]))
          }
        }

        const enriched = data.map(s => ({
          ...s,
          kelas: s.kelas_id ? { nama: kelasMap[s.kelas_id] || '' } : undefined
        }))

        setSiswa(enriched as User[])
        setFilteredSiswa(enriched as User[])
      }
    } catch (error) {
      console.error('Error fetching siswa:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nama || !formData.username || !formData.password || !formData.kelas_id) {
      toast.error('Semua field wajib diisi')
      return
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .maybeSingle()

      if (existingUser) {
        toast.error('Username sudah digunakan')
        return
      }

      // Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email || `${formData.username}@insancendekia.com`,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            nama: formData.nama,
            role: 'siswa',
            kelas_id: formData.kelas_id
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Gagal membuat akun')

      // Upsert to users table (trigger may have already inserted)
      const { error: upsertError } = await supabase.from('users').upsert({
        id: authData.user.id,
        username: formData.username,
        nama: formData.nama,
        email: formData.email || `${formData.username}@insancendekia.com`,
        role: 'siswa',
        kelas_id: formData.kelas_id,
        is_active: true
      })

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        throw upsertError
      }

      // Confirm email so user can login
      const confirmRes = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authData.user.id }),
      })

      if (!confirmRes.ok) {
        const errData = await confirmRes.json().catch(() => ({}))
        console.error('Confirm email error:', errData)
      }

      toast.success('siswa berhasil ditambahkan')
      setDialogOpen(false)
      resetForm()
      fetchSiswa()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan siswa')
    }
  }

  const handleEdit = async () => {
    if (!selectedSiswa) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          nama: formData.nama,
          username: formData.username,
          kelas_id: formData.kelas_id
        })
        .eq('id', selectedSiswa.id)

      if (error) throw error

      toast.success('Data siswa berhasil diupdate')
      setEditDialogOpen(false)
      resetForm()
      fetchSiswa()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate siswa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return

    try {
      await supabase.from('users').delete().eq('id', id)
      toast.success('siswa berhasil dihapus')
      fetchSiswa()
    } catch (error) {
      toast.error('Gagal menghapus siswa')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      toast.success(`Akun berhasil ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`)
      fetchSiswa()
    } catch (error) {
      toast.error('Gagal mengubah status akun')
    }
  }

  const handleResetPassword = async (id: string, nama: string) => {
    const newPassword = prompt(`Masukkan password baru untuk ${nama}:`)
    if (!newPassword) return

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, password: newPassword })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mereset password')
      }

      toast.success('Password berhasil direset')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mereset password')
    }
  }

  const openEditDialog = (siswa: User) => {
    setSelectedSiswa(siswa)
    setFormData({
      nama: siswa.nama,
      username: siswa.username,
      email: siswa.email || '',
      kelas_id: siswa.kelas_id || '',
      password: ''
    })
    setEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nama: '',
      username: '',
      email: '',
      kelas_id: '',
      password: ''
    })
    setSelectedSiswa(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 xl:p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Kelola siswa
            </h1>
            <p className="text-sm text-gray-500">Kelola data siswa sekolah</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-gray-200"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <button className="h-11 px-5 bg-green-600 text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2" />
            }
          >
            <Plus className="h-4 w-4" />
            Tambah siswa
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Tambah siswa Baru</DialogTitle>
              <DialogDescription>
                Isi data siswa untuk menambahkan akun baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap siswa"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username untuk login"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="kelas">Kelas</Label>
                <Select value={formData.kelas_id} onValueChange={(v) => v && setFormData({ ...formData, kelas_id: v })}>
                  <SelectTrigger id="kelas" className="h-11 rounded-xl mt-2">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelas.map((k) => (
                      <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password akun"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => { setDialogOpen(false); resetForm() }}
                className="h-10 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="h-10 px-4 bg-green-600 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Simpan
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredSiswa.length === 0 ? (
        <Card className="border border-gray-100 rounded-2xl shadow-lg">
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Tidak ada hasil' : 'Belum ada siswa'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {search ? 'Coba kata kunci lain' : 'Tambahkan siswa baru untuk memulai'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSiswa.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow shrink-0">
                    <span className="text-white font-bold text-lg">
                      {m.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{m.nama}</h3>
                    <p className="text-sm text-gray-500 truncate">@{m.username} • {(m as any).kelas?.nama || 'Belum ada kelas'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-1 pt-1">
                  <Badge className={m.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                    {m.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button className="inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none h-10 w-10 rounded-xl hover:bg-gray-100 transition-opacity" />
                      }
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEditDialog(m)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(m.id, m.is_active)} className="cursor-pointer">
                        {m.is_active ? (
                          <Lock className="h-4 w-4 mr-2" />
                        ) : (
                          <Unlock className="h-4 w-4 mr-2" />
                        )}
                        {m.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(m.id, m.nama)} className="cursor-pointer">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(m.id)} className="cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Data siswa</DialogTitle>
            <DialogDescription>Update data siswa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-nama">Nama Lengkap</Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="edit-kelas">Kelas</Label>
              <Select value={formData.kelas_id} onValueChange={(v) => v && setFormData({ ...formData, kelas_id: v })}>
                <SelectTrigger id="edit-kelas" className="h-11 rounded-xl mt-2">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelas.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => { setEditDialogOpen(false); resetForm() }}
              className="h-10 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleEdit}
              className="h-10 px-4 bg-green-600 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              Simpan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}