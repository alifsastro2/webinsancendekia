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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  FileText,
  ClipboardList,
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  X,
  File,
  Settings
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MataPelajaran, Materi } from '@/lib/types'
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
  const [loading, setLoading] = useState(true)
  const [materiDialogOpen, setMateriDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

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
        toast.error('File terlalu besar. Maksimal 50MB')
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
        toast.error(`Gagal upload: ${result.error}`)
        return null
      }

      toast.success('File berhasil diupload!')
      return result.url
    } catch (error: any) {
      toast.error(`Gagal upload: ${error.message || 'Terjadi kesalahan'}`)
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

  const resetMateriForm = () => {
    setMateriForm({ judul: '', deskripsi: '', file_url: '' })
    setSelectedFile(null)
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
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
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
      className="space-y-6"
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
            <Badge className="bg-amber-100 text-amber-700 border-0">{mapel as any}</Badge>
          </div>
          <p className="text-gray-500 text-sm">
            {(mapel as any).guru?.nama || '-'}
            {mapel.deskripsi && ` • ${mapel.deskripsi}`}
          </p>
        </div>
        <Link href={`/guru/matapelajaran/${mapelId}/kuis`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Pengaturan
          </motion.button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="materi" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="materi"
            className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Materi ({materi.length})
          </TabsTrigger>
          <TabsTrigger
            value="kuis"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Kuis
          </TabsTrigger>
        </TabsList>

        {/* Tab Materi */}
        <TabsContent value="materi" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Daftar Materi</CardTitle>
              <Dialog open={materiDialogOpen} onOpenChange={setMateriDialogOpen}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMateriDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
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
                            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-400 hover:bg-red-50/50 transition-all text-center"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Klik untuk upload</p>
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
                    <Button onClick={handleCreateMateri} disabled={uploading} className="bg-red-500 hover:bg-red-600">
                      {uploading ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Mengupload...
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
                    className="mt-4 bg-red-500 hover:bg-red-600"
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
                              href={m.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <Download className="h-3 w-3" />
                              Download File
                            </a>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 12a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {m.file_url && (
                            <DropdownMenuItem>
                              <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download
                              </a>
                            </DropdownMenuItem>
                          )}
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
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kelola Kuis</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Buat dan kelola kuis pilihan ganda atau essay untuk mata pelajaran ini
                </p>
                <Link href={`/guru/matapelajaran/${mapelId}/kuis`}>
                  <Button size="lg" className="bg-purple-500 hover:bg-purple-600">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Buka Pengaturan Kuis
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
