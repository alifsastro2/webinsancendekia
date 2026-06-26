const supabaseUrl = 'https://pdmxtuptrjdugvrczooq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbXh0dXB0cmpkdWd2cmN6b29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwMDQzMiwiZXhwIjoyMDk3Nzc2NDMyfQ.69b3veBp16ad2bL104lHh5B0WbvfwLcMBP7KR7WpTGM'

async function main() {
  console.log('🧹 Cleaning up...')

  // Delete all murid from auth
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'GET',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    }
  })

  const users = await listRes.json()
  const murids = users.users?.filter(u =>
    u.user_metadata?.role === 'murid' ||
    u.email?.includes('murid.test')
  ) || []

  console.log(`Found ${murids.length} murid users to delete`)

  for (const user of murids) {
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    })
    console.log(`✅ Deleted: ${user.email}`)
  }

  // Delete murid profiles
  await fetch(`${supabaseUrl}/rest/v1/users?role=eq.murid`, {
    method: 'DELETE',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    }
  })

  console.log('✅ Murid profiles deleted')

  // Create guru user (direct insert without trigger)
  console.log('👤 Creating guru user...')

  const guruId = crypto.randomUUID()

  // Insert into auth.users
  const authRes = await fetch(`${supabaseUrl}/rest/v1/auth_users`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: guruId,
      email: 'azka@sekolah.test',
      encrypted_password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      email_confirmed_at: new Date().toISOString(),
      raw_user_meta_data: {
        username: 'azka',
        nama: 'Azka Muhamad Naufal',
        role: 'guru'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  })

  console.log('Auth insert:', await authRes.json())

  // Insert into public.users
  const publicRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: guruId,
      username: 'azka',
      nama: 'Azka Muhamad Naufal',
      email: 'azka@sekolah.test',
      role: 'guru',
      is_active: true
    })
  })

  console.log('Public insert:', await publicRes.json())
  console.log('✅ Done! Email: azka@sekolah.test, Password: 123456')
}

main()