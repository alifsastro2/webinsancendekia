import { Tables } from './supabase'

// User types
export type User = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

// Kelas types
export type Kelas = Tables['kelas']['Row']
export type KelasInsert = Tables['kelas']['Insert']

// Mata Pelajaran types
export type MataPelajaran = Tables['mata_pelajaran']['Row']
export type MataPelajaranInsert = Tables['mata_pelajaran']['Insert']
export type MataPelajaranUpdate = Tables['mata_pelajaran']['Update']

// Materi types
export type Materi = Tables['materi']['Row']
export type MateriInsert = Tables['materi']['Insert']

// Materi Views types (tracking siapa yang sudah buka materi)
export interface MateriView {
  id: string
  materi_id: string
  siswa_id: string
  viewed_at: string
}

export interface MateriViewWithSiswa extends MateriView {
  siswa: {
    id: string
    nama: string
    username: string
  }
}

// Notification types
export type NotificationType = 'quiz_published' | 'quiz_graded' | 'quiz_deadline_soon' | 'materi_published' | 'essay_submitted'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// Kuis types
export type Kuis = Tables['kuis']['Row']
export type KuisInsert = Tables['kuis']['Insert']
export type KuisUpdate = Tables['kuis']['Update']

// Pertanyaan Kuis types
export type PertanyaanKuis = Tables['pertanyaan_kuis']['Row']
export type PertanyaanKuisInsert = Tables['pertanyaan_kuis']['Insert']

// Hasil Kuis types
export type HasilKuis = Tables['hasil_kuis']['Row']
export type HasilKuisInsert = Tables['hasil_kuis']['Insert']

// Extended types with relations
export type MataPelajaranWithGuru = MataPelajaran & {
  guru: Pick<User, 'id' | 'nama'>
  kelas: Pick<Kelas, 'id' | 'nama'>
  materi_count: number
  kuis_count: number
}

export type MataPelajaranWithRelations = MataPelajaran & {
  guru: Pick<User, 'id' | 'nama'>
  kelas: Pick<Kelas, 'id' | 'nama'>
  materi: Materi[]
  kuis: Kuis[]
}

export type KuisWithPertanyaan = Kuis & {
  pertanyaan: PertanyaanKuis[]
}

export type HasilKuisWithKuis = HasilKuis & {
  kuis: Pick<Kuis, 'id' | 'judul' | 'tipe' | 'mata_pelajaran_id'>
}

// Auth types
export type UserRole = 'guru' | 'siswa'

export interface AuthUser {
  id: string
  email?: string
  role: UserRole
  nama: string
  kelas_id?: string
}

// Form types
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
  nama: string
  email?: string
  role: UserRole
  kelas_id?: string
}

export interface siswaForm {
  nama: string
  username: string
  email?: string
  kelas_id: string
}

export interface MataPelajaranForm {
  nama: string
  deskripsi: string
  kelas_id: string
}

export interface MateriForm {
  judul: string
  deskripsi: string
  file_url: string
}

export interface KuisForm {
  judul: string
  tipe: 'pilihan_ganda' | 'essay'
  waktu_menit?: number
  due_date?: string
  attempt_limits?: number | null
}

export interface PertanyaanForm {
  pertanyaan: string
  opsi_a?: string
  opsi_b?: string
  opsi_c?: string
  opsi_d?: string
  jawaban_benar: string
}