'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Trash2,
  ClipboardList,
  Clock,
  ArrowLeft,
  PlusCircle,
  Trash,
  CheckCircle2,
  XCircle,
  User,
  ChevronDown,
  ChevronUp,
  Save,
  Star,
  CalendarClock,
  MoreVertical,
  Trophy,
  Circle,
  Users,
  Medal,
  Award,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { Kuis, PertanyaanKuis } from '@/lib/types'
import { toast } from 'sonner'
import { slideUpVariants } from '@/components/common/motion'

interface KuisWithPertanyaan extends Kuis {
  pertanyaan: PertanyaanKuis[]
}

interface HasilWithSiswa {
  id: string
  siswa_id: string
  jawaban: Record<string, string>
  skor: number | null
  submitted_at: string
  siswa: {
    nama: string
    username: string
  }
}

interface LeaderboardEntry {
  rank: number
  siswa_id: string
  nama: string
  username: string
  status: 'selesai' | 'belum' | 'belum_dinilai'
  skor: number | null
  submitted_at: string | null
}

export default function GuruKuisDetail() {
  const params = useParams()
  const router = useRouter()
  const mapelId = params.id as string
  const kuisId = params.kuisId as string

  const [kuis, setKuis] = useState<KuisWithPertanyaan | null>(null)
  const [hasilList, setHasilList] = useState<HasilWithSiswa[]>([])
  const [loading, setLoading] = useState(true)
  const [pertanyaanDialogOpen, setPertanyaanDialogOpen] = useState(false)
  const [expandedSiswa, setExpandedSiswa] = useState<string | null>(null)
  const [nilaiMap, setNilaiMap] = useState<Record<string, string>>({})
  const [savingNilai, setSavingNilai] = useState<Record<string, boolean>>({})
  const [editingNilai, setEditingNilai] = useState<Record<string, boolean>>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  const [pertanyaanForm, setPertanyaanForm] = useState({
    pertanyaan: '',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    jawaban_benar: ''
  })

  useEffect(() => {
    Promise.all([fetchKuis(), fetchHasil()]).finally(() => setLoading(false))
  }, [])

  const fetchKuis = async () => {
    try {
      const { data } = await supabase
        .from('kuis')
        .select('*, mata_pelajaran:mata_pelajaran_id(kelas_id)')
        .eq('id', kuisId)
        .single()

      if (data) {
        const sorted = {
          ...data,
          pertanyaan: [...(data.pertanyaan || [])].sort(
            (a: any, b: any) => (a.urutan || 0) - (b.urutan || 0)
          )
        }
        setKuis(sorted as KuisWithPertanyaan)

        // Fetch leaderboard data after kuis is loaded
        if (data.mata_pelajaran?.kelas_id) {
          fetchLeaderboard(data.mata_pelajaran.kelas_id)
        }
      }
    } catch (error) {
      console.error('Error fetching kuis:', error)
    }
  }

  const fetchLeaderboard = async (kelasId: string) => {
    try {
      // Get all students from this class
      const { data: students } = await supabase
        .from('users')
        .select('id, nama, username')
        .eq('role', 'siswa')
        .eq('kelas_id', kelasId)

      // Get all results for this kuis
      const { data: results } = await supabase
        .from('hasil_kuis')
        .select('siswa_id, skor, submitted_at')
        .eq('kuis_id', kuisId)

      if (students && results) {
        // Create a map of siswa_id to result
        const resultsMap = new Map(
          results.map(r => [r.siswa_id, r])
        )

        // Build leaderboard entries
        const entries: LeaderboardEntry[] = students.map((student, index) => {
          const result = resultsMap.get(student.id)

          let status: 'selesai' | 'belum' | 'belum_dinilai' = 'belum'
          let skor: number | null = null
          let submittedAt: string | null = null

          if (result) {
            submittedAt = result.submitted_at
            if (result.skor !== null) {
              status = 'selesai'
              skor = result.skor
            } else {
              status = 'belum_dinilai'
            }
          }

          return {
            rank: 0, // Will be calculated after sorting
            siswa_id: student.id,
            nama: student.nama,
            username: student.username,
            status,
            skor,
            submitted_at: submittedAt
          }
        })

        // Sort: completed (by score DESC), then incomplete at bottom
        entries.sort((a, b) => {
          // Both completed - sort by score
          if (a.status === 'selesai' && b.status === 'selesai') {
            return (b.skor || 0) - (a.skor || 0)
          }
          // Completed first
          if (a.status === 'selesai') return -1
          if (b.status === 'selesai') return 1
          // Ungraded next
          if (a.status === 'belum_dinilai') return -1
          if (b.status === 'belum_dinilai') return 1
          // Not started last
          return 0
        })

        // Assign ranks
        let currentRank = 1
        entries.forEach((entry) => {
          entry.rank = currentRank++
        })

        setLeaderboard(entries)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const fetchHasil = async () => {
    try {
      const { data } = await supabase
        .from('hasil_kuis')
        .select('*, siswa:users!hasil_kuis_siswa_id_fkey(nama, username)')
        .eq('kuis_id', kuisId)
        .order('submitted_at', { ascending: false })

      if (data) {
        setHasilList(data as unknown as HasilWithSiswa[])
      }
    } catch (error) {
      console.error('Error fetching hasil:', error)
    }
  }

  const handleCreatePertanyaan = async () => {
    if (!kuis) return
    try {
      if (!pertanyaanForm.pertanyaan || !pertanyaanForm.jawaban_benar) {
        toast.error('Pertanyaan dan jawaban benar wajib diisi')
        return
      }
      if (kuis.tipe === 'pilihan_ganda' && (!pertanyaanForm.opsi_a || !pertanyaanForm.opsi_b || !pertanyaanForm.opsi_c || !pertanyaanForm.opsi_d)) {
        toast.error('Semua opsi jawaban wajib diisi untuk pilihan ganda')
        return
      }
      const nextOrder = kuis.pertanyaan.length + 1
      const { error } = await supabase.from('pertanyaan_kuis').insert({
        kuis_id: kuis.id,
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

  const handleDeletePertanyaan = async (id: string) => {
    try {
      await supabase.from('pertanyaan_kuis').delete().eq('id', id)
      toast.success('Pertanyaan berhasil dihapus')
      fetchKuis()
    } catch (error) {
      toast.error('Gagal menghapus pertanyaan')
    }
  }

  const handleDeleteKuis = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus kuis ini?')) return
    try {
      await supabase.from('kuis').delete().eq('id', kuisId)
      toast.success('Kuis berhasil dihapus')
      router.push(`/guru/matapelajaran/${mapelId}`)
    } catch (error) {
      toast.error('Gagal menghapus kuis')
    }
  }

  const handlePublishKuis = async () => {
    try {
      if (!kuis || kuis.pertanyaan.length === 0) {
        toast.error('Tambahkan minimal 1 pertanyaan sebelum menerbitkan')
        return
      }
      const { error } = await supabase
        .from('kuis')
        .update({ published: true })
        .eq('id', kuisId)
      if (error) throw error
      toast.success('Kuis berhasil diterbitkan')
      fetchKuis()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menerbitkan kuis')
    }
  }

  const handleSaveNilai = async (hasilId: string) => {
    const skor = parseInt(nilaiMap[hasilId])
    if (isNaN(skor) || skor < 0 || skor > 100) {
      toast.error('Nilai harus antara 0-100')
      return
    }
    setSavingNilai(prev => ({ ...prev, [hasilId]: true }))
    try {
      const { error: updateError } = await supabase
        .from('hasil_kuis')
        .update({ skor })
        .eq('id', hasilId)
      if (updateError) throw updateError

      const { data: verify, error: verifyError } = await supabase
        .from('hasil_kuis')
        .select('skor')
        .eq('id', hasilId)
        .single()
      if (verifyError) throw verifyError
      if (verify?.skor === null) throw new Error('Nilai gagal disimpan. Coba lagi.')

      toast.success('Nilai berhasil disimpan')
      setEditingNilai(prev => ({ ...prev, [hasilId]: false }))
      setNilaiMap(prev => {
        const next = { ...prev }
        delete next[hasilId]
        return next
      })
      fetchHasil()
    } catch (error: any) {
      console.error('Save nilai error:', error)
      toast.error(error.message || 'Gagal menyimpan nilai')
    } finally {
      setSavingNilai(prev => ({ ...prev, [hasilId]: false }))
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!kuis) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Kuis tidak ditemukan</p>
      </div>
    )
  }

  const totalSiswa = hasilList.length
  const rataRata = hasilList.filter(h => h.skor !== null).reduce((a, h) => a + (h.skor || 0), 0)
  const rataRataCount = hasilList.filter(h => h.skor !== null).length

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      className="p-4 lg:p-6 xl:p-8"
    >
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(`/guru/matapelajaran/${mapelId}`)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{kuis.judul}</h1>
              <Badge variant={kuis.tipe === 'pilihan_ganda' ? 'default' : 'secondary'}>
                {kuis.tipe === 'pilihan_ganda' ? 'PG' : 'Essay'}
              </Badge>
              {kuis.waktu_menit && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {kuis.waktu_menit}m
                </Badge>
              )}
              {kuis.due_date && (
                <Badge variant="outline" className="gap-1 text-xs text-red-600 border-red-200">
                  <CalendarClock className="h-3 w-3" />
                  {new Date(kuis.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {kuis.pertanyaan.length} pertanyaan &bull; {totalSiswa} siswa
              {rataRataCount > 0 && ` &bull; Rata-rata: ${Math.round(rataRata / rataRataCount)}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!kuis.published ? (
              <Button onClick={handlePublishKuis} size="sm" className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Terbitkan
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Terbit
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none h-9 w-9 rounded-lg hover:bg-gray-100 border border-gray-200" />
                }
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setPertanyaanDialogOpen(true)} className="cursor-pointer">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Pertanyaan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteKuis} className="cursor-pointer text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Kuis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="soal" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="soal" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2">
            <ClipboardList className="mr-2 h-4 w-4" />
            Soal ({kuis.pertanyaan.length})
          </TabsTrigger>
          <TabsTrigger value="hasil" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2">
            <Star className="mr-2 h-4 w-4" />
            Hasil ({totalSiswa})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard ({leaderboard.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Soal */}
        <TabsContent value="soal" className="mt-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Daftar Pertanyaan</CardTitle>
                  <p className="text-sm text-gray-500">Kelola pertanyaan kuis</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {kuis.pertanyaan.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada pertanyaan</p>
                  <p className="text-gray-400 text-sm mt-1">Tambahkan pertanyaan pertama untuk kuis ini</p>
                  <Button onClick={() => setPertanyaanDialogOpen(true)} className="mt-4 bg-amber-500 hover:bg-amber-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pertanyaan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {kuis.pertanyaan.map((p, pi) => (
                    <div key={p.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">{pi + 1}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{p.pertanyaan}</p>
                              {kuis.tipe === 'pilihan_ganda' && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {['A', 'B', 'C', 'D'].map((opt) => {
                                    const opsiVal = p[`opsi_${opt.toLowerCase()}` as keyof typeof p]
                                    if (!opsiVal) return null
                                    return (
                                      <div key={opt} className={`p-2.5 rounded-lg text-sm ${p.jawaban_benar === opt ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-white text-gray-600 border border-gray-200'}`}>
                                        <span className="font-medium">{opt}.</span> {opsiVal as string}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              {kuis.tipe === 'essay' && (
                                <div className="mt-2 text-sm text-gray-500">
                                  <span className="font-medium">Kunci jawaban:</span> {p.jawaban_benar}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePertanyaan(p.id)} className="text-red-600 hover:text-red-700 shrink-0">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Hasil Siswa */}
        <TabsContent value="hasil" className="mt-6">
          {hasilList.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-gray-500 font-medium">Belum ada siswa yang mengerjakan</p>
                <p className="text-gray-400 text-sm mt-1">Hasil akan muncul setelah siswa mengerjakan kuis</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {hasilList.map((hasil) => {
                const expanded = expandedSiswa === hasil.id
                return (
                  <Card key={hasil.id} className="border-0 shadow-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedSiswa(expanded ? null : hasil.id)}
                      className="w-full text-left"
                    >
                      <CardContent className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{hasil.siswa?.nama || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">@{hasil.siswa?.username || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasil.skor !== null ? (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">{hasil.skor}</div>
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">Dinilai</Badge>
                            </div>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-0">Belum Dinilai</Badge>
                          )}
                          {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                        </div>
                      </CardContent>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 border-t">
                            {kuis.pertanyaan.map((p, pi) => {
                              const jawabanSiswa = hasil.jawaban?.[p.id] || ''
                              const isPilihanGanda = kuis.tipe === 'pilihan_ganda'
                              const benar = isPilihanGanda && jawabanSiswa.toUpperCase() === p.jawaban_benar

                              return (
                                <div key={p.id} className="pt-4">
                                  <div className="flex items-start gap-2 mb-2">
                                    <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium shrink-0">{pi + 1}</span>
                                    <p className="text-sm font-medium text-gray-900">{p.pertanyaan}</p>
                                  </div>

                                  {isPilihanGanda ? (
                                    <div className="ml-8">
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                        benar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                        {benar ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                        Jawaban: {jawabanSiswa || '(tidak dijawab)'}
                                      </div>
                                      {!benar && jawabanSiswa && (
                                        <div className="mt-1 text-xs text-gray-500 ml-1">
                                          Jawaban benar: {p.jawaban_benar}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="ml-8 space-y-2">
                                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                        {jawabanSiswa || <span className="text-gray-400 italic">Tidak dijawab</span>}
                                      </div>
                                      {hasil.skor === null && (
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="Nilai (0-100)"
                                            value={nilaiMap[hasil.id] ?? ''}
                                            onChange={(e) => setNilaiMap({ ...nilaiMap, [hasil.id]: e.target.value })}
                                            className="w-36 text-sm"
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleSaveNilai(hasil.id)}
                                            disabled={savingNilai[hasil.id]}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <Save className="h-4 w-4 mr-1" />
                                            {savingNilai[hasil.id] ? 'Menyimpan...' : 'Simpan Nilai'}
                                          </Button>
                                        </div>
                                      )}

                                      {editingNilai[hasil.id] && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="Nilai (0-100)"
                                            value={nilaiMap[hasil.id] ?? hasil.skor ?? ''}
                                            onChange={(e) => setNilaiMap({ ...nilaiMap, [hasil.id]: e.target.value })}
                                            className="w-36 text-sm"
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => handleSaveNilai(hasil.id)}
                                            disabled={savingNilai[hasil.id]}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <Save className="h-4 w-4 mr-1" />
                                            {savingNilai[hasil.id] ? 'Menyimpan...' : 'Simpan Nilai'}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setEditingNilai(prev => ({ ...prev, [hasil.id]: false }))
                                              setNilaiMap(prev => {
                                                const next = { ...prev }
                                                delete next[hasil.id]
                                                return next
                                              })
                                            }}
                                          >
                                            Batal
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}

                            {kuis.tipe === 'essay' && hasil.skor !== null && !editingNilai[hasil.id] && (
                              <div className="pt-2 text-sm text-gray-500 flex items-center gap-3">
                                <span>Sudah dinilai: <strong>{hasil.skor}</strong></span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setNilaiMap(prev => ({ ...prev, [hasil.id]: String(hasil.skor) }))
                                    setEditingNilai(prev => ({ ...prev, [hasil.id]: true }))
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab Leaderboard */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Leaderboard Kuis</CardTitle>
                  <p className="text-sm text-gray-500">Peringkat siswa berdasarkan nilai</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada data siswa</p>
                  <p className="text-gray-400 text-sm">Siswa akan muncul setelah kuis dibuat</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peringkat</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map((entry) => (
                        <tr key={entry.siswa_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {entry.rank === 1 && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/30">
                                  <Medal className="h-5 w-5 text-white" />
                                </div>
                              )}
                              {entry.rank === 2 && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg shadow-gray-400/30">
                                  <Award className="h-5 w-5 text-white" />
                                </div>
                              )}
                              {entry.rank === 3 && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg shadow-amber-700/30">
                                  <Award className="h-5 w-5 text-white" />
                                </div>
                              )}
                              {entry.rank > 3 && (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                                  {entry.rank}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                {entry.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{entry.nama}</p>
                                <p className="text-sm text-gray-500">@{entry.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            {entry.status === 'selesai' && (
                              <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Selesai
                              </Badge>
                            )}
                            {entry.status === 'belum_dinilai' && (
                              <Badge className="bg-amber-100 text-amber-700 border-0 gap-1">
                                <Clock className="h-3 w-3" />
                                Belum Dinilai
                              </Badge>
                            )}
                            {entry.status === 'belum' && (
                              <Badge variant="outline" className="text-gray-500 gap-1">
                                <FileText className="h-3 w-3" />
                                Belum Mengerjakan
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            {entry.skor !== null ? (
                              <span className={`inline-flex items-center justify-center min-w-[48px] px-3 py-1 rounded-full text-lg font-bold ${
                                entry.skor >= 80 ? 'bg-green-100 text-green-700' :
                                entry.skor >= 60 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {entry.skor}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-lg">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tambah Pertanyaan Dialog */}
      <Dialog open={pertanyaanDialogOpen} onOpenChange={setPertanyaanDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pertanyaan</DialogTitle>
            <DialogDescription>Tambahkan pertanyaan untuk: {kuis.judul}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="pertanyaan">Pertanyaan</Label>
              <Textarea id="pertanyaan" value={pertanyaanForm.pertanyaan} onChange={(e) => setPertanyaanForm({ ...pertanyaanForm, pertanyaan: e.target.value })} placeholder="Tulis pertanyaan di sini" rows={3} />
            </div>
            {kuis.tipe === 'pilihan_ganda' ? (
              <div className="space-y-3">
                <Label>Opsi Jawaban</Label>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm font-medium">{opt}</span>
                    <Input value={pertanyaanForm[`opsi_${opt.toLowerCase()}` as keyof typeof pertanyaanForm] as string} onChange={(e) => setPertanyaanForm({ ...pertanyaanForm, [`opsi_${opt.toLowerCase()}`]: e.target.value })} placeholder={`Opsi ${opt}`} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Untuk essay, siswa akan menjawab dengan teks</p>
            )}
            <div>
              <Label htmlFor="jawaban">Jawaban Benar</Label>
              {kuis.tipe === 'pilihan_ganda' ? (
                <Select value={pertanyaanForm.jawaban_benar} onValueChange={(v) => v && setPertanyaanForm({ ...pertanyaanForm, jawaban_benar: v })}>
                  <SelectTrigger id="jawaban"><SelectValue placeholder="Pilih jawaban benar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Textarea id="jawaban" value={pertanyaanForm.jawaban_benar} onChange={(e) => setPertanyaanForm({ ...pertanyaanForm, jawaban_benar: e.target.value })} placeholder="Jawaban benar untuk acuan penilaian" rows={2} />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPertanyaanDialogOpen(false); resetPertanyaanForm() }}>Batal</Button>
            <Button onClick={handleCreatePertanyaan}>Tambah Pertanyaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
