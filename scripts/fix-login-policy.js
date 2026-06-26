#!/usr/bin/env node

const { Pool } = require('pg')

const connectionString = 'postgresql://postgres:insancendekianusantara@db.pdmxtuptrjdugvrczooq.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  console.log('🔧 Fixing RLS policy for login...\n')

  try {
    // Drop existing policies
    await pool.query(`DROP POLICY IF EXISTS "Login lookup by username" ON public.users`)

    // Create new policy for login - allow anyone to search by username and get email for login
    await pool.query(`
      CREATE POLICY "Login lookup by username"
      ON public.users FOR SELECT
      TO anon, authenticated
      USING (
        -- Allow searching by username
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.username = public.users.username
          AND u.is_active = true
        )
      );
    `)

    console.log('✅ RLS policy for login fixed!')
    console.log('\n📋 New Policy Details:')
    console.log('  - Policy Name: Login lookup by username')
    console.log('  - Allowed roles: anon, authenticated')
    console.log('  - Allow: SELECT for active users only')

    // Test the policy
    console.log('\n🧪 Testing policy...')
    const testResult = await pool.query(`
      SELECT username, nama, role, is_active
      FROM public.users
      WHERE username = 'azka'
    `)

    if (testResult.rows.length > 0) {
      const user = testResult.rows[0]
      console.log('✅ Policy test successful!')
      console.log(`  Found: ${user.nama} (@${user.username})`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Active: ${user.is_active}`)
    } else {
      console.log('❌ Policy test failed - no user found')
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()