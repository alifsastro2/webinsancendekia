'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Kuis, PertanyaanKuis } from '@/lib/types'
import { toast } from 'sonner'
import { slideUpVariants } from '@/components/common/motion'
import { Timer } from '@/components/common/timer'
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

      // Check if already completed
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

      // Get kuis with pertanyaan
      const { data } = await supabase
        .from('kuis')
        .select(`
          *,
          pertanyaan:pertanyaan_kuis(*)
        `)
        .eq('id', kuisId)
        .single()

      if (data) {
        setKuis(data as KuisWithPertanyaan)
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

      // Calculate score for pilihan ganda
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
        toast.success(kuis?.tipe === 'pilihan_ganda' ? `Jawaban dikirim! Skor Anda: ${skor}` : 'Jawaban dikirim!')
      }

      setTimeout(() => router.back(), 1500)
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim jawaban')
    } finally {
      setSubmitting(false)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

  const allAnswered = kuis.pertanyaan.every(p => jawaban[p.id])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
    >
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{kuis.judul}</h1>
            <p className="text-gray-600 mt-1">
              {kuis.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'} • {kuis.pertanyaan.length} Pertanyaan
            </p>
          </div>
          {timeLeft !== null && (
            <Card className={`border-2 ${timeLeft < 60 ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`} />
                  <span className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {timeExpired && (
        <Card className="border-2 border-red-500 bg-red-50 mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Waktu habis! Jawaban akan dikirim otomatis...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Pertanyaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {kuis.pertanyaan.map((p, i) => (
            <motion.div
              key={p.id}
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.05 }}
              className="border-b pb-8 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 text-lg mb-4">{p.pertanyaan}</p>

                  {kuis.tipe === 'pilihan_ganda' ? (
                    <RadioGroup
                      value={jawaban[p.id] || ''}
                      onValueChange={(value) => setJawaban({ ...jawaban, [p.id]: value })}
                    >
                      <div className="space-y-3">
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <div
                            key={opt}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              jawaban[p.id] === opt
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem value={opt} id={`${p.id}-${opt}`} />
                            <Label
                              htmlFor={`${p.id}-${opt}`}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-semibold mr-2">{opt}.</span>
                              {p[`opsi_${opt.toLowerCase()}` as keyof typeof p] || '-'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <Textarea
                      value={jawaban[p.id] || ''}
                      onChange={(e) => setJawaban({ ...jawaban, [p.id]: e.target.value })}
                      placeholder="Tulis jawaban Anda di sini..."
                      rows={5}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        {!allAnswered && (
          <p className="text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {kuis.pertanyaan.length - Object.keys(jawaban).length} pertanyaan belum dijawab
          </p>
        )}
        <Button
          onClick={() => handleSubmit()}
          disabled={submitting || (!allAnswered && !timeExpired)}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
          {!submitting && <CheckCircle2 className="ml-2 h-5 w-5" />}
        </Button>
      </div>

      <Toaster />
    </motion.div>
  )
}