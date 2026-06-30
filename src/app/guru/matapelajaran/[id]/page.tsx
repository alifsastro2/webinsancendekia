'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  FileText,
  ClipboardList,
  ArrowLeft,
  Upload,
  Eye,
  Trash2,
  X,
  File,
  Clock,
  CalendarClock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Users,
  Check
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MataPelajaran, Materi } from '@/lib/types'
import { getFileUrl } from '@/lib/files'
import { toast } from 'sonner'
import { slideUpVariants } from '@/components/common/motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export default function MataPelajaranDetail() {
  const params = useParams()
  const router = useRouter()
  const mapelId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mapel, setMapel] = useState<MataPelajaran | null>(null)
  const [materi, setMateri] = useState<Materi[]>([])
  const [kuisList, setKuisList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [materiDialogOpen, setMateriDialogOpen] = useState(false)
  const [kuisDialogOpen, setKuisDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedMateriId, setSelectedMateriId] = useState<string | null>(null)
  const [viewStats, setViewStats] = useState<{
    viewed: Array<{ siswa_id: string; nama: string; username: string; viewed_at: string }>
    totalSiswa: number
  } | null>(null)
  const [loadingViews, setLoadingViews] = useState(false)
  const [kuisForm, setKuisForm] = useState({
    judul: '',
    tipe: 'pilihan_ganda' as 'pilihan_ganda' | 'essay',
    waktu_menit: '',
    due_date: ''
  })

  const [materiForm, setMateriForm] = useState({
    judul: '',
    deskripsi: '',
    file_url: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          kelas:kelas(nama),
          guru:users(nama)
        `)
        .eq('id', mapelId)
        .single()

      if (mapelData) {
        setMapel(mapelData as any)

        const { data: materiData } = await supabase
          .from('materi')
          .select('*')
          .eq('mata_pelajaran_id', mapelId)
          .order('created_at', { ascending: false })

        if (materiData) {
          setMateri(materiData)
        }

        const { data: kuisData } = await supabase
          .from('kuis')
          .select(`
            *,
            pertanyaan:pertanyaan_kuis(count)
          `)
          .eq('mata_pelajaran_id', mapelId)
          .order('created_at', { ascending: false })

        if (kuisData) {
          setKuisList(kuisData)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File terlalu besar. Maksimal 50 MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const className = (mapel as any)?.kelas?.nama || 'Unknown'
      const subjectName = mapel?.nama || 'Unknown'

      const formData = new FormData()
      formData.append('file', file)
      formData.append('className', className)
      formData.append('subjectName', subjectName)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.error) {
        toast.error(`Gagal mengunggah: ${result.error}`)
        return null
      }

      toast.success('File berhasil diunggah!')
      return result.url
    } catch (error: any) {
      toast.error(`Gagal mengunggah: ${error.message || 'Terjadi kesalahan'}`)
      return null
    }
  }

  const handleCreateMateri = async () => {
    try {
      if (!materiForm.judul) {
        toast.error('Judul materi wajib diisi')
        return
      }

      if (!selectedFile && !materiForm.file_url) {
        toast.error('Upload file atau masukkan URL')
        return
      }

      let finalFileUrl = materiForm.file_url

      if (selectedFile) {
        setUploading(true)
        const uploadedUrl = await uploadFile(selectedFile)
        if (!uploadedUrl) {
          setUploading(false)
          return
        }
        finalFileUrl = uploadedUrl
        setUploading(false)
      }

      const { error } = await supabase
        .from('materi')
        .insert({
          judul: materiForm.judul,
          deskripsi: materiForm.deskripsi,
          file_url: finalFileUrl,
          mata_pelajaran_id: mapelId
        })

      if (error) throw error

      toast.success('Materi berhasil ditambahkan')
      setMateriDialogOpen(false)
      resetMateriForm()
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan materi')
    }
  }

  const handleDeleteMateri = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return

    try {
      await supabase.from('materi').delete().eq('id', id)
      toast.success('Materi berhasil dihapus')
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus materi')
    }
  }

  const handleCreateKuis = async () => {
    try {
      if (!kuisForm.judul) {
        toast.error('Judul kuis wajib diisi')
        return
      }

      const { error } = await supabase.from('kuis').insert({
        judul: kuisForm.judul,
        tipe: kuisForm.tipe,
        waktu_menit: kuisForm.waktu_menit ? parseInt(kuisForm.waktu_menit) : null,
        due_date: kuisForm.due_date ? new Date(kuisForm.due_date).toISOString() : null,
        mata_pelajaran_id: mapelId
      })

      if (error) throw error

      toast.success('Kuis berhasil ditambahkan')
      setKuisDialogOpen(false)
      setKuisForm({ judul: '', tipe: 'pilihan_ganda', waktu_menit: '', due_date: '' })
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan kuis')
    }
  }

  const resetMateriForm = () => {
    setMateriForm({ judul: '', deskripsi: '', file_url: '' })
    setSelectedFile(null)
  }

  const handleShowViewers = async (materiId: string) => {
    setSelectedMateriId(materiId)
    setViewDialogOpen(true)
    setLoadingViews(true)
    setViewStats(null)

    try {
      const kelasId = (mapel as any)?.kelas_id

      const { data: students } = await supabase
        .from('users')
        .select('id, nama, username')
        .eq('role', 'siswa')
        .eq('kelas_id', kelasId)

      const { data: views } = await supabase
        .from('materi_views')
        .select('siswa_id, viewed_at')
        .eq('materi_id', materiId)
        .order('viewed_at', { ascending: false })

      const viewedList = (views || []).map((v: any) => {
        const student = students?.find((s: any) => s.id === v.siswa_id)
        return {
          siswa_id: v.siswa_id,
          nama: student?.nama || '-',
          username: student?.username || '-',
          viewed_at: v.viewed_at
        }
      })

      setViewStats({
        viewed: viewedList,
        totalSiswa: students?.length || 0
      })
    } catch (error) {
      console.error('Error fetching view stats:', error)
    } finally {
      setLoadingViews(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!mapel) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Mata pelajaran tidak ditemukan</p>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      className="p-4 lg:p-6 xl:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali</span>
          </motion.button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{mapel.nama}</h1>
            <Badge className="bg-amber-100 text-amber-700 border-0">{(mapel as any).kelas?.nama || '-'}</Badge>
          </div>
          <p className="text-gray-500 text-sm">
            {(mapel as any).guru?.nama || '-'}
            {mapel.deskripsi && ` • ${mapel.deskripsi}`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="materi" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="materi"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Materi ({materi.length})
          </TabsTrigger>
          <TabsTrigger
            value="kuis"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Kuis
          </TabsTrigger>
        </TabsList>

        {/* Tab Materi */}
        <TabsContent value="materi" className="mt-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Daftar Materi</CardTitle>
                  <p className="text-sm text-gray-500">Materi pembelajaran untuk siswa</p>
                </div>
              </div>
              <Dialog open={materiDialogOpen} onOpenChange={setMateriDialogOpen}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMateriDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </motion.button>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Materi Baru</DialogTitle>
                    <DialogDescription>
                      Upload file materi untuk siswa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="judul">Judul</Label>
                      <Input
                        id="judul"
                        value={materiForm.judul}
                        onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                        placeholder="Judul materi"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>File</Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.txt,.zip,.rar"
                        />

                        {selectedFile ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <File className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Klik untuk unggah</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, Gambar (max 50MB)</p>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-400">atau</div>

                    <div>
                      <Label htmlFor="file_url">URL File</Label>
                      <Input
                        id="file_url"
                        value={materiForm.file_url}
                        onChange={(e) => setMateriForm({ ...materiForm, file_url: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        disabled={!!selectedFile}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deskripsi">Deskripsi</Label>
                      <Textarea
                        id="deskripsi"
                        value={materiForm.deskripsi}
                        onChange={(e) => setMateriForm({ ...materiForm, deskripsi: e.target.value })}
                        rows={2}
                        placeholder="Deskripsi materi..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => { setMateriDialogOpen(false); resetMateriForm() }}>
                      Batal
                    </Button>
                    <Button onClick={handleCreateMateri} disabled={uploading} className="bg-amber-500 hover:bg-amber-600">
                      {uploading ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Mengunggah...
                        </>
                      ) : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {materi.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada materi</p>
                  <p className="text-gray-400 text-sm mt-1">Tambahkan materi pertama untuk kelas ini</p>
                  <Button
                    onClick={() => setMateriDialogOpen(true)}
                    className="mt-4 bg-amber-500 hover:bg-amber-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Materi
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {materi.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{m.judul}</h3>
                          {m.deskripsi && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{m.deskripsi}</p>
                          )}
                          {m.file_url && (
                            <a
                              href={getFileUrl(m.file_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <Eye className="h-3 w-3" />
                              Lihat Materi
                            </a>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none h-10 w-10 rounded-xl hover:bg-gray-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                          }
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {m.file_url && (
                            <DropdownMenuItem>
                              <a href={getFileUrl(m.file_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Lihat Materi
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleShowViewers(m.id)} className="cursor-pointer">
                            <Users className="mr-2 h-4 w-4" />
                            Siapa yang Membuka
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteMateri(m.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Kuis */}
        <TabsContent value="kuis" className="mt-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Daftar Kuis</CardTitle>
                  <p className="text-sm text-gray-500">Kuis pilihan ganda dan essay</p>
                </div>
              </div>
              <Dialog open={kuisDialogOpen} onOpenChange={setKuisDialogOpen}>
                <button
                  onClick={() => setKuisDialogOpen(true)}
                  className="inline-flex items-center justify-center gap-2 font-medium h-10 px-4 py-2 text-sm rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Kuis
                </button>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Buat Kuis Baru</DialogTitle>
                    <DialogDescription>
                      Buat kuis pilihan ganda atau essay
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="kuis-judul">Judul Kuis</Label>
                      <Input
                        id="kuis-judul"
                        value={kuisForm.judul}
                        onChange={(e) => setKuisForm({ ...kuisForm, judul: e.target.value })}
                        placeholder="Judul kuis"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kuis-tipe">Tipe Kuis</Label>
                      <Select value={kuisForm.tipe} onValueChange={(v: any) => setKuisForm({ ...kuisForm, tipe: v })}>
                        <SelectTrigger id="kuis-tipe">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pilihan_ganda">Pilihan Ganda</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kuis-waktu">Waktu (Menit) - Opsional</Label>
                      <Input
                        id="kuis-waktu"
                        type="number"
                        value={kuisForm.waktu_menit}
                        onChange={(e) => setKuisForm({ ...kuisForm, waktu_menit: e.target.value })}
                        placeholder="Biarkan kosong untuk tanpa batas waktu"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kuis-due-date">Batas Akhir Pengerjaan - Opsional</Label>
                      <Input
                        id="kuis-due-date"
                        type="datetime-local"
                        value={kuisForm.due_date}
                        onChange={(e) => setKuisForm({ ...kuisForm, due_date: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Setelah waktu ini, kuis tidak bisa dikerjakan</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setKuisDialogOpen(false); setKuisForm({ judul: '', tipe: 'pilihan_ganda', waktu_menit: '', due_date: '' }) }}>
                      Batal
                    </Button>
                    <Button onClick={handleCreateKuis}>Buat</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {kuisList.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada kuis</p>
                  <p className="text-gray-400 text-sm mt-1">Buat kuis pertama untuk mata pelajaran ini</p>
                  <Button
                    onClick={() => setKuisDialogOpen(true)}
                    className="mt-4 bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Kuis
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kuisList.map((kuis: any, i) => (
                    <Link key={kuis.id} href={`/guru/matapelajaran/${mapelId}/kuis/${kuis.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-5 rounded-xl border transition-all cursor-pointer ${
                          kuis.published
                            ? 'bg-purple-50 border-purple-100 hover:shadow-lg hover:border-purple-200'
                            : 'bg-gray-50 border-gray-200 hover:shadow-md hover:border-gray-300 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                            kuis.published ? 'bg-purple-500' : 'bg-gray-400'
                          }`}>
                            <ClipboardList className="h-6 w-6" />
                          </div>
                          {kuis.published ? (
                            <Badge className="bg-green-100 text-green-700 border-0 gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Diterbitkan
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-600 border-0 gap-1 text-xs">
                              <XCircle className="h-3 w-3" />
                              Draft
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{kuis.judul}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Badge variant={kuis.tipe === 'pilihan_ganda' ? 'default' : 'secondary'} className="text-xs">
                            {kuis.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}
                          </Badge>
                          <span>{(kuis.pertanyaan as any)?.[0]?.count || 0} pertanyaan</span>
                          {kuis.waktu_menit && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{kuis.waktu_menit} menit</span>
                          )}
                          {kuis.due_date && (
                            <span className="flex items-center gap-1 text-red-500"><CalendarClock className="h-3 w-3" />{new Date(kuis.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Siapa yang Membuka */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Siapa yang Membuka
            </DialogTitle>
            <DialogDescription>
              Daftar siswa yang sudah membuka materi ini
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingViews ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Memuat...</p>
              </div>
            ) : viewStats ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-4">
                  {viewStats.viewed.length} dari {viewStats.totalSiswa} siswa sudah membuka
                </div>
                {viewStats.viewed.map((student) => (
                  <div key={student.siswa_id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                      {student.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{student.nama}</p>
                      <p className="text-xs text-gray-500">@{student.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-xs">Sudah</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(student.viewed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Tidak ada data</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
