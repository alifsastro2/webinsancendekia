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
  Award,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Skeleton component for loading state
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
        .select('kelas_id, id')
        .eq('guru_id', session.user.id)

      const kelasIds = mapelData?.map(m => m.kelas_id) || []
      const mapelIds = mapelData?.map(m => m.id) || []

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
      color: 'bg-blue-100 text-blue-600',
      bgIcon: 'bg-blue-600',
      trend: '+5% dari bulan lalu',
      action: () => router.push('/guru/siswa')
    },
    {
      title: 'Mata Pelajaran',
      value: stats.totalMatapelajaran,
      icon: BookOpen,
      color: 'bg-green-100 text-green-600',
      bgIcon: 'bg-green-600',
      trend: stats.totalMatapelajaran > 0 ? 'Aktif mengajar' : 'Belum ada',
      action: () => router.push('/guru/matapelajaran')
    },
    {
      title: 'Total Materi',
      value: stats.totalMateri,
      icon: FileText,
      color: 'bg-orange-100 text-orange-600',
      bgIcon: 'bg-orange-500',
      trend: stats.totalMateri > 0 ? 'Tersedia' : 'Belum ada',
      action: () => router.push('/guru/matapelajaran')
    },
    {
      title: 'Total Kuis',
      value: stats.totalKuis,
      icon: ClipboardList,
      color: 'bg-purple-100 text-purple-600',
      bgIcon: 'bg-purple-600',
      trend: stats.totalKuis > 0 ? 'Siap digunakan' : 'Belum ada',
      action: () => router.push('/guru/matapelajaran')
    },
  ]

  const quickActions = [
    {
      title: 'Tambah Mata Pelajaran',
      description: 'Buat mata pelajaran baru untuk kelas Anda',
      icon: BookOpen,
      color: 'bg-green-600',
      action: () => router.push('/guru/matapelajaran')
    },
    {
      title: 'Tambah siswa',
      description: 'Tambah siswa baru ke kelas yang diampu',
      icon: Users,
      color: 'bg-red-600',
      action: () => router.push('/guru/siswa')
    },
    {
      title: 'Buat Kuis',
      description: 'Buat kuis interaktif untuk penilaian',
      icon: ClipboardList,
      color: 'bg-green-700',
      action: () => router.push('/guru/matapelajaran')
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 xl:p-8"
    >
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
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
            className="hidden sm:flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-blue-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all shadow-lg shadow-blue-500/25"
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8"
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 lg:mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={action.action}
                className="cursor-pointer"
              >
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 lg:p-4 rounded-xl ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-500 line-clamp-1">{action.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Activity & Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      >
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <div className="p-2 lg:p-3 bg-blue-600 rounded-xl">
              <Award className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
              <p className="text-xs lg:text-sm text-gray-500">Update terakhir hari ini</p>
            </div>
          </div>

          {stats.totalMatapelajaran === 0 && stats.totalSiswa === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Award className="h-8 w-8 text-gray-400" />
              </motion.div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas</h3>
              <p className="text-sm text-gray-500 mb-4">Mulai dengan membuat mata pelajaran baru</p>
              <button
                onClick={() => router.push('/guru/matapelajaran')}
                className="inline-flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all shadow-lg text-sm lg:text-base"
              >
                <Plus className="h-4 w-4" />
                Buat Mata Pelajaran
              </button>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="p-2 lg:p-3 bg-white rounded-xl shadow-sm">
                  <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{stats.totalMatapelajaran} Mata Pelajaran</p>
                  <p className="text-xs lg:text-sm text-gray-500">{stats.totalMateri} materi • {stats.totalKuis} kuis</p>
                </div>
                <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
              </div>

              <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="p-2 lg:p-3 bg-white rounded-xl shadow-sm">
                  <Users className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{stats.totalSiswa} siswa Aktif</p>
                  <p className="text-xs lg:text-sm text-gray-500">Di semua kelas yang diampu</p>
                </div>
                <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Status Cards */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <div className="p-2 lg:p-3 bg-blue-600 rounded-xl">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Status</h2>
              <p className="text-xs lg:text-sm text-gray-500">Overview aktivitas</p>
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Sistem Online</span>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0">Aktif</Badge>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Database Sync</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-0">Terbaru</Badge>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Backup Auto</span>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-0">Harian</Badge>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}