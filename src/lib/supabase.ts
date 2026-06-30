import { createBrowserClient } from '@supabase/ssr'

// Create a singleton browser client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

// Export supabase instance
export const supabase = getSupabaseBrowserClient()

// Re-export types
export type Database = {
  public: {
    Tables: {
      kelas: {
        Row: {
          id: string
          nama: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          created_by?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          nama: string
          email: string | null
          role: 'guru' | 'siswa'
          kelas_id: string | null
          is_active: boolean
          google_access_token: string | null
          google_refresh_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          nama: string
          email?: string | null
          role: 'guru' | 'siswa'
          kelas_id?: string | null
          is_active?: boolean
          google_access_token?: string | null
          google_refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          nama?: string
          email?: string | null
          role?: 'guru' | 'siswa'
          kelas_id?: string | null
          is_active?: boolean
          google_access_token?: string | null
          google_refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mata_pelajaran: {
        Row: {
          id: string
          nama: string
          deskripsi: string | null
          guru_id: string
          kelas_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          deskripsi?: string | null
          guru_id: string
          kelas_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          deskripsi?: string | null
          guru_id?: string
          kelas_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      materi: {
        Row: {
          id: string
          mata_pelajaran_id: string
          judul: string
          deskripsi: string | null
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mata_pelajaran_id: string
          judul: string
          deskripsi?: string | null
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mata_pelajaran_id?: string
          judul?: string
          deskripsi?: string | null
          file_url?: string | null
          created_at?: string
        }
      }
      kuis: {
        Row: {
          id: string
          mata_pelajaran_id: string
          judul: string
          tipe: 'pilihan_ganda' | 'essay'
          waktu_menit: number | null
          due_date: string | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          mata_pelajaran_id: string
          judul: string
          tipe: 'pilihan_ganda' | 'essay'
          waktu_menit?: number | null
          due_date?: string | null
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          mata_pelajaran_id?: string
          judul?: string
          tipe?: 'pilihan_ganda' | 'essay'
          waktu_menit?: number | null
          due_date?: string | null
          published?: boolean
          created_at?: string
        }
      }
      pertanyaan_kuis: {
        Row: {
          id: string
          kuis_id: string
          pertanyaan: string
          opsi_a: string | null
          opsi_b: string | null
          opsi_c: string | null
          opsi_d: string | null
          jawaban_benar: string
          urutan: number
          created_at: string
        }
        Insert: {
          id?: string
          kuis_id: string
          pertanyaan: string
          opsi_a?: string | null
          opsi_b?: string | null
          opsi_c?: string | null
          opsi_d?: string | null
          jawaban_benar: string
          urutan: number
          created_at?: string
        }
        Update: {
          id?: string
          kuis_id?: string
          pertanyaan?: string
          opsi_a?: string | null
          opsi_b?: string | null
          opsi_c?: string | null
          opsi_d?: string | null
          jawaban_benar?: string
          urutan?: number
          created_at?: string
        }
      }
      hasil_kuis: {
        Row: {
          id: string
          kuis_id: string
          siswa_id: string
          jawaban: any
          skor: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          kuis_id: string
          siswa_id: string
          jawaban: any
          skor?: number | null
          submitted_at?: string
        }
        Update: {
          id?: string
          kuis_id?: string
          siswa_id?: string
          jawaban?: any
          skor?: number | null
          submitted_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables = Database['public']['Tables']
export type TablesInsert = Database['public']['Tables'][keyof Tables]['Insert']
export type TablesUpdate = Database['public']['Tables'][keyof Tables]['Update']
