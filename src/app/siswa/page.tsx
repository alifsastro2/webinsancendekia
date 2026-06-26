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
  Award,
  CheckCircle2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MotionCard, MotionList } from '@/components/common/motion'
import { slideUpVariants } from '@/components/common/motion'
import { MataPelajaran } from '@/lib/types'
import Link from 'next/link'

export default function siswaDashboard() {
  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([])
  const [stats, setStats] = useState({
    totalMateri: 0,
    totalKuis: 0,
    completedKuis: 0
  })
  const [loading, setLoading] = useState(true)

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

      if (!userData?.kelas_id) return

      // Get mata pelajaran for user's class
      const { data: mapelData } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          guru:users!mata_pelajaran_guru_id_fkey(nama)
        `)
        .eq('kelas_id', userData.kelas_id)

      if (mapelData) {
        setMataPelajaran(mapelData)

        // Get materi count
        const mapelIds = mapelData.map(m => m.id)
        let materiCount = 0
        if (mapelIds.length > 0) {
          const { count } = await supabase
            .from('materi')
            .select('*', { count: 'exact', head: true })
            .in('mata_pelajaran_id', mapelIds)
          materiCount = count || 0
        }

        // Get kuis count
        let kuisCount = 0
        if (mapelIds.length > 0) {
          const { count } = await supabase
            .from('kuis')
            .select('*', { count: 'exact', head: true })
            .in('mata_pelajaran_id', mapelIds)
          kuisCount = count || 0
        }

        // Get completed kuis
        let completedCount = 0
        if (mapelIds.length > 0) {
          const { count } = await supabase
            .from('hasil_kuis')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', session.user.id)
            .in('kuis_id', mapelIds)
          completedCount = count || 0
        }

        setStats({
          totalMateri: materiCount,
          totalKuis: kuisCount,
          completedKuis: completedCount
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Mata Pelajaran',
      value: mataPelajaran.length,
      icon: BookOpen,
      color: 'from-teal-500 to-blue-500',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Total Materi',
      value: stats.totalMateri,
      icon: FileText,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Kuis Aktif',
      value: stats.totalKuis,
      icon: ClipboardList,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Kuis Selesai',
      value: stats.completedKuis,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di Portal Siswa</p>
      </div>

      <MotionList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <MotionCard key={stat.title}>
              <Card className={`border-0 shadow-lg ${stat.bgColor}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {loading ? '-' : stat.value}
                  </motion.div>
                </CardContent>
              </Card>
            </MotionCard>
          )
        })}
      </MotionList>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mata Pelajaran</h2>
          <Link href="/siswa/matapelajaran">
            <Button variant="outline" size="sm">
              Lihat Semua
            </Button>
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
          <MotionList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mataPelajaran.map((mapel, index) => (
              <MotionCard key={mapel.id}>
                <Link href={`/siswa/matapelajaran/${mapel.id}`}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{mapel.nama}</span>
                        <Badge variant="secondary" className="ml-2">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      </CardTitle>
                      {mapel.deskripsi && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {mapel.deskripsi}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Materi
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="h-4 w-4" />
                          Kuis
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        Guru: {mapel.guru?.nama || '-'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </MotionCard>
            ))}
          </MotionList>
        )}
      </div>
    </motion.div>
  )
}