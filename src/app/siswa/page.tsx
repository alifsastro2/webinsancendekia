'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  FileText,
  ClipboardList,
  Clock,
  CheckCircle2,
  CalendarClock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MotionCard, MotionList } from '@/components/common/motion'
import { slideUpVariants } from '@/components/common/motion'
import { MataPelajaran } from '@/lib/types'
import Link from 'next/link'

export default function siswaDashboard() {
  const [mataPelajaran, setMataPelajaran] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalMateri: 0,
    totalKuis: 0,
    completedKuis: 0
  })
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
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

      if (!userData?.kelas_id) return

      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select('*, guru:users!mata_pelajaran_guru_id_fkey(nama)')
        .eq('kelas_id', userData.kelas_id) as any

      if (mapelData) {
        setMataPelajaran(mapelData as any)

        const mapelIds = (mapelData as any[]).map((m: any) => m.id)
        let materiCount = 0
        if (mapelIds.length > 0) {
          const { count } = await supabase
            .from('materi')
            .select('*', { count: 'exact', head: true })
            .in('mata_pelajaran_id', mapelIds)
          materiCount = count || 0
        }

        let kuisCount = 0
        if (mapelIds.length > 0) {
          const { count } = await supabase
            .from('kuis')
            .select('*', { count: 'exact', head: true })
            .in('mata_pelajaran_id', mapelIds)
            .eq('published', true)
          kuisCount = count || 0
        }

        let completedCount = 0
        if (mapelIds.length > 0) {
          const { count } = await supabase
            .from('hasil_kuis')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', session.user.id)
          completedCount = count || 0
        }

        setStats({
          totalMateri: materiCount,
          totalKuis: kuisCount,
          completedKuis: completedCount
        })

        const now = new Date().toISOString()
        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data: deadlineData } = await supabase
          .from('kuis')
          .select('id, judul, due_date, mata_pelajaran_id, mata_pelajaran:mata_pelajaran_id(nama)')
          .eq('published', true)
          .not('due_date', 'is', null)
          .gte('due_date', now)
          .lte('due_date', sevenDays)
          .in('mata_pelajaran_id', mapelIds)
          .order('due_date', { ascending: true })

        if (deadlineData) setUpcomingDeadlines(deadlineData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Mata Pelajaran', value: mataPelajaran.length, bgColor: 'bg-green-500' },
    { title: 'Total Materi', value: stats.totalMateri, bgColor: 'bg-green-500' },
    { title: 'Kuis Aktif', value: stats.totalKuis, bgColor: 'bg-green-500' },
    { title: 'Kuis Selesai', value: stats.completedKuis, bgColor: 'bg-green-500' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={slideUpVariants} className="p-4 lg:p-6 xl:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di Portal Siswa</p>
      </div>

      <MotionList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <MotionCard key={stat.title}>
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg text-white ${stat.bgColor}`}>
                    {index === 0 && <BookOpen className="h-5 w-5" />}
                    {index === 1 && <FileText className="h-5 w-5" />}
                    {index === 2 && <ClipboardList className="h-5 w-5" />}
                    {index === 3 && <CheckCircle2 className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  {loading ? '-' : stat.value}
                </motion.div>
              </CardContent>
            </Card>
          </MotionCard>
        ))}
      </MotionList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Mata Pelajaran */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mata Pelajaran</h2>
            <Link href="/siswa/matapelajaran">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Memuat mata pelajaran...</p>
            </div>
          ) : mataPelajaran.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada mata pelajaran tersedia</p>
              </CardContent>
            </Card>
          ) : (
            <MotionList className="grid grid-cols-1 gap-6">
              {mataPelajaran.map((mapel) => (
                <MotionCard key={mapel.id}>
                  <Link href={"/siswa/matapelajaran/" + mapel.id}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                          <span>{mapel.nama}</span>
                          <Badge variant="secondary"><BookOpen className="h-3 w-3 mr-1" />Aktif</Badge>
                        </CardTitle>
                        {mapel.deskripsi && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{mapel.deskripsi}</p>}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FileText className="h-4 w-4" />Materi
                          <span>&bull;</span>
                          <ClipboardList className="h-4 w-4" />Kuis
                        </div>
                        <div className="mt-3 text-xs text-gray-400">Guru: {mapel.guru?.nama || '-'}</div>
                      </CardContent>
                    </Card>
                  </Link>
                </MotionCard>
              ))}
            </MotionList>
          )}
        </div>

        {/* Deadline Mendekat */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">Deadline Mendekat</h2>
            </div>
            <Link href="/siswa/kuis">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-8 text-center">
                <CalendarClock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Tidak ada deadline mendekat</p>
                <p className="text-gray-400 text-sm">Belum ada kuis dengan batas waktu yang akan datang</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingDeadlines.map((item) => {
                const hoursLeft = Math.round((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60))
                return (
                  <Link key={item.id} href={`/siswa/matapelajaran/${item.mata_pelajaran_id}/kuis/${item.id}`}>
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-amber-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.judul}</p>
                            <p className="text-sm text-gray-500">{item.mata_pelajaran?.nama}</p>
                          </div>
                          <Badge className={`border-0 shrink-0 ${hoursLeft < 24 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {hoursLeft < 24
                              ? `${hoursLeft} jam`
                              : `${Math.round(hoursLeft / 24)} hari`}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Deadline: {new Date(item.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
