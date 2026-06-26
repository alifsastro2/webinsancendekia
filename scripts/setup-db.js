#!/usr/bin/env node

const { Pool } = require('pg')

const connectionString = 'postgresql://postgres:insancendekianusantara@db.pdmxtuptrjdugvrczooq.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function executeSQLFile(filePath, name) {
  console.log(`\n🔄 Executing ${name}...`)

  try {
    const sql = require('fs').readFileSync(filePath, 'utf8')

    const result = await pool.query(sql)
    console.log(`✅ ${name} completed successfully`)

    return result
  } catch (error) {
    console.error(`❌ Error in ${name}:`, error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Setting up Supabase database...')

  try {
    // Execute schema
    await executeSQLFile('/tmp/schema_final.sql', 'Schema')

    // Execute RLS
    await executeSQLFile('/tmp/rls_final.sql', 'RLS Policies')

    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📊 Tables created:')
    console.log('  ✓ kelas')
    console.log('  ✓ users')
    console.log('  ✓ mata_pelajaran')
    console.log('  ✓ materi')
    console.log('  ✓ kuis')
    console.log('  ✓ pertanyaan_kuis')
    console.log('  ✓ hasil_kuis')
    console.log('\n🔒 RLS Policies enabled')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()