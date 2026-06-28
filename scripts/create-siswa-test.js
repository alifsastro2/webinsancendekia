#!/usr/bin/env node

const { Pool } = require('pg')
const { createClient } = require('@supabase/supabase-js')

const connectionString = 'postgresql://postgres:insancendekianusantara@db.pdmxtuptrjdugvrczooq.supabase.co:5432/postgres'
const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false }
})

// Get kelas
async function getKelas() {
  const { data } = await supabase.from('kelas').select('*')
  return data || []
}

// Create siswa
async function createMurid(nama, username, password, kelasNama) {
  console.log(`\n📝 Creating siswa: ${nama}`)

  const { data: kelas } = await supabase.from('kelas').select('id').eq('nama', kelasNama).single()

  if (!kelas) {
    console.error(`❌ Kelas ${kelasNama} not found`)
    return null
  }

  const email = `${username}@siswa.test`

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      nama,
      role: 'siswa'
    }
  })

  if (authError) throw authError

  await pool.query(`
    INSERT INTO public.users (id, username, nama, email, role, kelas_id, is_active)
    VALUES ($1, $2, $3, $4, 'siswa', $5, true)
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      nama = EXCLUDED.nama,
      email = EXCLUDED.email,
      kelas_id = EXCLUDED.kelas_id
  `, [authData.user.id, username, nama, email, kelas.id])

  console.log(`✅ Murid ${nama} created (Kelas ${kelasNama})`)

  return {
    username,
    password,
    email,
    nama,
    kelas: kelasNama
  }
}

async function main() {
  console.log('🚀 Creating siswa test accounts...')

  try {
    const kelasList = await getKelas()
    console.log('\n📚 Available classes:', kelasList.map(k => k.nama).join(', '))

    // Create test siswa for each class
    const siswas = [
      { nama: 'Budi Santoso', username: 'budi', kelas: 'X' },
      { nama: 'Siti Aminah', username: 'siti', kelas: 'XI' },
      { nama: 'Ahmad Rizky', username: 'ahmad', kelas: 'XII' }
    ]

    const results = []
    for (const siswa of siswas) {
      const result = await createMurid(siswa.nama, siswa.username, 'Murid123456', siswa.kelas)
      if (result) results.push(result)
    }

    console.log('\n🎉 Murid test accounts created!')
    console.log('\n📱 Login Credentials (same password for all):')
    console.log('   Password: Murid123456\n')

    results.forEach(m => {
      console.log(`   ${m.nama} (${m.kelas})`)
      console.log(`   Username: ${m.username}`)
      console.log(`   Email: ${m.email}\n`)
    })

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()