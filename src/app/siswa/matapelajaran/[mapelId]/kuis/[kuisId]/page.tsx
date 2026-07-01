'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProgressBar } from '@/components/ui/progress-bar'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Save
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Kuis, PertanyaanKuis } from '@/lib/types'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { SparkleAnimation } from '@/components/ui/sparkle'

interface KuisWithPertanyaan extends Kuis {
  pertanyaan: PertanyaanKuis[]
}

interface QuizState {
  answers: Record<string, string>
  startTime: number
  totalTime: number
  timestamp: string
}

export default function SiswaKerjakanKuis() {
  const params = useParams()
  const router = useRouter()
  const mapelId = params.mapelId as string
  const kuisId = params.kuisId as string

  const [kuis, setKuis] = useState<KuisWithPertanyaan | null>(null)
  const [loading, setLoading] = useState(true)
  const [jawaban, setJawaban] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timeExpired, setTimeExpired] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  // Auto-save states
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const STORAGE_KEY = `quiz_draft_${kuisId}`
  const answersRef = useRef(jawaban)
  const startTimeRef = useRef<number | null>(null)

  // Keep ref updated
  useEffect(() => {
    answersRef.current = jawaban
  }, [jawaban])

  // Save function
  const saveToStorage = useCallback(() => {
    try {
      const toSave: QuizState = {
        answers: answersRef.current,
        startTime: startTimeRef.current || Date.now(),
        totalTime: kuis?.waktu_menit ? kuis.waktu_menit * 60 : 0,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      setLastSaved(new Date())
      setIsSaving(true)
      setTimeout(() => setIsSaving(false), 1000)
    } catch (e) {
      console.error('Save failed:', e)
    }
  }, [STORAGE_KEY, kuis?.waktu_menit])

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!kuis || !isReady) return

    const saveInterval = setInterval(() => {
      const currentAnswers = answersRef.current
      if (Object.keys(currentAnswers).length > 0) {
        saveToStorage()
      }
    }, 5000)

    return () => clearInterval(saveInterval)
  }, [kuis, STORAGE_KEY, saveToStorage, isReady])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentAnswers = answersRef.current
      if (Object.keys(currentAnswers).length > 0) {
        try {
          const toSave: QuizState = {
            answers: currentAnswers,
            startTime: startTimeRef.current || Date.now(),
            totalTime: kuis?.waktu_menit ? kuis.waktu_menit * 60 : 0,
            timestamp: new Date().toISOString()
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        } catch {
          // Ignore
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [STORAGE_KEY, kuis?.waktu_menit])

  useEffect(() => {
    fetchKuis()
  }, [])

  // Timer effect - runs in real-time, survives refresh
  useEffect(() => {
    if (timeLeft === null || timeExpired || !isReady) return

    if (timeLeft <= 0) {
      setTimeExpired(true)
      handleSubmit(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          setTimeExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, timeExpired, isReady])

  const fetchKuis = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Get all attempts for this student on this kuis
      const { data: allAttempts } = await supabase
        .from('hasil_kuis')
        .select('*')
        .eq('kuis_id', kuisId)
        .eq('siswa_id', session.user.id)

      // Get kuis data with attempt_limits
      const { data } = await supabase
        .from('kuis')
        .select(`
          *,
          pertanyaan:pertanyaan_kuis(*)
        `)
        .eq('id', kuisId)
        .single()

      if (data) {
        if (!data.published) {
          toast.error('Kuis ini belum dibuka oleh guru. Silakan hubungi guru Anda.')
          router.back()
          return
        }
        if (data.due_date && new Date(data.due_date) < new Date()) {
          toast.error('Batas waktu pengerjaan sudah berakhir. Kuis ditutup.')
          router.back()
          return
        }

        // Check attempt limits
        const attemptCount = allAttempts?.length || 0
        if (data.attempt_limits && attemptCount >= data.attempt_limits) {
          toast.error(`Batas percobaan sudah habis. Anda telah mengerjakan kuis ini ${attemptCount} kali.`)
          router.back()
          return
        }

        // Calculate highest score from previous attempts
        const scoredAttempts = (allAttempts || []).filter((a: { skor: number | null }) => a.skor !== null)
        const highestScore = scoredAttempts.length > 0
          ? Math.max(...scoredAttempts.map((a: { skor: number | null }) => a.skor || 0))
          : null

        const sorted = {
          ...data,
          pertanyaan: [...(data.pertanyaan || [])].sort(
            (a: any, b: any) => (a.urutan || 0) - (b.urutan || 0)
          ),
          attemptCount,
          highestScore
        }
        setKuis(sorted as KuisWithPertanyaan & { attemptCount: number; highestScore: number | null })

        // Setup timer - REAL TIME, survives refresh
        if (data.waktu_menit) {
          const totalSeconds = data.waktu_menit * 60

          // Check if there's a saved timer state
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
              const parsed: QuizState = JSON.parse(saved)
              if (parsed.startTime && parsed.totalTime) {
                // Calculate remaining time based on elapsed time
                const elapsedSeconds = Math.floor((Date.now() - parsed.startTime) / 1000)
                const remainingSeconds = parsed.totalTime - elapsedSeconds

                if (remainingSeconds > 0) {
                  // Continue from where it left off
                  startTimeRef.current = parsed.startTime
                  setTimeLeft(remainingSeconds)
                  setJawaban(parsed.answers)
                  answersRef.current = parsed.answers
                  toast.success('Progress terakhir dipulihkan!')
                } else {
                  // Time already expired during previous session
                  setTimeExpired(true)
                  setTimeLeft(0)
                }
              } else {
                // No saved start time, start fresh
                startTimeRef.current = Date.now()
                setTimeLeft(totalSeconds)
              }
            } else {
              // No saved state, start fresh
              startTimeRef.current = Date.now()
              setTimeLeft(totalSeconds)
            }
          } catch {
            startTimeRef.current = Date.now()
            setTimeLeft(totalSeconds)
          }
        } else {
          // No time limit - just restore answers if any
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
              const parsed: QuizState = JSON.parse(saved)
              if (parsed.answers && Object.keys(parsed.answers).length > 0) {
                setJawaban(parsed.answers)
                answersRef.current = parsed.answers
                toast.success('Progress terakhir dipulihkan!')
              }
            }
          } catch {
            // Ignore
          }
          startTimeRef.current = Date.now()
        }

        // Now ready to start
        setIsReady(true)
      }
    } catch (error) {
      console.error('Error fetching kuis:', error)
      toast.error('Gagal memuat kuis. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (expired = false) => {
    if (submitting) return

    setSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sesi login habis. Silakan login ulang.')
        router.push('/login')
        return
      }

      let skor: number | null = null

      const formattedJawaban: Record<string, any> = {}
      if (kuis?.tipe === 'pilihan_ganda') {
        Object.entries(jawaban).forEach(([id, ans]) => {
          formattedJawaban[id] = ans
        })

        let correct = 0
        const total = kuis.pertanyaan.length

        kuis.pertanyaan.forEach(p => {
          if (jawaban[p.id]?.toUpperCase() === p.jawaban_benar) {
            correct++
          }
        })

        skor = Math.round((correct / total) * 100)
      } else {
        Object.entries(jawaban).forEach(([id, ans]) => {
          formattedJawaban[id] = { jawaban: ans, skor: null }
        })
        skor = null
      }

      const attemptNumber = (kuis as any)?.attemptCount ? (kuis as any).attemptCount + 1 : 1

      const { error } = await supabase
        .from('hasil_kuis')
        .insert({
          kuis_id: kuisId,
          siswa_id: session.user.id,
          jawaban: formattedJawaban,
          skor,
          attempt_number: attemptNumber
        })

      if (error) throw error

      // Clear draft after successful submit
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore
      }

      // Notify guru if this is an essay kuis
      if (kuis?.tipe === 'essay') {
        const { data: kuisData } = await supabase
          .from('kuis')
          .select('mata_pelajaran_id, judul')
          .eq('id', kuisId)
          .single()

        if (kuisData) {
          const { data: mapelData } = await supabase
            .from('mata_pelajaran')
            .select('guru_id')
            .eq('id', kuisData.mata_pelajaran_id)
            .single()

          if (mapelData?.guru_id) {
            await supabase.from('notifications').insert({
              user_id: mapelData.guru_id,
              type: 'essay_submitted',
              title: `Jawaban essay perlu dinilai: ${kuisData.judul}`,
              link: `/guru/matapelajaran/${kuisData.mata_pelajaran_id}/kuis/${kuisId}`
            })
          }
        }
      }

      // Get highest score
      const { data: allAttempts } = await supabase
        .from('hasil_kuis')
        .select('skor')
        .eq('kuis_id', kuisId)
        .eq('siswa_id', session.user.id)

      const highestScore = allAttempts?.length
        ? Math.max(...allAttempts.filter((a: { skor: number | null }) => a.skor !== null).map((a: { skor: number | null }) => a.skor || 0))
        : skor

      setShowSparkle(true)

      if (expired) {
        toast.error('Waktu habis! Jawaban Anda otomatis terkirim.')
      } else {
        toast.success(
          kuis?.tipe === 'pilihan_ganda'
            ? `Jawaban terkirim! Nilai Anda: ${skor}${highestScore !== skor ? ` (Tertinggi: ${highestScore})` : ''}`
            : 'Jawaban terkirim!'
        )
      }

      setTimeout(() => router.back(), 2000)
    } catch (error: any) {
      toast.error('Gagal mengirim jawaban. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const requestSubmit = () => {
    if (!kuis) return
    const unanswered = kuis.pertanyaan
      .map((p, i) => ({ id: p.id, index: i + 1 }))
      .filter(p => !jawaban[p.id])

    if (unanswered.length > 0) {
      setShowConfirm(true)
    } else {
      handleSubmit()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const goToNext = () => {
    saveToStorage()
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goToPrev = () => {
    saveToStorage()
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...jawaban, [questionId]: value }
    setJawaban(newAnswers)
    answersRef.current = newAnswers
    saveToStorage()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat kuis...</p>
        </div>
      </div>
    )
  }

  if (!kuis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Kuis tidak ditemukan</p>
      </div>
    )
  }

  const total = kuis.pertanyaan.length
  const current = kuis.pertanyaan[currentIndex]
  const answeredCount = kuis.pertanyaan.filter(p => !!jawaban[p.id]).length

  if (total === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Kuis ini belum memiliki pertanyaan</p>
      </div>
    )
  }

  const isAnswered = (id: string) => !!jawaban[id]
  const unansweredIndices = kuis.pertanyaan
    .map((p, i) => ({ id: p.id, num: i + 1 }))
    .filter(p => !jawaban[p.id])

  const isCritical = timeLeft !== null && timeLeft <= 10
  const isWarning = timeLeft !== null && timeLeft <= 60 && timeLeft > 10

  // Attempt info
  const currentAttempt = (kuis as any).attemptCount || 0
  const attemptLimits = kuis.attempt_limits
  const remaining = attemptLimits ? Math.max(0, attemptLimits - currentAttempt - 1) : -1
  const highestScore = (kuis as any).highestScore

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col relative">
      <Toaster />
      <SparkleAnimation isActive={showSparkle} onComplete={() => setShowSparkle(false)} />

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
            {kuis.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'} &bull; {total} Soal
            {currentAttempt > 0 && (
              <span className="ml-2 text-amber-600">
                &bull; Percobaan ke-{currentAttempt + 1}
                {attemptLimits && ` dari ${attemptLimits}`}
                {attemptLimits && remaining >= 0 && (
                  <span className="text-blue-600 ml-1">({remaining} tersisa)</span>
                )}
                {highestScore !== null && (
                  <span className="text-green-600 ml-1">Tertinggi: {highestScore}</span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* Auto-save indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <motion.div
            animate={isSaving ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Save className="h-3.5 w-3.5 text-gray-400" />
          </motion.div>
          <span className={isSaving ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {isSaving ? 'Menyimpan...' : lastSaved ? 'Tersimpan' : 'Auto-save'}
          </span>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <motion.div
            animate={
              isCritical ? {
                scale: [1, 1.05, 1],
                backgroundColor: [
                  'rgb(254, 242, 242)',
                  'rgb(254, 226, 226)',
                  'rgb(254, 242, 242)',
                ],
              } : isWarning ? {
                backgroundColor: [
                  'rgb(254, 252, 232)',
                  'rgb(254, 250, 220)',
                  'rgb(254, 252, 232)',
                ],
              } : {}
            }
            transition={{ duration: isCritical ? 0.5 : 1, repeat: isCritical || isWarning ? Infinity : 0 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
              isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isCritical && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
            )}
            {isWarning && !isCritical && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-amber-500"
              />
            )}
            <span>{formatTime(timeLeft)}</span>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Progress Pengerjaan</span>
          <span className="text-xs font-medium text-gray-700">{answeredCount}/{total} soal</span>
        </div>
        <ProgressBar value={answeredCount} max={total} size="sm" animated />
      </div>

      {/* Progress Pills (mobile only) */}
      <div className="bg-white border-b px-4 py-3 overflow-x-auto lg:hidden">
        <div className="flex gap-1.5 min-w-max">
          {kuis.pertanyaan.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => setCurrentIndex(i)}
              whileTap={{ scale: 0.9 }}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentIndex
                  ? 'bg-green-500 text-white ring-2 ring-green-200'
                  : isAnswered(p.id)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-0 shadow-lg mb-4">
                <CardContent className="p-5 lg:p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    >
                      {currentIndex + 1}
                    </motion.span>
                    <p className="text-gray-900 text-base font-medium pt-1">{current.pertanyaan}</p>
                  </div>

                  {kuis.tipe === 'pilihan_ganda' ? (
                    <RadioGroup
                      value={jawaban[current.id] || ''}
                      onValueChange={(value) => handleAnswerChange(current.id, value)}
                    >
                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map((opt, idx) => {
                          const opsiKey = `opsi_${opt.toLowerCase()}` as keyof typeof current
                          const opsiVal = current[opsiKey] as string | undefined
                          if (!opsiVal) return null
                          return (
                            <motion.div
                              key={opt}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                                jawaban[current.id] === opt
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleAnswerChange(current.id, opt)}
                            >
                              <RadioGroupItem value={opt} id={`${current.id}-${opt}`} className="sr-only" />
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                                jawaban[current.id] === opt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {opt}
                              </span>
                              <Label htmlFor={`${current.id}-${opt}`} className="flex-1 cursor-pointer text-gray-700 font-normal">
                                {opsiVal}
                              </Label>
                              {jawaban[current.id] === opt && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
                                  <CheckCircle2 className="h-5 w-5" />
                                </motion.div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </RadioGroup>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Textarea
                        value={jawaban[current.id] || ''}
                        onChange={(e) => handleAnswerChange(current.id, e.target.value)}
                        placeholder="Tulis jawaban Anda di sini..."
                        rows={6}
                        className="mt-2 resize-none"
                      />
                      <div className="mt-2 text-xs text-gray-400 text-right">
                        {jawaban[current.id]?.length || 0} karakter
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center gap-3 pb-4">
                <Button
                  variant="outline"
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>

                <div className="flex-1 text-center text-sm text-gray-500">
                  {currentIndex + 1} / {total}
                </div>

                {currentIndex < total - 1 ? (
                  <Button onClick={goToNext} className="flex items-center gap-1">
                    Simpan & Berikutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={requestSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? 'Mengirim...' : 'Kirim'}
                    {!submitting && <Send className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              {timeExpired && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-red-600 mb-4 font-medium"
                >
                  Waktu habis! Jawaban akan dikirim otomatis...
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar (desktop only) */}
        <div className="hidden lg:block w-72 xl:w-80 border-l bg-white p-4 overflow-y-auto shrink-0">
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Daftar Soal</h3>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500" />
                  Terjawab
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-300" />
                  Belum
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {kuis.pertanyaan.map((p, i) => (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      saveToStorage()
                      setCurrentIndex(i)
                    }}
                    className={`h-10 rounded-lg text-sm font-bold transition-all ${
                      i === currentIndex
                        ? 'bg-green-500 text-white ring-2 ring-green-300'
                        : isAnswered(p.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">Terjawab</span>
                  <span className="font-bold text-gray-900">{answeredCount}/{total}</span>
                </div>

                <div className="mb-4">
                  <ProgressBar value={answeredCount} max={total} size="sm" />
                </div>

                <Button
                  onClick={requestSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center">Soal Belum Lengkap</DialogTitle>
            <DialogDescription className="text-center">
              Ada <strong>{unansweredIndices.length}</strong> soal yang belum dijawab:
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 justify-center my-3">
            {unansweredIndices.map(u => (
              <motion.button
                key={u.num}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCurrentIndex(u.num - 1)
                  setShowConfirm(false)
                }}
                className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold text-sm hover:bg-amber-200 transition-colors"
              >
                {u.num}
              </motion.button>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center">
            Anda yakin ingin mengakhiri kuis?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Lanjutkan Mengerjakan
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false)
                handleSubmit()
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Ya, Kirim Jawaban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
