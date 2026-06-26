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
  UserPlus,
  ShieldCheck,
  Users
} from 'lucide-react'
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

export default function Kelolasiswa() {
  const [siswa, setsiswa] = useState<User[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [filteredsiswa, setFilteredsiswa] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedsiswa, setSelectedsiswa] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    kelas_id: '',
    password: ''
  })

  useEffect(() => {
    fetchKelas()
    fetchsiswa()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = siswa.filter(m =>
        m.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.username.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredsiswa(filtered)
    } else {
      setFilteredsiswa(siswa)
    }
  }, [search, siswa])

  const fetchKelas = async () => {
    const { data } = await supabase.from('kelas').select('*').order('nama')
    if (data) setKelas(data)
  }

  const fetchsiswa = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*, kelas:kelas(nama)')
        .eq('role', 'siswa')
        .order('nama')

      if (data) {
        setsiswa(data as User[])
        setFilteredsiswa(data as User[])
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
      // Lookup kelas by nama to get the ID
      const { data: kelasData } = await supabase
        .from('kelas')
        .select('id')
        .eq('nama', formData.kelas_id)
        .single()

      if (!kelasData) {
        toast.error('Kelas tidak ditemukan')
        return
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single()

      if (existingUser) {
        toast.error('Username sudah digunakan')
        return
      }

      // Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email || `${formData.username}@sekolah.local`,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            nama: formData.nama,
            role: 'siswa'
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Gagal membuat user')

      // Insert to users table (in case trigger doesn't exist)
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        username: formData.username,
        nama: formData.nama,
        email: formData.email || `${formData.username}@sekolah.local`,
        role: 'siswa',
        kelas_id: kelasData.id,
        is_active: true
      })

      if (insertError) {
        console.error('Insert error:', insertError)
        // Continue anyway if user was created in auth
      }

      toast.success('siswa berhasil ditambahkan')
      setDialogOpen(false)
      resetForm()
      fetchsiswa()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan siswa')
    }
  }

  const handleEdit = async () => {
    if (!selectedsiswa) return

    try {
      // Lookup kelas by nama to get the ID
      let kelasId = formData.kelas_id
      if (formData.kelas_id) {
        const { data: kelasData } = await supabase
          .from('kelas')
          .select('id')
          .eq('nama', formData.kelas_id)
          .single()
        if (kelasData) {
          kelasId = kelasData.id
        }
      }

      const updates: any = {
        nama: formData.nama,
        username: formData.username,
        kelas_id: kelasId
      }

      if (formData.email !== undefined) {
        updates.email = formData.email
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', selectedsiswa.id)

      if (error) throw error

      toast.success('Data siswa berhasil diupdate')
      setEditDialogOpen(false)
      resetForm()
      fetchsiswa()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengupdate siswa')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return

    try {
      await supabase.from('users').delete().eq('id', id)
      toast.success('siswa berhasil dihapus')
      fetchsiswa()
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
      fetchsiswa()
    } catch (error) {
      toast.error('Gagal mengubah status akun')
    }
  }

  const handleResetPassword = async (id: string, nama: string) => {
    const newPassword = prompt(`Masukkan password baru untuk ${nama}:`)
    if (!newPassword) return

    try {
      await supabase.auth.updateUser({ password: newPassword })
      toast.success('Password berhasil direset')
    } catch (error) {
      toast.error('Gagal mereset password')
    }
  }

  const openEditDialog = (siswa: User) => {
    setSelectedsiswa(siswa)
    setFormData({
      nama: siswa.nama,
      username: siswa.username,
      email: siswa.email || '',
      kelas_id: (siswa as any).kelas?.nama || '',
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
    setSelectedsiswa(null)
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
          <DialogTrigger>
            <button className="h-11 px-5 bg-green-600 text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah siswa
            </button>
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
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@contoh.com"
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
                      <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>
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
      ) : filteredsiswa.length === 0 ? (
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
          {filteredsiswa.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center shadow">
                    <span className="text-white font-bold text-lg">
                      {m.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.nama}</h3>
                    <p className="text-sm text-gray-500">@{m.username} • {(m as any).kelas?.nama || 'Belum ada kelas'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={m.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                    {m.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>

                  <button
                    onClick={() => openEditDialog(m)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(m.id, m.is_active)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {m.is_active ? (
                      <Lock className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Unlock className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleResetPassword(m.id, m.nama)}
                    className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
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
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    <SelectItem key={k.id} value={k.nama}>
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