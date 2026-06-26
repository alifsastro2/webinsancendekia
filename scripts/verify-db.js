#!/usr/bin/env node

const { Pool } = require('pg')

const connectionString = 'postgresql://postgres:insancendekianusantara@db.pdmxtuptrjdugvrczooq.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  console.log('📊 Verifying Database...\n')

  try {
    // Check tables
    console.log('📋 Tables:')
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`)
    })

    // Check kelas
    console.log('\n🏫 Kelas:')
    const kelasResult = await pool.query('SELECT nama FROM kelas ORDER BY nama')
    kelasResult.rows.forEach(row => {
      console.log(`  ✓ Kelas ${row.nama}`)
    })

    // Check users
    console.log('\n👥 Users:')
    const usersResult = await pool.query(`
      SELECT nama, username, role, is_active,
        COALESCE((SELECT nama FROM kelas WHERE id = users.kelas_id), 'No Class') as kelas
      FROM users
      ORDER BY role, nama
    `)
    usersResult.rows.forEach(row => {
      const status = row.is_active ? '✅' : '❌'
      const roleBadge = row.role === 'guru' ? '👨‍🏫' : '👨‍🎓'
      console.log(`  ${status} ${roleBadge} ${row.nama} (${row.username}) - ${row.kelas}`)
    })

    // Check mata_pelajaran
    console.log('\n📚 Mata Pelajaran:')
    const mapelResult = await pool.query(`
      SELECT mp.nama, mp.kelas_id, k.nama as kelas_nama, u.nama as guru_nama
      FROM mata_pelajaran mp
      LEFT JOIN kelas k ON mp.kelas_id = k.id
      LEFT JOIN users u ON mp.guru_id = u.id
      ORDER BY mp.nama
    `)
    if (mapelResult.rows.length === 0) {
      console.log('  (Belum ada mata pelajaran)')
    } else {
      mapelResult.rows.forEach(row => {
        console.log(`  ✓ ${row.nama} (${row.kelas_nama}) - ${row.guru_nama}`)
      })
    }

    // Check RLS
    console.log('\n🔒 Row Level Security:')
    const rlsResult = await pool.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)
    rlsResult.rows.forEach(row => {
      const status = row.rowsecurity ? '✅' : '❌'
      console.log(`  ${status} ${row.tablename}`)
    })

    console.log('\n✅ Database verification complete!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()