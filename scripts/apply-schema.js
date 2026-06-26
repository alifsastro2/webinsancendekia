#!/usr/bin/env node

/**
 * Script untuk apply database schema ke Supabase
 * Jalankan di Supabase SQL Editor
 */

const fs = require('fs')
const path = require('path')

// Read the Schema SQL file
const schemaPath = path.join(__dirname, '../supabase/schema.sql')
const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

console.log('========================================')
console.log('Database Schema SQL Script')
console.log('========================================')
console.log()
console.log('📋 Cara menjalankan:')
console.log('1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/pdmxtuptrjdugvrczooq')
console.log('2. Masuk ke SQL Editor')
console.log('3. Create New Query')
console.log('4. Copy & paste SQL di bawah ini')
console.log('5. Click Run')
console.log()
console.log('⚠️  JALANKAN INI TERLEBIH DAHULU sebelum RLS!')
console.log()
console.log('========================================')
console.log('Schema SQL:')
console.log('========================================')
console.log(schemaSQL)