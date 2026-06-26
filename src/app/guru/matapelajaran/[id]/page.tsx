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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  ClipboardList,
  ArrowLeft,
  Upload,
  Download,
  Eye,
  X,
  File
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MataPelajaran, Materi } from '@/lib/types'
import { toast } from 'sonner'
import { MotionList } from '@/components/common/motion'
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
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null)
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

      // Get mata pelajaran
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

        // Get materi
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
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File terlalu besar. Maksimal 50MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Get class and subject names
      const className = (mapel as any)?.kelas?.nama || 'Unknown'
      const subjectName = mapel?.nama || 'Unknown'

      console.log('Uploading file to R2:', file.name)

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('className', className)
      formData.append('subjectName', subjectName)

      // Upload to R2 via API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.error) {
        console.error('R2 Upload error:', result.error)
        toast.error(`Gagal upload: ${result.error}`)
        return null
      }

      console.log('R2 Upload success:', result.url)
      toast.success('File berhasil diupload!')
      return result.url
    } catch (error: any) {
      console.error('Upload catch error:', error)
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

      // Upload file if selected
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
    setMateriForm({
      judul: '',
      deskripsi: '',
      file_url: ''
    })
    setSelectedMateri(null)
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
        <FileText className="h-12 w-12 text-gray-300 animate-pulse" />
      </div>
    )
  }

  if (!mapel) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Mata pelajaran tidak ditemukan</p>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
    >
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{mapel.nama}</h1>
            <Badge variant="secondary">{(mapel as any).kelas?.nama}</Badge>
          </div>
          <p className="text-gray-600">
            Guru: {(mapel as any).guru?.nama || '-'}
            {mapel.deskripsi && ` • ${mapel.deskripsi}`}
          </p>
        </div>
      </div>

      <Tabs defaultValue="materi">
        <TabsList>
          <TabsTrigger value="materi">
            <FileText className="mr-2 h-4 w-4" />
            Materi ({materi.length})
          </TabsTrigger>
          <TabsTrigger value="kuis">
            <ClipboardList className="mr-2 h-4 w-4" />
            Kuis
            <Link href={`/guru/matapelajaran/${mapelId}/kuis`} className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
              Kelola Kuis
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materi" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Materi Pembelajaran</CardTitle>
                <Dialog open={materiDialogOpen} onOpenChange={setMateriDialogOpen}>
                  <button onClick={() => setMateriDialogOpen(true)} className="h-11 px-5 bg-blue-600 text-white rounded-xl font-medium hover:opacity-90 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Materi
                  </button>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tambah Materi Baru</DialogTitle>
                      <DialogDescription>
                        Upload file materi untuk siswa
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="judul">Judul Materi</Label>
                        <Input
                          id="judul"
                          value={materiForm.judul}
                          onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
                          placeholder="Judul materi"
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <Label>File Materi</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.txt,.zip,.rar"
                          />

                          {selectedFile ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-3">
                                <File className="h-8 w-8 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 hover:bg-blue-100 rounded"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-gray-50 transition-colors"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Klik untuk upload file</p>
                              <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, Gambar (max 50MB)</p>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-500">atau</div>

                      <div>
                        <Label htmlFor="file_url">URL File (Google Drive, dll)</Label>
                        <Input
                          id="file_url"
                          value={materiForm.file_url}
                          onChange={(e) => setMateriForm({ ...materiForm, file_url: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          disabled={!!selectedFile}
                        />
                      </div>

                      <div>
                        <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                        <Textarea
                          id="deskripsi"
                          value={materiForm.deskripsi}
                          onChange={(e) => setMateriForm({ ...materiForm, deskripsi: e.target.value })}
                          rows={2}
                          placeholder="Deskripsi materi..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setMateriDialogOpen(false); resetMateriForm() }}>
                        Batal
                      </Button>
                      <Button onClick={handleCreateMateri} disabled={uploading}>
                        {uploading ? (
                          <>
                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          'Simpan'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {materi.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada materi</p>
                  <Button
                    variant="outline"
                    onClick={() => setMateriDialogOpen(true)}
                    className="mt-4"
                  >
                    Tambah Materi Pertama
                  </Button>
                </div>
              ) : (
                <MotionList>
                  <div className="grid gap-4">
                    {materi.map((m, i) => (
                      <motion.div
                        key={m.id}
                        variants={slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{m.judul}</h3>
                            {m.deskripsi && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{m.deskripsi}</p>
                            )}
                            {m.file_url && (
                              <a
                                href={m.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                              >
                                <Download className="h-3 w-3" />
                                Download / Lihat File
                              </a>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {m.file_url && (
                              <DropdownMenuItem>
                                <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
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
                </MotionList>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kuis" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Kuis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Kelola kuis untuk mata pelajaran ini</p>
                <Link href={`/guru/matapelajaran/${mapelId}/kuis`}>
                  <Button>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Kelola Kuis
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