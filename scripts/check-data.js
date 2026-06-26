import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  console.log('=== Checking Murid Data ===\n')

  // Check users with role murid
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'murid')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${users?.length || 0} users with role 'murid':`)
    console.table(users)
  }

  // Check all users
  const { data: allUsers } = await supabase.from('users').select('*')
  console.log(`\nTotal users in database: ${allUsers?.length || 0}`)
  console.table(allUsers)

  // Check kelas
  const { data: kelas } = await supabase.from('kelas').select('*').order('nama')
  console.log('\nKelas:')
  console.table(kelas)
}

main()
