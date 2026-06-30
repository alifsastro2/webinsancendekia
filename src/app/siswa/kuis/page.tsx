'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { slideUpVariants } from '@/components/common/motion'
import Link from 'next/link'

interface QuizResult {
  id: string
  kuis_id: string
  skor: number | null
  kuis: {
    judul: string
    tipe: string
    waktu_menit: number | null
    mata_pelajaran: {
      nama: string
    }
  }
}

interface AvailableQuiz {
  id: string
  judul: string
  tipe: string
  waktu_menit: number | null
  due_date: string | null
  mata_pelajaran_id: string
  mata_pelajaran: {
    nama: string
  }
}

export default function SiswaKuisPage() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [available, setAvailable] = useState<AvailableQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, avgSkor: 0 })

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

      if (!userData?.kelas_id) return

      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select('id, nama')
        .eq('kelas_id', userData.kelas_id)

      if (!mapelData || mapelData.length === 0) return

      const mapelIds = mapelData.map((m: { id: string }) => m.id)

      const now = new Date().toISOString()

      const { data: allKuisData } = await supabase
        .from('kuis')
        .select('id, judul, tipe, waktu_menit, due_date, mata_pelajaran_id, mata_pelajaran!inner(nama)')
        .in('mata_pelajaran_id', mapelIds)
        .eq('published', true)

      if (!allKuisData) return

      const { data: hasilData } = await supabase
        .from('hasil_kuis')
        .select('id, kuis_id, skor, kuis!inner(judul, tipe, waktu_menit, mata_pelajaran!inner(nama))')
        .eq('siswa_id', session.user.id)

      const completedIds = new Set((hasilData || []).map((h: { kuis_id: string }) => h.kuis_id))

      const availableKuis = (allKuisData as unknown as AvailableQuiz[]).filter(
        k => !completedIds.has(k.id) && (!k.due_date || new Date(k.due_date) >= new Date())
      )

      setResults((hasilData as unknown as QuizResult[]) || [])
      setAvailable(availableKuis)

      const scores = (hasilData || []).filter((h: { skor: number | null }) => h.skor !== null).map((h: { skor: number }) => h.skor)
      const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0

      setStats({
        total: allKuisData.length,
        completed: hasilData?.length || 0,
        avgSkor: Math.round(avg)
      })
    } catch (error) {
      console.error('Error fetching quiz data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Kuis', value: stats.total, icon: ClipboardList, color: 'bg-purple-500' },
    { title: 'Selesai Dikerjakan', value: stats.completed, icon: CheckCircle2, color: 'bg-purple-500' },
    { title: 'Rata-rata Nilai', value: stats.avgSkor > 0 ? `${stats.avgSkor}` : '-', icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Tersedia', value: available.length, icon: AlertCircle, color: 'bg-purple-500' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={slideUpVariants} className="p-4 lg:p-6 xl:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kuis Saya</h1>
        <p className="text-gray-600 mt-1">Riwayat dan daftar kuis yang tersedia</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg text-white ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{loading ? '-' : stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kuis Tersedia</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Memuat...</div>
          ) : available.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Semua kuis sudah dikerjakan</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {available.map((quiz) => (
                <Link key={quiz.id} href={`/siswa/matapelajaran/${quiz.mata_pelajaran_id}/kuis/${quiz.id}`}>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-4">
                            <h3 className="font-semibold text-gray-900">{quiz.judul}</h3>
                            <p className="text-sm text-gray-500 mt-1">{quiz.mata_pelajaran?.nama}</p>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                            <FileText className="h-3 w-3" />
                            {quiz.tipe}
                          </Badge>
                        </div>
                        {quiz.waktu_menit && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {quiz.waktu_menit} menit
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Riwayat Pengerjaan</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Memuat...</div>
          ) : results.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada kuis yang dikerjakan</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <Card key={result.id} className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="font-semibold text-gray-900">{result.kuis?.judul}</h3>
                        <p className="text-sm text-gray-500 mt-1">{result.kuis?.mata_pelajaran?.nama}</p>
                      </div>
                      {result.skor !== null ? (
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-green-600">{result.skor}</div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">Selesai</Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0">Belum dinilai</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
