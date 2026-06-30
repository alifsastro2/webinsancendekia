require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function resetPassword() {
  try {
    // First get user ID from public.users table
    const email = 'alif.zidane@insancendekia.com'
    const newPassword = 'Alif123456'

    // Get user ID
    const userId = 'ff66c3ff-0340-434d-b446-c4fdb25b170f' // dari hasil query sebelumnya

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw error

    console.log('✅ Password berhasil di-reset!')
    console.log('📧 Email:', email)
    console.log('🔑 Password baru:', newPassword)
  } catch (error) {
    console.error('❌ Gagal reset password:', error.message)
  }
}

resetPassword()
