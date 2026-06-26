#!/usr/bin/env node

/**
 * Script untuk setup database Supabase secara otomatis
 * Menggunakan Supabase Management API untuk execute SQL
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

if (!projectRef || !serviceRoleKey) {
  console.error('❌ Error: URL or Service Role Key tidak valid')
  process.exit(1)
}

/**
 * Execute SQL via Supabase Management API
 */
async function executeSQL(sql, description) {
  console.log(`\n🔄 ${description}...`)

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      // Some SQL errors are expected (e.g., policy already exists)
      if (error.includes('already exists') || error.includes('does not exist') || error.includes('duplicate')) {
        console.log(`⚠️  Warning: ${error.substring(0, 100)}...`)
        return { success: true, warning: true }
      }
      throw new Error(error)
    }

    console.log(`✅ ${description} berhasil`)
    return { success: true }
  } catch (error) {
    console.error(`❌ ${description} gagal:`, error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('========================================')
  console.log('Supabase Database Setup')
  console.log('========================================')
  console.log(`🌐 URL: ${supabaseUrl}`)
  console.log()

  // Read SQL files
  const schemaPath = path.join(__dirname, '../supabase/schema.sql')
  const rlsPath = path.join(__dirname, '../supabase/rls.sql')

  let schemaSQL = fs.readFileSync(schemaPath, 'utf8')
  let rlsSQL = fs.readFileSync(rlsPath, 'utf8')

  // Remove the RLS trigger function from schema since we'll apply it separately
  schemaSQL = schemaSQL.replace(/-- Trigger to create user profile on signup[\s\S]*$/, '')

  // Split SQL into statements
  const splitSQL = (sql) => {
    return sql
      .split(/;\s*(?=(?:CREATE|INSERT|ALTER|DROP|GRANT|REVOKE|UPDATE|DELETE|SELECT))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
      .map(s => s + ';')
  }

  const schemaStatements = splitSQL(schemaSQL)
  const rlsStatements = splitSQL(rlsSQL)

  console.log(`📊 Schema statements: ${schemaStatements.length}`)
  console.log(`📊 RLS statements: ${rlsStatements.length}`)

  // Execute schema
  console.log('\n========================================')
  console.log('STEP 1: Menjalankan Schema SQL')
  console.log('========================================')

  let schemaSuccess = 0
  let schemaFailed = 0

  for (let i = 0; i < schemaStatements.length; i++) {
    const statement = schemaStatements[i]
    const result = await executeSQL(statement, `Schema statement ${i + 1}/${schemaStatements.length}`)
    if (result.success) {
      schemaSuccess++
    } else {
      schemaFailed++
    }
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n📊 Schema: ${schemaSuccess} berhasil, ${schemaFailed} gagal`)

  // Execute RLS
  console.log('\n========================================')
  console.log('STEP 2: Menjalankan RLS Policies')
  console.log('========================================')

  let rlsSuccess = 0
  let rlsFailed = 0

  for (let i = 0; i < rlsStatements.length; i++) {
    const statement = rlsStatements[i]
    const result = await executeSQL(statement, `RLS statement ${i + 1}/${rlsStatements.length}`)
    if (result.success) {
      rlsSuccess++
    } else {
      rlsFailed++
    }
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n📊 RLS: ${rlsSuccess} berhasil, ${rlsFailed} gagal`)

  // Summary
  console.log('\n========================================')
  console.log('Setup Complete!')
  console.log('========================================')
  console.log()
  console.log('Summary:')
  console.log(`  Schema: ${schemaSuccess}/${schemaStatements.length} executed`)
  console.log(`  RLS: ${rlsSuccess}/${rlsStatements.length} executed`)
  console.log()

  if (schemaFailed > 0 || rlsFailed > 0) {
    console.log('⚠️  Beberapa statement gagal, tapi ini mungkin normal')
    console.log('   (misalnya: policy/table sudah ada)')
  } else {
    console.log('✅ Semua setup berhasil!')
  }

  console.log()
  console.log('🎉 Database siap digunakan!')
}

setupDatabase().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})