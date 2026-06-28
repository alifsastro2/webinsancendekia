import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'Missing userId or password' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      }
    )

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.error('Reset password API error:', res.status, data)
      return NextResponse.json(
        { error: data.msg || data.error || 'Gagal mereset password' },
        { status: res.status }
      )
    }

    // Also confirm email so user can login
    await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_confirm: true }),
      }
    ).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset password API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal mereset password' },
      { status: 500 }
    )
  }
}
