#!/usr/bin/env node

const { Pool } = require('pg')

const connectionString = 'postgresql://postgres:insancendekianusantara@db.pdmxtuptrjdugvrczooq.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  console.log('🔍 Checking users...\n')

  try {
    // Check users table
    const usersResult = await pool.query(`
      SELECT id, username, nama, email, role, is_active, kelas_id
      FROM users
      ORDER BY role, nama
    `)

    console.log('📋 Users in public.users table:')
    usersResult.rows.forEach(row => {
      console.log(`  - ${row.nama} (@${row.username})`)
      console.log(`    Email: ${row.email}`)
      console.log(`    Role: ${row.role}`)
      console.log(`    Active: ${row.is_active}`)
      console.log(`    ID: ${row.id}`)
      console.log()
    })

    // Check auth.users
    console.log('\n🔑 Auth users (from auth.users):')
    const authResult = await pool.query(`
      SELECT id, email, raw_user_meta_data, created_at
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 10
    `)

    authResult.rows.forEach(row => {
      console.log(`  - ID: ${row.id}`)
      console.log(`    Email: ${row.email}`)
      console.log(`    Metadata:`, row.raw_user_meta_data)
      console.log()
    })

    // Check if azka exists in auth
    const azkaCheck = await pool.query(`
      SELECT u.id, u.username, u.nama, u.email, a.email as auth_email
      FROM users u
      LEFT JOIN auth.users a ON u.id = a.id
      WHERE u.username = 'azka'
    `)

    if (azkaCheck.rows.length === 0) {
      console.log('\n❌ User with username "azka" NOT FOUND in public.users')
    } else {
      const user = azkaCheck.rows[0]
      console.log('\n✅ User with username "azka" FOUND:')
      console.log(`  ID: ${user.id}`)
      console.log(`  Username: ${user.username}`)
      console.log(`  Nama: ${user.nama}`)
      console.log(`  Email (public.users): ${user.email}`)
      console.log(`  Email (auth.users): ${user.auth_email}`)
    }

    // Check if email exists in auth.users
    const emailCheck = await pool.query(`
      SELECT id, email, raw_user_meta_data
      FROM auth.users
      WHERE email = 'azka@sekolah.test'
    `)

    if (emailCheck.rows.length === 0) {
      console.log('\n❌ Email "azka@sekolah.test" NOT FOUND in auth.users')
    } else {
      const user = emailCheck.rows[0]
      console.log('\n✅ Email "azka@sekolah.test" FOUND in auth.users:')
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Metadata:`, user.raw_user_meta_data)
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()