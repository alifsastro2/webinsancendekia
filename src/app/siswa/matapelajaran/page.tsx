'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  BookOpen,
  FileText,
  ClipboardList,
  User
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MataPelajaran } from '@/lib/types'
import { MotionList } from '@/components/common/motion'
import { slideUpVariants } from '@/components/common/motion'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function siswaMataPelajaran() {
  const [mapel, setMapel] = useState<MataPelajaran[]>([])
  const [filteredMapel, setFilteredMapel] = useState<MataPelajaran[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = mapel.filter(m =>
        m.nama.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredMapel(filtered)
    } else {
      setFilteredMapel(mapel)
    }
  }, [search, mapel])

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
      const { data } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          guru:users!mata_pelajaran_guru_id_fkey(nama),
          kelas:kelas(nama),
          materi(count),
          kuis(count)
        `)
        .eq('kelas_id', userData.kelas_id)
        .order('created_at', { ascending: false })

      if (data) {
        const mapelWithCounts = data.map((m: Record<string, unknown>) => ({
          ...m,
          materi_count: (m.materi as { count: number }[])?.[0]?.count || 0,
          kuis_count: (m.kuis as { count: number }[])?.[0]?.count || 0
        }))
        setMapel(mapelWithCounts as unknown as typeof mapel)
        setFilteredMapel(mapelWithCounts as unknown as typeof filteredMapel)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      className="p-4 lg:p-6 xl:p-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mata Pelajaran</h1>
        <p className="text-gray-600 mt-1">Akses materi dan kuis untuk kelas Anda</p>
      </div>

      <Card className="border-0 shadow-lg mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-500">Memuat mata pelajaran...</p>
        </div>
      ) : filteredMapel.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {search ? 'Mata pelajaran tidak ditemukan' : 'Belum ada mata pelajaran tersedia'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <MotionList>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMapel.map((m, i) => (
              <motion.div
                key={m.id}
                variants={slideUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/siswa/matapelajaran/${m.id}`}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{m.nama}</h3>
                          </div>
                          {m.deskripsi && (
                            <p className="text-sm text-gray-600 line-clamp-2">{m.deskripsi}</p>
                          )}
                        </div>
                        <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {(m as any).materi_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardList className="h-4 w-4" />
                            {(m as any).kuis_count}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <User className="h-3 w-3" />
                        {(m as any).guru?.nama || '-'}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </MotionList>
      )}
    </motion.div>
  )
}