'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Star,
  RotateCcw,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PertanyaanKuis } from '@/lib/types'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

interface HasilKuis {
  jawaban: Record<string, string>
  skor: number | null
  attempt_number: number
}

interface KuisData {
  id: string
  judul: string
  tipe: 'pilihan_ganda' | 'essay'
  waktu_menit: number | null
  due_date: string | null
  attempt_limits: number | null
  pertanyaan: PertanyaanKuis[]
}

export default function ReviewKuis() {
  const params = useParams()
  const router = useRouter()
  const kuisId = params.kuisId as string
  const mapelId = params.mapelId as string
  const confettiTriggered = useRef(false)

  const [kuis, setKuis] = useState<KuisData | null>(null)
  const [hasil, setHasil] = useState<HasilKuis | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [attemptInfo, setAttemptInfo] = useState<{
    currentAttempt: number
    totalAttempts: number
    remaining: number
    canRetry: boolean
    isDueDatePassed: boolean
  }>({
    currentAttempt: 0,
    totalAttempts: 0,
    remaining: 0,
    canRetry: false,
    isDueDatePassed: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Trigger confetti when score is good
  useEffect(() => {
    if (hasil?.skor !== null && hasil?.skor !== undefined && hasil.skor >= 80 && !confettiTriggered.current) {
      confettiTriggered.current = true
      setShowConfetti(true)

      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 70, ticks: 60, zIndex: 9999 }
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#26c6da', '#0097a7', '#ffd54f', '#ffb300', '#4caf50'],
        })
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#26c6da', '#0097a7', '#ffd54f', '#ffb300', '#4caf50'],
        })
      }, 250)

      if (hasil.skor >= 95) {
        setTimeout(() => {
          confetti({
            particleCount: 150, spread: 100,
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

      // Get all attempts for this student
      const { data: allAttempts } = await supabase
        .from('hasil_kuis')
        .select('jawaban, skor, attempt_number')
        .eq('kuis_id', kuisId)
        .eq('siswa_id', session.user.id)
        .order('attempt_number', { ascending: true })

      if (!allAttempts || allAttempts.length === 0) {
        toast.error('Data tidak ditemukan')
        router.back()
        return
      }

      // Get latest result
      const latestAttempt = allAttempts[allAttempts.length - 1]
      setHasil(latestAttempt)

      // Get kuis data
      const { data: kuisData } = await supabase
        .from('kuis')
        .select(`
          id, judul, tipe, waktu_menit, due_date, attempt_limits,
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

        // Calculate attempt info
        const currentAttempt = latestAttempt.attempt_number || allAttempts.length
        const attemptLimits = kuisData.attempt_limits
        const totalAttempts = attemptLimits || Infinity
        const remaining = attemptLimits
          ? Math.max(0, attemptLimits - currentAttempt)
          : Infinity

        // Check if due date passed
        const now = new Date()
        const isDueDatePassed = kuisData.due_date
          ? new Date(kuisData.due_date) < now
          : false

        // Can retry if: has remaining attempts AND due date not passed
        const canRetry = remaining > 0 && !isDueDatePassed

        setAttemptInfo({
          currentAttempt,
          totalAttempts: isFinite(totalAttempts) ? totalAttempts : 0,
          remaining: isFinite(remaining) ? remaining : -1,
          canRetry,
          isDueDatePassed
        })
      }
    } catch (error) {
      console.error('Error fetching review data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const getScoreInfo = (skor: number | null) => {
    if (skor === null) return null
    if (skor >= 95) return { label: 'Luar Biasa!', color: 'text-green-600', bg: 'from-green-50 to-emerald-50' }
    if (skor >= 85) return { label: 'Sangat Baik!', color: 'text-green-600', bg: 'from-green-50 to-teal-50' }
    if (skor >= 80) return { label: 'Baik!', color: 'text-blue-600', bg: 'from-blue-50 to-indigo-50' }
    if (skor >= 70) return { label: 'Bagus!', color: 'text-blue-600', bg: 'from-blue-50 to-cyan-50' }
    if (skor >= 60) return { label: 'Cukup', color: 'text-amber-600', bg: 'from-amber-50 to-yellow-50' }
    return { label: 'Perlu Perbaikan', color: 'text-red-600', bg: 'from-red-50 to-rose-50' }
  }

  const handleRetry = () => {
    if (!kuis) return
    router.push(`/siswa/matapelajaran/${mapelId}/kuis/${kuisId}`)
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

  const scoreInfo = getScoreInfo(hasil.skor)

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
        {/* Attempt Info Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{attemptInfo.currentAttempt}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Attempt {attemptInfo.currentAttempt}
                    {attemptInfo.totalAttempts > 0 && ` dari ${attemptInfo.totalAttempts}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attemptInfo.remaining > 0
                      ? `Sisa ${attemptInfo.remaining} attempt`
                      : attemptInfo.remaining === -1
                        ? 'Unlimited attempts'
                        : 'Attempt habis'}
                  </p>
                </div>
              </div>

              {attemptInfo.isDueDatePassed && (
                <div className="flex items-center gap-1.5 text-red-600 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Deadline Passed</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Card */}
        {hasil.skor !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Card className={`border-0 shadow-lg bg-gradient-to-br ${scoreInfo?.bg}`}>
              <CardContent className="p-6 text-center relative overflow-hidden">
                {/* Confetti effect */}
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: '50%', y: '50%',
                          scale: 0, opacity: 1,
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

                {/* Trophy */}
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
                  <span className={`text-3xl font-bold ${scoreInfo?.color}`}>
                    {hasil.skor}
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`text-xl font-bold ${scoreInfo?.color} mb-1`}
                >
                  {scoreInfo?.label}
                </motion.p>
                <p className="text-gray-500 text-sm">Nilai Anda</p>

                {/* Stars */}
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

        {/* Retry Button */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            {attemptInfo.canRetry ? (
              <Button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Kerjakan Ulang ({attemptInfo.remaining} attempt tersisa)
              </Button>
            ) : attemptInfo.isDueDatePassed ? (
              <div className="text-center py-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-600 font-medium">Batas Waktu Pengerjaan Sudah Habis</p>
                <p className="text-gray-500 text-sm mt-1">Tidak bisa mengerjakan ulang kuis ini</p>
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Semua Attempt Sudah Digunakan</p>
                <p className="text-gray-500 text-sm mt-1">Tidak ada attempt tersisa untuk kuis ini</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        {kuis.pertanyaan.map((q, i) => {
          const rawJawaban = hasil.jawaban[q.id]
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
              <Card className={`border-0 shadow-sm ${
                kuis.tipe === 'pilihan_ganda' && hasil.skor !== null
                  ? (benar ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500')
                  : ''
              }`}>
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
