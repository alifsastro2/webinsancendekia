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
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Search,
  BookOpen,
  FileText,
  ClipboardList,
  Edit,
  Trash2,
  ArrowRight,
  Users,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface MataPelajaran {
  id: string
  nama: string
  deskripsi: string
  kelas_id: string
  guru_id: string
  kelas?: { nama: string }
  materi_count: number
  kuis_count: number
}

interface Kelas {
  id: string
  nama: string
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function GuruMataPelajaran() {
  const router = useRouter()
  const [mapel, setMapel] = useState<MataPelajaran[]>([])
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [filteredMapel, setFilteredMapel] = useState<MataPelajaran[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMapel, setSelectedMapel] = useState<MataPelajaran | null>(null)

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kelas_id: ''
  })

  useEffect(() => {
    fetchKelas()
    fetchMapel()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = mapel.filter(m =>
        m.nama.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredMapel(filtered)
    } else {
      setFilteredMapel(mapel)
    }
  }, [search, mapel])

  const fetchKelas = async () => {
    const { data } = await supabase.from('kelas').select('*').order('nama')
    if (data) setKelas(data)
  }

  const fetchMapel = async () => {
    try {
      const sessionData = await supabase.auth.getSession()
      const session = sessionData.data.session
      if (!session) return

      const { data } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          kelas:kelas(nama),
          materi(count),
          kuis(count)
        `)
        .eq('guru_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) {
        const mapelWithCounts = data.map((m: Record<string, unknown>) => ({
          ...m,
          materi_count: (m.materi as { count: number }[])?.[0]?.count || 0,
          kuis_count: (m.kuis as { count: number }[])?.[0]?.count || 0
        }))
        setMapel(mapelWithCounts)
        setFilteredMapel(mapelWithCounts)
      }
    } catch (error) {
      console.error('Error fetching mapel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const sessionData = await supabase.auth.getSession()
      const session = sessionData.data.session
      toast.error('Sesi login habis. Silakan login ulang.')

      if (!formData.nama || !formData.kelas_id) {
        toast.error('Nama mata pelajaran dan kelas wajib diisi')
        return
      }

      const { error } = await supabase
        .from('mata_pelajaran')
        .insert({
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          kelas_id: formData.kelas_id,
          guru_id: session.user.id
        })

      if (error) throw error

      toast.success('Mata pelajaran berhasil dibuat!')
      setDialogOpen(false)
      resetForm()
      fetchMapel()
    } catch (error: any) {
      toast.error('Gagal menyimpan mata pelajaran. Silakan coba lagi.')
    }
  }

  const handleEdit = async () => {
    if (!selectedMapel) return

    try {
      const { error } = await supabase
        .from('mata_pelajaran')
        .update({
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          kelas_id: formData.kelas_id
        })
        .eq('id', selectedMapel.id)

      if (error) throw error

      toast.success('Mata pelajaran berhasil diperbarui!')
      setEditDialogOpen(false)
      resetForm()
      fetchMapel()
    } catch (error: any) {
      toast.error('Gagal memperbarui mata pelajaran. Silakan coba lagi.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return

    try {
      await supabase.from('mata_pelajaran').delete().eq('id', id)
      toast.success('Mata pelajaran berhasil dihapus!')
      fetchMapel()
    } catch (error) {
      toast.error('Gagal menghapus mata pelajaran. Silakan coba lagi.')
    }
  }

  const openEditDialog = (m: MataPelajaran) => {
    setSelectedMapel(m)
    setFormData({
      nama: m.nama,
      deskripsi: m.deskripsi || '',
      kelas_id: m.kelas_id
    })
    setEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nama: '',
      deskripsi: '',
      kelas_id: ''
    })
    setSelectedMapel(null)
  }

  const openDetailPage = (mapelId: string) => {
    router.push(`/guru/matapelajaran/${mapelId}`)
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
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Mata Pelajaran
            </h1>
            <p className="text-sm text-gray-500">Kelola mata pelajaran yang Anda ajarkan</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-gray-200"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <button className="h-11 px-5 bg-amber-600 text-white rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2" />
            }
          >
            <Plus className="h-4 w-4" />
            Buat Mata Pelajaran
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Buat Mata Pelajaran Baru</DialogTitle>
              <DialogDescription>
                Buat mata pelajaran baru untuk kelas tertentu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nama">Nama Mata Pelajaran</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Matematika"
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
                <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Deskripsi singkat tentang mata pelajaran"
                  rows={3}
                  className="mt-2 resize-none rounded-xl min-h-[80px]"
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
                className="h-10 px-4 bg-amber-600 text-white rounded-xl hover:opacity-90 transition-opacity"
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
      ) : filteredMapel.length === 0 ? (
        <Card className="border border-gray-100 rounded-2xl shadow-lg">
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Tidak ada hasil' : 'Belum ada mata pelajaran'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {search ? 'Coba kata kunci lain' : 'Buat mata pelajaran baru untuk memulai'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMapel.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openDetailPage(m.id)}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center shadow">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{m.nama}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {(m as any).kelas?.nama || 'Belum ada kelas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {m.materi_count} materi
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="h-4 w-4" />
                      {m.kuis_count} kuis
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none h-9 w-9 rounded-xl hover:bg-gray-100 transition-opacity" />
                      }
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(m) }} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(m.id) }} className="cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ArrowRight className="h-5 w-5 text-gray-400" />
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
            <DialogTitle>Edit Mata Pelajaran</DialogTitle>
            <DialogDescription>Update data mata pelajaran</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-nama">Nama Mata Pelajaran</Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
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
                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-deskripsi">Deskripsi</Label>
              <Textarea
                id="edit-deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang mata pelajaran"
                rows={3}
                className="mt-2 resize-none rounded-xl min-h-[80px]"
              />
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
              className="h-10 px-4 bg-amber-600 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              Simpan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}