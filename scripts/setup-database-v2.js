#!/usr/bin/env node

/**
 * Script untuk setup database Supabase menggunakan client library
 * Membuat tabel dan data secara langsung tanpa raw SQL
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: URL or Service Role Key tidak valid')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

/**
 * Try to create a table via API (using the direct approach)
 * Note: This may not work for all operations due to RLS
 */
async function setupTables() {
  console.log('========================================')
  console.log('Supabase Database Setup v2')
  console.log('========================================')
  console.log(`🌐 URL: ${supabaseUrl}`)
  console.log()
  console.log('⚠️  Cara Setup Database:')
  console.log()
  console.log('Karena Supabase tidak menyediakan API langsung untuk execute SQL,')
  console.log('harap jalankan SQL berikut di Supabase Dashboard:')
  console.log()
  console.log('1. Buka: https://supabase.com/dashboard/project/pdmxtuptrjdugvrczooq')
  console.log('2. Masuk ke SQL Editor')
  console.log('3. Create New Query')
  console.log('4. Run SQL di bawah ini:')
  console.log()

  // Display the schema.sql content
  const schemaPath = path.join(__dirname, '../supabase/schema.sql')
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

  console.log('═════════════════════════════════════════════════')
  console.log('STEP 1: SCHEMA (Copy & Paste ini ke Supabase SQL Editor)')
  console.log('═════════════════════════════════════════════════')
  console.log(schemaSQL)
  console.log()
  console.log('═════════════════════════════════════════════════')
  console.log('STEP 2: RLS POLICIES (Setelah schema berhasil, jalankan ini)')
  console.log('═════════════════════════════════════════════════')

  const rlsPath = path.join(__dirname, '../supabase/rls.sql')
  const rlsSQL = fs.readFileSync(rlsPath, 'utf8')
  console.log(rlsSQL)
  console.log()
  console.log('═════════════════════════════════════════════════')
}

setupTables()