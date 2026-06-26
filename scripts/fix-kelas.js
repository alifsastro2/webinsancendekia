import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('Connecting to Supabase...')

  // Delete all existing kelas
  console.log('Clearing existing kelas...')
  const { error: deleteError } = await supabase.from('kelas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) {
    console.error('Error deleting kelas:', deleteError)
  } else {
    console.log('✓ Deleted all kelas')
  }

  // Check current kelas
  const { data: kelasData } = await supabase.from('kelas').select('*')
  console.log('Current kelas:', kelasData)

  // Insert new kelas
  console.log('\nInserting new kelas...')
  const newKelas = [
    { nama: 'X IPA 1' },
    { nama: 'X IPA 2' },
    { nama: 'X IPS 1' },
    { nama: 'XI IPA 1' },
    { nama: 'XI IPA 2' },
    { nama: 'XI IPS 1' },
    { nama: 'XII IPA 1' },
    { nama: 'XII IPA 2' },
    { nama: 'XII IPS 1' },
  ]

  const { data, error } = await supabase.from('kelas').insert(newKelas).select()

  if (error) {
    console.error('Error inserting kelas:', error)
  } else {
    console.log('✓ Inserted kelas:', data)
  }

  // Verify final state
  const { data: finalData } = await supabase.from('kelas').select('*').order('nama')
  console.log('\nFinal kelas list:')
  console.table(finalData)
}

main()
