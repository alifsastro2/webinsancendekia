'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PertanyaanKuis } from '@/lib/types'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

interface HasilKuis {
  jawaban: Record<string, string>
  skor: number | null
}

interface KuisData {
  id: string
  judul: string
  tipe: 'pilihan_ganda' | 'essay'
  pertanyaan: PertanyaanKuis[]
}

export default function ReviewKuis() {
  const params = useParams()
  const router = useRouter()
  const kuisId = params.kuisId as string
  const confettiTriggered = useRef(false)

  const [kuis, setKuis] = useState<KuisData | null>(null)
  const [hasil, setHasil] = useState<HasilKuis | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  // Trigger confetti when score is good
  useEffect(() => {
    if (hasil?.skor !== null && hasil?.skor !== undefined && hasil.skor >= 80 && !confettiTriggered.current) {
      confettiTriggered.current = true
      setShowConfetti(true)

      // Fire confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 70, ticks: 60, zIndex: 9999 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#26c6da', '#0097a7', '#ffd54f', '#ffb300', '#4caf50'],
        })

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#26c6da', '#0097a7', '#ffd54f', '#ffb300', '#4caf50'],
        })
      }, 250)

      // Extra burst for very high scores
      if (hasil.skor >= 95) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ffd700', '#ffecb3', '#ffc107', '#ff8f00', '#ff5722'],
            startVelocity: 45,
          })
        }, 500)
      }

      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [hasil?.skor])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: hasilData } = await supabase
        .from('hasil_kuis')
        .select('jawaban, skor')
        .eq('kuis_id', kuisId)
        .eq('siswa_id', session.user.id)
        .single()

      if (!hasilData) {
        toast.error('Data tidak ditemukan')
        router.back()
        return
      }

      setHasil(hasilData)

      const { data: kuisData } = await supabase
        .from('kuis')
        .select(`
          id, judul, tipe,
          pertanyaan:pertanyaan_kuis(*)
        `)
        .eq('id', kuisId)
        .single()

      if (kuisData) {
        const sorted = {
          ...kuisData,
          pertanyaan: [...(kuisData.pertanyaan || [])].sort(
            (a: any, b: any) => (a.urutan || 0) - (b.urutan || 0)
          )
        }
        setKuis(sorted as KuisData)
      }
    } catch (error) {
      console.error('Error fetching review data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  // Get score grade
  const getScoreGrade = (skor: number | null) => {
    if (skor === null) return null
    if (skor >= 95) return { grade: 'A+', color: 'text-green-600', bg: 'from-green-50 to-emerald-50', label: 'Luar Biasa!' }
    if (skor >= 85) return { grade: 'A', color: 'text-green-600', bg: 'from-green-50 to-teal-50', label: 'Sangat Baik!' }
    if (skor >= 80) return { grade: 'B+', color: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', label: 'Baik!' }
    if (skor >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'from-blue-50 to-cyan-50', label: 'Bagus!' }
    if (skor >= 60) return { grade: 'C', color: 'text-amber-600', bg: 'from-amber-50 to-yellow-50', label: 'Cukup' }
    return { grade: 'D', color: 'text-red-600', bg: 'from-red-50 to-rose-50', label: 'Perlu Perbaikan' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-gray-500">Memuat hasil...</p>
        </div>
      </div>
    )
  }

  if (!kuis || !hasil) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Data tidak ditemukan</p>
      </div>
    )
  }

  const scoreGrade = getScoreGrade(hasil.skor)

  return (
    <div className="min-h-dvh bg-gray-50">
      <Toaster />

      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">{kuis.judul}</h1>
          <p className="text-xs text-gray-500">
            {kuis.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'} &bull; {kuis.pertanyaan.length} Soal
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-4">
        {/* Enhanced Score card with confetti celebration */}
        {hasil.skor !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className={`border-0 shadow-lg bg-gradient-to-br ${scoreGrade?.bg}`}>
              <CardContent className="p-6 text-center relative overflow-hidden">
                {/* Celebration effect for high scores */}
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: '50%',
                          y: '50%',
                          scale: 0,
                          opacity: 1,
                        }}
                        animate={{
                          x: `${50 + (Math.random() - 0.5) * 150}%`,
                          y: `${50 + (Math.random() - 0.5) * 150}%`,
                          scale: [0, 1.5, 0],
                          opacity: [1, 1, 0],
                        }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#f97316'][i % 5],
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Trophy icon for high scores */}
                {hasil.skor >= 80 && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-3"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <motion.div
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Trophy className="h-8 w-8 text-amber-500" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    hasil.skor >= 80 ? 'bg-white shadow-lg' : 'bg-amber-100'
                  }`}
                >
                  <span className={`text-3xl font-bold ${scoreGrade?.color}`}>
                    {hasil.skor}
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`text-xl font-bold ${scoreGrade?.color} mb-1`}
                >
                  {scoreGrade?.label}
                </motion.p>
                <p className="text-gray-500 text-sm">Nilai Anda</p>

                {/* Stars for excellent scores */}
                {hasil.skor >= 80 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-1 mt-3"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i < Math.ceil(hasil.skor! / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                          }`}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-amber-700 font-medium">Belum Dinilai</p>
              <p className="text-amber-500 text-sm mt-1">Tunggu guru menilai kuis Anda</p>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        {kuis.pertanyaan.map((q, i) => {
          const rawJawaban = hasil.jawaban[q.id]
          // Handle both old format (string) and new format (object)
          const jawabanSiswa = typeof rawJawaban === 'object' && rawJawaban !== null
            ? (rawJawaban as { jawaban: string; skor: number | null }).jawaban
            : String(rawJawaban || '')
          const benar = kuis.tipe === 'pilihan_ganda' && jawabanSiswa.toUpperCase() === q.jawaban_benar

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`border-0 shadow-sm ${kuis.tipe === 'pilihan_ganda' && hasil.skor !== null ? (benar ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500') : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 + 0.2, type: 'spring' }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        kuis.tipe === 'pilihan_ganda' && hasil.skor !== null
                          ? benar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </motion.span>
                    <p className="text-gray-900 font-medium pt-0.5">{q.pertanyaan}</p>
                  </div>

                  {kuis.tipe === 'pilihan_ganda' ? (
                    <div className="space-y-2 ml-10">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const opsiKey = `opsi_${opt.toLowerCase()}` as keyof typeof q
                        const opsiVal = q[opsiKey] as string | undefined
                        if (!opsiVal) return null

                        const isSelected = jawabanSiswa === opt
                        const isCorrectAnswer = opt === q.jawaban_benar

                        let bgClass = 'border-gray-200 bg-white'
                        if (hasil.skor !== null) {
                          if (isCorrectAnswer) bgClass = 'border-green-500 bg-green-50'
                          else if (isSelected && !isCorrectAnswer) bgClass = 'border-red-500 bg-red-50'
                        } else if (isSelected) {
                          bgClass = 'border-amber-500 bg-amber-50'
                        }

                        return (
                          <motion.div
                            key={opt}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 + 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 ${bgClass}`}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                              hasil.skor !== null && isCorrectAnswer
                                ? 'bg-green-500 text-white'
                                : hasil.skor !== null && isSelected && !isCorrectAnswer
                                  ? 'bg-red-500 text-white'
                                  : isSelected
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                              {hasil.skor !== null && isCorrectAnswer ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : hasil.skor !== null && isSelected && !isCorrectAnswer ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                opt
                              )}
                            </span>
                            <span className="text-gray-700">{opsiVal}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="ml-10">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Jawaban Anda:</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{jawabanSiswa || '(tidak dijawab)'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
