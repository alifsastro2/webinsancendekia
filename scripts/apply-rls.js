#!/usr/bin/env node

/**
 * Script untuk apply RLS policies ke Supabase
 * Jalankan di Supabase SQL Editor atau gunakan service role key
 */

const fs = require('fs')
const path = require('path')

// Read the RLS SQL file
const rlsPath = path.join(__dirname, '../supabase/rls.sql')
const rlsSQL = fs.readFileSync(rlsPath, 'utf8')

console.log('========================================')
console.log('RLS Policies SQL Script')
console.log('========================================')
console.log()
console.log('📋 Cara menjalankan:')
console.log('1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/pdmxtuptrjdugvrczooq')
console.log('2. Masuk ke SQL Editor')
console.log('3. Create New Query')
console.log('4. Copy & paste SQL di bawah ini')
console.log('5. Click Run')
console.log()
console.log('========================================')
console.log('RLS Policies SQL:')
console.log('========================================')
console.log(rlsSQL)