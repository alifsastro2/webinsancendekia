const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

async function main() {
  console.log('👤 Creating guru user...')

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'azka@sekolah.test',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        username: 'azka',
        nama: 'Azka Muhamad Naufal',
        role: 'guru'
      }
    })
  })

  const data = await res.json()

  if (res.ok) {
    console.log('✅ User created successfully!')
    console.log('📧 Email: azka@sekolah.test')
    console.log('🔑 Password: 123456')
    console.log('User ID:', data.id)
  } else {
    console.log('❌ Error:', data)
  }
}

main()