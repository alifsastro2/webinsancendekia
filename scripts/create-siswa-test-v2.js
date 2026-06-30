/**
 * Script untuk membuat akun siswa test
 * Jalankan: node scripts/create-siswa-test.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function createTestStudents() {
  const students = [
    { username: 'alif.zidane', nama: 'Alif Zidane', password: 'Siswa123456' },
    { username: 'budi.santoso', nama: 'Budi Santoso', password: 'Siswa123456' },
    { username: 'citra.dewi', nama: 'Citra Dewi', password: 'Siswa123456' },
    { username: 'doni.purnama', nama: 'Doni Purnama', password: 'Siswa123456' },
  ]

  console.log('Creating test students...\n')

  for (const student of students) {
    try {
      const email = `${student.username}@insancendekia.com`

      // Check if user already exists in auth
      const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers()
      const authUser = existingAuth?.users.find(u => u.email === email)

      if (authUser) {
        console.log(`⚠️  ${student.username} - Auth user already exists, skipping...`)
        continue
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: student.password,
        email_confirm: true,
        user_metadata: {
          username: student.username,
          nama: student.nama,
          role: 'siswa',
        }
      })

      if (authError) {
        console.error(`❌ ${student.username} - Auth error:`, authError.message)
        continue
      }

      console.log(`✅ ${student.username} - Created successfully!`)
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${student.password}\n`)
    } catch (error) {
      console.error(`❌ ${student.username} - Error:`, error.message)
    }
  }

  console.log('\nDone!')
}

createTestStudents()
