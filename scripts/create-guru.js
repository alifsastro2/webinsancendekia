#!/usr/bin/env node

/**
 * Script untuk membuat akun guru test: Azka Muhamad Naufal
 *
 * Cara menjalankan:
 * 1. Pastikan environment variables sudah di-set
 * 2. Jalankan: node scripts/create-guru.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Environment variables NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus di-set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Data guru test
const GURU_DATA = {
  email: 'azka@sekolah.test',
  password: 'Azka123456',
  nama: 'Azka Muhamad Naufal',
  username: 'azka',
  role: 'guru'
}

async function createGuru() {
  console.log('🚀 Membuat akun guru test...')
  console.log('📌 Nama:', GURU_DATA.nama)
  console.log('📌 Email:', GURU_DATA.email)
  console.log('📌 Username:', GURU_DATA.username)
  console.log('📌 Password:', GURU_DATA.password)
  console.log()

  try {
    // Check if user already exists
    console.log('🔍 Memeriksa apakah user sudah ada...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', GURU_DATA.username)
      .single()

    if (existingUser) {
      console.log('⚠️  User dengan username', GURU_DATA.username, 'sudah ada!')
      console.log('📌 User ID:', existingUser.id)
      console.log()
      console.log('✅ Gunakan akun ini untuk login:')
      console.log('   Username:', GURU_DATA.username)
      console.log('   Password:', GURU_DATA.password)
      process.exit(0)
    }

    // Check email exists in auth
    console.log('🔍 Memeriksa apakah email sudah terdaftar di auth...')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const emailExists = users?.find(u => u.email === GURU_DATA.email)

    if (emailExists) {
      console.log('⚠️  Email sudah terdaftar. Mencoba membuat profile saja...')

      // Create profile for existing auth user
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: emailExists.id,
          username: GURU_DATA.username,
          nama: GURU_DATA.nama,
          email: GURU_DATA.email,
          role: GURU_DATA.role,
          is_active: true
        })

      if (profileError) {
        console.error('❌ Gagal membuat profile:', profileError.message)
        process.exit(1)
      }

      console.log('✅ Profile berhasil dibuat untuk user yang sudah ada')
      console.log()
      console.log('🎉 Akun guru test siap digunakan!')
      console.log()
      console.log('📱 Login Info:')
      console.log('   Username:', GURU_DATA.username)
      console.log('   Password:', GURU_DATA.password)
      console.log('   Email:', GURU_DATA.email)
      process.exit(0)
    }

    // Create new user
    console.log('📝 Membuat user baru...')

    // First, create auth user using admin API
    // Note: In production, you'd use service role key
    // For now, we'll try with regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: GURU_DATA.email,
      password: GURU_DATA.password,
      options: {
        data: {
          username: GURU_DATA.username,
          nama: GURU_DATA.nama,
          role: GURU_DATA.role
        }
      }
    })

    if (authError) {
      console.error('❌ Gagal membuat auth user:', authError.message)
      console.log()
      console.log('💡 Jika error terkait email verification, coba:')
      console.log('   1. Buka Supabase Dashboard')
      console.log('   2. Authentication > Providers > Email')
      console.log('   3. Disable "Confirm email" sementara')
      process.exit(1)
    }

    if (!authData.user) {
      console.error('❌ Gagal: User tidak dibuat')
      process.exit(1)
    }

    console.log('✅ Auth user berhasil dibuat')
    console.log('📌 Auth User ID:', authData.user.id)

    // Wait a bit for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.log('⚠️  Profile tidak dibuat otomatis. Membuat manual...')

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: GURU_DATA.username,
          nama: GURU_DATA.nama,
          email: GURU_DATA.email,
          role: GURU_DATA.role,
          is_active: true
        })

      if (insertError) {
        console.error('❌ Gagal membuat profile manual:', insertError.message)
        process.exit(1)
      }

      console.log('✅ Profile berhasil dibuat manual')
    } else {
      console.log('✅ Profile berhasil dibuat otomatis')
    }

    console.log()
    console.log('🎉 Akun guru test siap digunakan!')
    console.log()
    console.log('📱 Login Info:')
    console.log('   Username:', GURU_DATA.username)
    console.log('   Password:', GURU_DATA.password)
    console.log('   Email:', GURU_DATA.email)
    console.log()
    console.log('🌐 Buka http://localhost:3000/login dan gunakan credential di atas')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createGuru()