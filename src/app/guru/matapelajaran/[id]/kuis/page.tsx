'use client'

import { useEffect, useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ClipboardList,
  Clock,
  ArrowLeft,
  PlusCircle,
  Trash
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Kuis, PertanyaanKuis } from '@/lib/types'
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

interface KuisWithPertanyaan extends Kuis {
  pertanyaan: PertanyaanKuis[]
}

export default function GuruKuis() {
  const params = useParams()
  const router = useRouter()
  const mapelId = params.id as string

  const [kuisList, setKuisList] = useState<KuisWithPertanyaan[]>([])
  const [loading, setLoading] = useState(true)
  const [kuisDialogOpen, setKuisDialogOpen] = useState(false)
  const [pertanyaanDialogOpen, setPertanyaanDialogOpen] = useState(false)
  const [selectedKuis, setSelectedKuis] = useState<KuisWithPertanyaan | null>(null)

  const [kuisForm, setKuisForm] = useState({
    judul: '',
    tipe: 'pilihan_ganda' as 'pilihan_ganda' | 'essay',
    waktu_menit: ''
  })

  const [pertanyaanForm, setPertanyaanForm] = useState({
    pertanyaan: '',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    jawaban_benar: ''
  })

  useEffect(() => {
    fetchKuis()
  }, [])

  const fetchKuis = async () => {
    try {
      const { data } = await supabase
        .from('kuis')
        .select(`
          *,
          pertanyaan:pertanyaan_kuis(*)
        `)
        .eq('mata_pelajaran_id', mapelId)
        .order('created_at', { ascending: false })

      if (data) {
        setKuisList(data as KuisWithPertanyaan[])
      }
    } catch (error) {
      console.error('Error fetching kuis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKuis = async () => {
    try {
      if (!kuisForm.judul) {
        toast.error('Judul kuis wajib diisi')
        return
      }

      const { error } = await supabase
        .from('kuis')
        .insert({
          judul: kuisForm.judul,
          tipe: kuisForm.tipe,
          waktu_menit: kuisForm.waktu_menit ? parseInt(kuisForm.waktu_menit) : null,
          mata_pelajaran_id: mapelId
        })

      if (error) throw error

      toast.success('Kuis berhasil ditambahkan')
      setKuisDialogOpen(false)
      resetKuisForm()
      fetchKuis()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan kuis')
    }
  }

  const handleCreatePertanyaan = async () => {
    if (!selectedKuis) return

    try {
      if (!pertanyaanForm.pertanyaan || !pertanyaanForm.jawaban_benar) {
        toast.error('Pertanyaan dan jawaban benar wajib diisi')
        return
      }

      if (kuisForm.tipe === 'pilihan_ganda' && (!pertanyaanForm.opsi_a || !pertanyaanForm.opsi_b || !pertanyaanForm.opsi_c || !pertanyaanForm.opsi_d)) {
        toast.error('Semua opsi jawaban wajib diisi untuk pilihan ganda')
        return
      }

      const nextOrder = selectedKuis.pertanyaan.length + 1

      const { error } = await supabase
        .from('pertanyaan_kuis')
        .insert({
          kuis_id: selectedKuis.id,
          pertanyaan: pertanyaanForm.pertanyaan,
          opsi_a: pertanyaanForm.opsi_a,
          opsi_b: pertanyaanForm.opsi_b,
          opsi_c: pertanyaanForm.opsi_c,
          opsi_d: pertanyaanForm.opsi_d,
          jawaban_benar: pertanyaanForm.jawaban_benar.toUpperCase(),
          urutan: nextOrder
        })

      if (error) throw error

      toast.success('Pertanyaan berhasil ditambahkan')
      setPertanyaanDialogOpen(false)
      resetPertanyaanForm()
      fetchKuis()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan pertanyaan')
    }
  }

  const handleDeleteKuis = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kuis ini?')) return

    try {
      await supabase.from('kuis').delete().eq('id', id)
      toast.success('Kuis berhasil dihapus')
      fetchKuis()
    } catch (error) {
      toast.error('Gagal menghapus kuis')
    }
  }

  const handleDeletePertanyaan = async (id: string) => {
    try {
      await supabase.from('pertanyaan_kuis').delete().eq('id', id)
      toast.success('Pertanyaan berhasil dihapus')
      fetchKuis()
    } catch (error) {
      toast.error('Gagal menghapus pertanyaan')
    }
  }

  const openPertanyaanDialog = (kuis: KuisWithPertanyaan) => {
    setSelectedKuis(kuis)
    setKuisForm({ ...kuisForm, tipe: kuis.tipe })
    setPertanyaanDialogOpen(true)
  }

  const resetKuisForm = () => {
    setKuisForm({
      judul: '',
      tipe: 'pilihan_ganda',
      waktu_menit: ''
    })
  }

  const resetPertanyaanForm = () => {
    setPertanyaanForm({
      pertanyaan: '',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      jawaban_benar: ''
    })
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
          <h1 className="text-3xl font-bold text-gray-900">Kelola Kuis</h1>
          <p className="text-gray-600 mt-1">Buat dan kelola kuis untuk mata pelajaran ini</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Kuis</CardTitle>
            <Dialog open={kuisDialogOpen} onOpenChange={setKuisDialogOpen}>
              <DialogTrigger>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Kuis Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Buat Kuis Baru</DialogTitle>
                  <DialogDescription>
                    Buat kuis pilihan ganda atau essay
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="judul">Judul Kuis</Label>
                    <Input
                      id="judul"
                      value={kuisForm.judul}
                      onChange={(e) => setKuisForm({ ...kuisForm, judul: e.target.value })}
                      placeholder="Judul kuis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipe">Tipe Kuis</Label>
                    <Select value={kuisForm.tipe} onValueChange={(v: any) => setKuisForm({ ...kuisForm, tipe: v })}>
                      <SelectTrigger id="tipe">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pilihan_ganda">Pilihan Ganda</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="waktu">Waktu (Menit) - Opsional</Label>
                    <Input
                      id="waktu"
                      type="number"
                      value={kuisForm.waktu_menit}
                      onChange={(e) => setKuisForm({ ...kuisForm, waktu_menit: e.target.value })}
                      placeholder="Biarkan kosong untuk tanpa batas waktu"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setKuisDialogOpen(false); resetKuisForm() }}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateKuis}>Buat</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-500">Memuat kuis...</p>
            </div>
          ) : kuisList.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada kuis</p>
              <Button
                variant="outline"
                onClick={() => setKuisDialogOpen(true)}
                className="mt-4"
              >
                Buat Kuis Pertama
              </Button>
            </div>
          ) : (
            <MotionList>
              <div className="space-y-6">
                {kuisList.map((kuis, i) => (
                  <motion.div
                    key={kuis.id}
                    variants={slideUpVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.05 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{kuis.judul}</h3>
                            <Badge variant={kuis.tipe === 'pilihan_ganda' ? 'default' : 'secondary'}>
                              {kuis.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}
                            </Badge>
                            {kuis.waktu_menit && (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {kuis.waktu_menit} menit
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{kuis.pertanyaan.length} pertanyaan</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPertanyaanDialog(kuis)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Tambah Pertanyaan
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteKuis(kuis.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus Kuis
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {kuis.pertanyaan.length > 0 && (
                      <div className="divide-y">
                        {kuis.pertanyaan.map((p, pi) => (
                          <div key={p.id} className="p-4 flex items-start justify-between hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                  {pi + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-gray-900">{p.pertanyaan}</p>
                                  {kuis.tipe === 'pilihan_ganda' && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {['A', 'B', 'C', 'D'].map((opt) => (
                                        <div
                                          key={opt}
                                          className={`p-2 rounded text-sm ${
                                            p.jawaban_benar === opt
                                              ? 'bg-green-100 text-green-700 border border-green-300'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          <span className="font-medium">{opt}.</span>{' '}
                                          {p[`opsi_${opt.toLowerCase()}` as keyof typeof p] || '-'}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePertanyaan(p.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </MotionList>
          )}
        </CardContent>
      </Card>

      {/* Tambah Pertanyaan Dialog */}
      <Dialog open={pertanyaanDialogOpen} onOpenChange={setPertanyaanDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pertanyaan</DialogTitle>
            <DialogDescription>
              Tambahkan pertanyaan untuk kuis: {selectedKuis?.judul}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="pertanyaan">Pertanyaan</Label>
              <Textarea
                id="pertanyaan"
                value={pertanyaanForm.pertanyaan}
                onChange={(e) => setPertanyaanForm({ ...pertanyaanForm, pertanyaan: e.target.value })}
                placeholder="Tulis pertanyaan di sini"
                rows={3}
              />
            </div>

            {selectedKuis?.tipe === 'pilihan_ganda' ? (
              <div className="space-y-3">
                <Label>Opsi Jawaban</Label>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm font-medium">
                      {opt}
                    </span>
                    <Input
                      value={pertanyaanForm[`opsi_${opt.toLowerCase()}` as keyof typeof pertanyaanForm] as string}
                      onChange={(e) => setPertanyaanForm({
                        ...pertanyaanForm,
                        [`opsi_${opt.toLowerCase()}`]: e.target.value
                      })}
                      placeholder={`Opsi ${opt}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Untuk essay, siswa akan menjawab dengan teks</p>
            )}

            <div>
              <Label htmlFor="jawaban">Jawaban Benar</Label>
              {selectedKuis?.tipe === 'pilihan_ganda' ? (
                <Select
                  value={pertanyaanForm.jawaban_benar}
                  onValueChange={(v) => v && setPertanyaanForm({ ...pertanyaanForm, jawaban_benar: v })}
                >
                  <SelectTrigger id="jawaban">
                    <SelectValue placeholder="Pilih jawaban benar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  id="jawaban"
                  value={pertanyaanForm.jawaban_benar}
                  onChange={(e) => setPertanyaanForm({ ...pertanyaanForm, jawaban_benar: e.target.value })}
                  placeholder="Jawaban benar untuk acuan penilaian"
                  rows={2}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPertanyaanDialogOpen(false); resetPertanyaanForm() }}>
              Batal
            </Button>
            <Button onClick={handleCreatePertanyaan}>Tambah Pertanyaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}