import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
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
        body: JSON.stringify({ email_confirm: true }),
      }
    )

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.error('Confirm email error:', res.status, data)
      return NextResponse.json(
        { error: data.msg || data.error || 'Gagal konfirmasi email' },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Confirm email API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal konfirmasi email' },
      { status: 500 }
    )
  }
}
