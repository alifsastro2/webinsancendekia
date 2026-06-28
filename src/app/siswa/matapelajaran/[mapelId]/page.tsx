'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FileText,
  Eye,
  User,
  ClipboardList,
  BookOpen,
  Clock,
  CalendarClock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getFileUrl } from '@/lib/files'
import { slideUpVariants } from '@/components/common/motion'
import Link from 'next/link'

interface Kuis {
  id: string
  judul: string
  waktu_menit: number | null
  due_date: string | null
}

interface HasilKuis {
  kuis_id: string
  skor: number | null
}

export default function siswaMapelDetail() {
  const params = useParams()
  const router = useRouter()
  const mapelId = params.mapelId as string

  const [mapel, setMapel] = useState<any>(null)
  const [materi, setMateri] = useState<any[]>([])
  const [kuis, setKuis] = useState<Kuis[]>([])
  const [hasilKuis, setHasilKuis] = useState<Record<string, HasilKuis>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userData } = await supabase
        .from('users')
        .select('kelas_id')
        .eq('id', session.user.id)
        .single()

      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          guru:users!mata_pelajaran_guru_id_fkey(nama),
          kelas:kelas(nama)
        `)
        .eq('id', mapelId)
        .single()

      if (!mapelData || userData?.kelas_id !== mapelData.kelas_id) {
        router.push('/siswa/matapelajaran')
        return
      }

      setMapel(mapelData)

      const { data: materiData } = await supabase
        .from('materi')
        .select('*')
        .eq('mata_pelajaran_id', mapelId)
        .order('created_at', { ascending: false })

      if (materiData) setMateri(materiData)

      const { data: kuisData } = await supabase
        .from('kuis')
        .select('id, judul, waktu_menit, due_date')
        .eq('mata_pelajaran_id', mapelId)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (kuisData) setKuis(kuisData)

      const { data: hasilData } = await supabase
        .from('hasil_kuis')
        .select('kuis_id, skor')
        .eq('siswa_id', session.user.id)
        .in('kuis_id', (kuisData || []).map(k => k.id))

      if (hasilData) {
        const map: Record<string, HasilKuis> = {}
        hasilData.forEach(h => { map[h.kuis_id] = h })
        setHasilKuis(map)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
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
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Mata pelajaran tidak ditemukan</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 xl:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push('/siswa/matapelajaran')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Kembali</span>
          </motion.button>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mapel.nama}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className="bg-amber-100 text-amber-700 border-0">{mapel.kelas?.nama}</Badge>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {mapel.guru?.nama || '-'}
                </span>
              </div>
            </div>
          </div>
          {mapel.deskripsi && (
            <p className="text-gray-500 text-sm">{mapel.deskripsi}</p>
          )}
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
            Kuis ({kuis.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Materi */}
        <TabsContent value="materi" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              {materi.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada materi</p>
                  <p className="text-gray-400 text-sm mt-1">Materi akan muncul setelah guru upload</p>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{m.judul}</h3>
                          {m.deskripsi && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{m.deskripsi}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(m.created_at)}
                          </p>
                        </div>
                      </div>

                      {m.file_url && (
                        <a
                          href={getFileUrl(m.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="font-medium text-sm">Lihat Materi</span>
                        </a>
                      )}
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
            <CardContent className="p-6">
              {kuis.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-amber-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada kuis</p>
                  <p className="text-gray-400 text-sm mt-1">Kuis akan muncul setelah guru membuat</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {kuis.map((k, i) => (
                    <motion.div
                      key={k.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{k.judul}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {k.waktu_menit && (
                                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {k.waktu_menit} menit
                                </Badge>
                              )}
                              {k.due_date && (
                                <Badge className={`border-0 text-xs ${new Date(k.due_date) < new Date() ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                  <CalendarClock className="h-3 w-3 mr-1" />
                                  {new Date(k.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                              )}
                              {hasilKuis[k.id]?.skor !== null && hasilKuis[k.id] ? (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Nilai: {hasilKuis[k.id].skor}
                                </Badge>
                              ) : hasilKuis[k.id]?.skor === null ? (
                                <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Belum dinilai
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {hasilKuis[k.id] ? (
                          <Link href={`/siswa/matapelajaran/${mapelId}/kuis/${k.id}/review`}>
                            <Button className="bg-amber-500 hover:bg-amber-600">
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Lihat
                            </Button>
                          </Link>
                        ) : k.due_date && new Date(k.due_date) < new Date() ? (
                          <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                            <Clock className="mr-2 h-4 w-4" />
                            Ditutup
                          </Button>
                        ) : (
                          <Link href={`/siswa/matapelajaran/${mapelId}/kuis/${k.id}`}>
                            <Button className="bg-amber-500 hover:bg-amber-600">
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Mulai
                            </Button>
                          </Link>
                        )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
