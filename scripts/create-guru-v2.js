import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  console.log('Creating guru user...\n')

  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'azka@sekolah.test',
    password: 'Azka123456',
    email_confirm: true,
    user_metadata: {
      username: 'azka',
      nama: 'Azka Muhamad Naufal',
      role: 'guru'
    }
  })

  if (authError) {
    console.error('Auth error:', authError)
    return
  }

  console.log('Auth user created:', authData.user?.id)

  // Then insert to users table
  const { error: insertError } = await supabase.from('users').insert({
    id: authData.user?.id,
    username: 'azka',
    nama: 'Azka Muhamad Naufal',
    email: 'azka@sekolah.test',
    role: 'guru',
    is_active: true
  })

  if (insertError) {
    console.error('Insert error:', insertError)
  } else {
    console.log('User inserted to database!')
    console.log('\nLogin credentials:')
    console.log('  Username: azka')
    console.log('  Password: Azka123456')
  }

  // Verify
  const { data: users } = await supabase.from('users').select('*')
  console.log('\nAll users:', users)
}

main()
