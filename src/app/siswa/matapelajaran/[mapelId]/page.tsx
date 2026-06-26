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
  BookOpen
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MataPelajaran, Materi } from '@/lib/types'
import { MotionList } from '@/components/common/motion'
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

  const [mapel, setMapel] = useState<MataPelajaran | null>(null)
  const [materi, setMateri] = useState<Materi[]>([])
  const [kuis, setKuis] = useState<Kuis[]>([])
  const [loading, setLoading] = useState(true)
  const [userKelasId, setUserKelasId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Get user's kelas_id
      const { data: userData } = await supabase
        .from('users')
        .select('kelas_id')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        setUserKelasId(userData.kelas_id)
      }

      // Get mata pelajaran
      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          guru:users!mata_pelajaran_guru_id_fkey(nama),
          kelas:kelas(nama)
        `)
        .eq('id', mapelId)
        .single()

      if (!mapelData) {
        router.push('/siswa/matapelajaran')
        return
      }

      // Verify user has access (same class)
      if (userData?.kelas_id !== mapelData.kelas_id) {
        router.push('/siswa/matapelajaran')
        return
      }

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

      // Get kuis
      const { data: kuisData } = await supabase
        .from('kuis')
        .select('id, judul, waktu')
        .eq('mata_pelajaran_id', mapelId)
        .order('created_at', { ascending: false })

      if (kuisData) {
        setKuis(kuisData)
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
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <BookOpen className="h-12 w-12 text-gray-300 animate-pulse" />
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
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/siswa/matapelajaran')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{mapel.nama}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{(mapel as any).kelas?.nama}</Badge>
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <User className="h-3 w-3" />
                {(mapel as any).guru?.nama || '-'}
              </span>
            </div>
          </div>
        </div>
        {mapel.deskripsi && (
          <p className="text-gray-600">{mapel.deskripsi}</p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="materi">
        <TabsList>
          <TabsTrigger value="materi">
            <FileText className="mr-2 h-4 w-4" />
            Materi ({materi.length})
          </TabsTrigger>
          <TabsTrigger value="kuis">
            <ClipboardList className="mr-2 h-4 w-4" />
            Kuis ({kuis.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Materi */}
        <TabsContent value="materi" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Materi Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {materi.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada materi tersedia</p>
                  <p className="text-sm text-gray-400 mt-1">Materi akan muncul di sini setelah guru mengupload</p>
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
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{m.judul}</h3>
                            {m.deskripsi && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{m.deskripsi}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(m.created_at)}
                            </p>
                          </div>
                        </div>

                        {m.file_url && (
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                          >
                            <Download className="h-4 w-4" />
                            <span className="font-medium">Download</span>
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </MotionList>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Kuis */}
        <TabsContent value="kuis" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Daftar Kuis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {kuis.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada kuis tersedia</p>
                  <p className="text-sm text-gray-400 mt-1">Kuis akan muncul di sini setelah guru membuat</p>
                </div>
              ) : (
                <MotionList>
                  <div className="grid gap-4">
                    {kuis.map((k, i) => (
                      <motion.div
                        key={k.id}
                        variants={slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <ClipboardList className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{k.judul}</h3>
                            {k.waktu && (
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                  {k.waktu} menit
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        <Link href={`/siswa/matapelajaran/${mapelId}/kuis/${k.id}`}>
                          <Button className="bg-purple-600 hover:from-purple-600 hover:to-pink-600">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Mulai Kuis
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </MotionList>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
