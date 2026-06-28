'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send
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

interface KuisWithPertanyaan extends Kuis {
  pertanyaan: PertanyaanKuis[]
}

export default function siswaKerjakanKuis() {
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

  useEffect(() => {
    fetchKuis()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            setTimeExpired(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      handleSubmit(true)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timeLeft])

  const fetchKuis = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: existingResult } = await supabase
        .from('hasil_kuis')
        .select('*')
        .eq('kuis_id', kuisId)
        .eq('siswa_id', session.user.id)
        .single()

      if (existingResult) {
        toast.info('Anda sudah mengerjakan kuis ini')
        router.back()
        return
      }

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
          toast.error('Kuis belum diterbitkan')
          router.back()
          return
        }
        if (data.due_date && new Date(data.due_date) < new Date()) {
          toast.error('Batas waktu pengerjaan kuis telah berakhir')
          router.back()
          return
        }
        const sorted = {
          ...data,
          pertanyaan: [...(data.pertanyaan || [])].sort(
            (a: any, b: any) => (a.urutan || 0) - (b.urutan || 0)
          )
        }
        setKuis(sorted as KuisWithPertanyaan)
        if (data.waktu_menit) {
          setTimeLeft(data.waktu_menit * 60)
        }
      }
    } catch (error) {
      console.error('Error fetching kuis:', error)
      toast.error('Gagal memuat kuis')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (expired = false) => {
    if (submitting) return

    setSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Session tidak valid')

      let skor: number | null = null
      if (kuis?.tipe === 'pilihan_ganda') {
        let correct = 0
        const total = kuis.pertanyaan.length

        kuis.pertanyaan.forEach(p => {
          if (jawaban[p.id]?.toUpperCase() === p.jawaban_benar) {
            correct++
          }
        })

        skor = Math.round((correct / total) * 100)
      }

      const { error } = await supabase
        .from('hasil_kuis')
        .insert({
          kuis_id: kuisId,
          siswa_id: session.user.id,
          jawaban,
          skor
        })

      if (error) throw error

      if (expired) {
        toast.error('Waktu habis! Jawaban Anda sudah dikirim otomatis.')
      } else {
        toast.success(kuis?.tipe === 'pilihan_ganda' ? `Jawaban dikirim! Nilai Anda: ${skor}` : 'Jawaban dikirim!')
      }

      setTimeout(() => router.back(), 1500)
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim jawaban')
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

  if (total === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Kuis ini belum memiliki pertanyaan</p>
      </div>
    )
  }
  const isAnswered = (id: string) => !!jawaban[id]
  const unansweredNums = kuis.pertanyaan
    .map((p, i) => i + 1)
    .filter(i => !jawaban[kuis.pertanyaan[i - 1]?.id])
  const unansweredIndices = kuis.pertanyaan
    .map((p, i) => ({ id: p.id, num: i + 1 }))
    .filter(p => !jawaban[p.id])

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
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
            {kuis.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'} &bull; {total} Soal
          </p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
            timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress Pills (mobile only) */}
      <div className="bg-white border-b px-4 py-3 overflow-x-auto lg:hidden">
        <div className="flex gap-1.5 min-w-max">
          {kuis.pertanyaan.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentIndex
                  ? 'bg-green-500 text-white ring-2 ring-green-200 scale-110'
                  : isAnswered(p.id)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
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
                    <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {currentIndex + 1}
                    </span>
                    <p className="text-gray-900 text-base font-medium pt-1">{current.pertanyaan}</p>
                  </div>

                  {kuis.tipe === 'pilihan_ganda' ? (
                    <RadioGroup
                      value={jawaban[current.id] || ''}
                      onValueChange={(value) => setJawaban({ ...jawaban, [current.id]: value })}
                    >
                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const opsiKey = `opsi_${opt.toLowerCase()}` as keyof typeof current
                          const opsiVal = current[opsiKey] as string | undefined
                          if (!opsiVal) return null
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                                jawaban[current.id] === opt
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setJawaban({ ...jawaban, [current.id]: opt })}
                            >
                              <RadioGroupItem value={opt} id={`${current.id}-${opt}`} className="sr-only" />
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                                jawaban[current.id] === opt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {opt}
                              </span>
                              <Label htmlFor={`${current.id}-${opt}`} className="flex-1 cursor-pointer text-gray-700 font-normal">
                                {opsiVal}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </RadioGroup>
                  ) : (
                    <Textarea
                      value={jawaban[current.id] || ''}
                      onChange={(e) => setJawaban({ ...jawaban, [current.id]: e.target.value })}
                      placeholder="Tulis jawaban Anda di sini..."
                      rows={6}
                      className="mt-2 resize-none"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Navigation + Submit (inside scroll area) */}
              <div className="flex items-center gap-3 pb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
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
                  <Button
                    onClick={() => setCurrentIndex(i => Math.min(total - 1, i + 1))}
                    className="flex items-center gap-1"
                  >
                    Berikutnya
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
                <p className="text-center text-sm text-red-600 mb-4 font-medium">
                  Waktu habis! Jawaban akan dikirim otomatis...
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Map (desktop only) */}
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
                  <button
                    key={p.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-10 rounded-lg text-sm font-bold transition-all ${
                      i === currentIndex
                        ? 'bg-green-500 text-white ring-2 ring-green-300 scale-110'
                        : isAnswered(p.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">Terjawab</span>
                  <span className="font-bold text-gray-900">{kuis.pertanyaan.filter(p => isAnswered(p.id)).length}/{total}</span>
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
              <button
                key={u.num}
                onClick={() => {
                  setCurrentIndex(u.num - 1)
                  setShowConfirm(false)
                }}
                className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold text-sm hover:bg-amber-200 transition-colors"
              >
                {u.num}
              </button>
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
