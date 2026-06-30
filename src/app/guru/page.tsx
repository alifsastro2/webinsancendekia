'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CalendarClock,
  User,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded-lg mb-2" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>
  )
}

export default function GuruDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalMatapelajaran: 0,
    totalMateri: 0,
    totalKuis: 0
  })
  const [pendingGrades, setPendingGrades] = useState<any[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select('id, kelas_id')
        .eq('guru_id', session.user.id)

      const mapelIds = mapelData?.map((m: { id: string }) => m.id) || []
      const kelasIds = mapelData?.map((m: { kelas_id: string }) => m.kelas_id) || []

      let siswaCount = 0
      if (kelasIds.length > 0) {
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'siswa')
          .in('kelas_id', kelasIds)
          .eq('is_active', true)
        siswaCount = count || 0
      }

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
        kuisCount = count || 0
      }

      setStats({
        totalSiswa: siswaCount,
        totalMatapelajaran: mapelIds.length,
        totalMateri: materiCount,
        totalKuis: kuisCount
      })

      if (mapelIds.length > 0) {
        const { data: hasilData } = await supabase
          .from('hasil_kuis')
          .select(`
            id, submitted_at,
            kuis:kuis_id(judul, tipe, mata_pelajaran_id),
            siswa:siswa_id(nama, username)
          `)
          .is('skor', null)
          .in('kuis.mata_pelajaran_id', mapelIds)
          .order('submitted_at', { ascending: false })
          .limit(10)

        if (hasilData) setPendingGrades(hasilData)

        const now = new Date().toISOString()
        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data: deadlineData } = await supabase
          .from('kuis')
          .select('id, judul, due_date, mata_pelajaran_id, mata_pelajaran:mata_pelajaran_id(nama)')
          .not('due_date', 'is', null)
          .gte('due_date', now)
          .lte('due_date', sevenDays)
          .in('mata_pelajaran_id', mapelIds)
          .order('due_date', { ascending: true })

        if (deadlineData) setUpcomingDeadlines(deadlineData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total siswa',
      value: stats.totalSiswa,
      icon: Users,
      color: 'bg-red-100 text-red-600',
      bgIcon: 'bg-red-500',
      trend: '+5% dari bulan lalu',
      action: () => router.push('/guru/siswa')
    },
    {
      title: 'Mata Pelajaran',
      value: stats.totalMatapelajaran,
      icon: BookOpen,
      color: 'bg-red-100 text-red-600',
      bgIcon: 'bg-red-500',
      trend: stats.totalMatapelajaran > 0 ? 'Aktif mengajar' : 'Belum ada',
      action: () => router.push('/guru/matapelajaran')
    },
    {
      title: 'Total Materi',
      value: stats.totalMateri,
      icon: FileText,
      color: 'bg-red-100 text-red-600',
      bgIcon: 'bg-red-500',
      trend: stats.totalMateri > 0 ? 'Tersedia' : 'Belum ada',
      action: () => router.push('/guru/matapelajaran')
    },
    {
      title: 'Total Kuis',
      value: stats.totalKuis,
      icon: ClipboardList,
      color: 'bg-red-100 text-red-600',
      bgIcon: 'bg-red-500',
      trend: stats.totalKuis > 0 ? 'Siap digunakan' : 'Belum ada',
      action: () => router.push('/guru/matapelajaran')
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 xl:p-8 space-y-6"
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                Dashboard Guru
              </h1>
              <p className="text-gray-500 text-sm">Selamat datang di Portal Guru</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/guru/matapelajaran')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
          >
            <Plus className="h-4 w-4" />
            Mapel Baru
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stat.action}
                  className="cursor-pointer"
                >
                  <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3 lg:mb-4">
                      <div className={`p-2 lg:p-3 rounded-xl ${stat.color}`}>
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-300" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                      className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1"
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-xs lg:text-sm text-gray-600 font-medium mb-2">{stat.title}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{stat.trend}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Kuis Perlu Dinilai & Deadline Mendekat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kuis Perlu Dinilai */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Kuis Perlu Dinilai</CardTitle>
                <p className="text-sm text-gray-500">Jawaban essay yang belum dinilai</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-red-200 border-t-red-500 rounded-full mx-auto" />
              </div>
            ) : pendingGrades.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Semua sudah dinilai</p>
                <p className="text-gray-400 text-sm">Tidak ada jawaban yang perlu diperiksa</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingGrades.map((item) => {
                  const mapelId = item.kuis?.mata_pelajaran_id
                  const kuisId = item.kuis_id
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/guru/matapelajaran/${mapelId}/kuis/${kuisId}`)}
                      className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.siswa?.nama}</p>
                        <p className="text-xs text-gray-500 truncate">{item.kuis?.judul}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(item.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deadline Mendekat */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CalendarClock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Deadline Mendekat</CardTitle>
                <p className="text-sm text-gray-500">Kuis dengan batas waktu 7 hari ke depan</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-amber-200 border-t-amber-500 rounded-full mx-auto" />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <CalendarClock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Tidak ada deadline</p>
                <p className="text-gray-400 text-sm">Belum ada kuis dengan batas waktu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => {
                  const hoursLeft = Math.round((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60))
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/guru/matapelajaran/${item.mata_pelajaran_id}/kuis/${item.id}`)}
                      className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.judul}</p>
                        <p className="text-xs text-gray-500 truncate">{item.mata_pelajaran?.nama}</p>
                        <p className="text-xs text-gray-400">
                          {hoursLeft < 24
                            ? `${hoursLeft} jam lagi`
                            : `${Math.round(hoursLeft / 24)} hari lagi`}
                        </p>
                      </div>
                      <Badge className={`border-0 text-xs ${hoursLeft < 24 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {new Date(item.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
