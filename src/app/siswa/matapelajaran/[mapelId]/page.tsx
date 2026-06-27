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
  Download,
  User,
  ClipboardList,
  BookOpen,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { slideUpVariants } from '@/components/common/motion'
import Link from 'next/link'

interface Kuis {
  id: string
  judul: string
  waktu: number | null
}

export default function siswaMapelDetail() {
  const params = useParams()
  const router = useRouter()
  const mapelId = params.mapelId as string

  const [mapel, setMapel] = useState<any>(null)
  const [materi, setMateri] = useState<any[]>([])
  const [kuis, setKuis] = useState<Kuis[]>([])
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
        .select('id, judul, waktu')
        .eq('mata_pelajaran_id', mapelId)
        .order('created_at', { ascending: false })

      if (kuisData) setKuis(kuisData)
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
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
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
      className="space-y-6"
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
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
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
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2"
          >
            <FileText className="mr-2 h-4 w-4" />
            Materi ({materi.length})
          </TabsTrigger>
          <TabsTrigger
            value="kuis"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-lg px-4 py-2"
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
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white shadow-sm">
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
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                        >
                          <Download className="h-4 w-4" />
                          <span className="font-medium text-sm">Download</span>
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
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-purple-400" />
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
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{k.judul}</h3>
                          {k.waktu && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {k.waktu} menit
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link href={`/siswa/matapelajaran/${mapelId}/kuis/${k.id}`}>
                        <Button className="bg-purple-500 hover:bg-purple-600">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Mulai
                        </Button>
                      </Link>
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
