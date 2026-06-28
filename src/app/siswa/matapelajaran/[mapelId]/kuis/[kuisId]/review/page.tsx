'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle
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

  const [kuis, setKuis] = useState<KuisData | null>(null)
  const [hasil, setHasil] = useState<HasilKuis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
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
        {/* Score card */}
        {hasil.skor !== null ? (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">{hasil.skor}</h2>
              <p className="text-green-600 font-medium">Nilai Anda</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-amber-700 font-medium">Belum dinilai</p>
              <p className="text-amber-500 text-sm mt-1">Tunggu guru menilai kuis Anda</p>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        {kuis.pertanyaan.map((q, i) => {
          const jawabanSiswa = hasil.jawaban[q.id]
          const benar = jawabanSiswa?.toUpperCase() === q.jawaban_benar

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
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      kuis.tipe === 'pilihan_ganda' && hasil.skor !== null
                        ? benar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {i + 1}
                    </span>
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
                          <div
                            key={opt}
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
                          </div>
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
