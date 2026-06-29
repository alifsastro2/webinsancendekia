import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { nama, username, password } = await req.json()

    if (!nama || !username || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    const usernameLower = username.toLowerCase()

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', usernameLower)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    const email = `${usernameLower}@insancendekia.com`

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: usernameLower,
        nama,
        role: 'guru',
      },
    })

    if (authError) throw authError

    return NextResponse.json({ success: true, user: authData.user })
  } catch (e: any) {
    console.error('Register error:', e)
    return NextResponse.json({ error: e.message || 'Gagal mendaftar' }, { status: 500 })
  }
}
