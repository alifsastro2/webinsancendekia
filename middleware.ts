import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Routes yang TIDAK memerlukan autentikasi (public routes)
 * User yang belum login BOLEH mengakses routes ini
 */
const PUBLIC_ROUTES = [
  '/login',
  '/register',
]

/**
 * Routes yang hanya bisa diakses oleh GURU
 */
const GURU_ROUTES = [
  '/guru',
]

/**
 * Routes yang hanya bisa diakses oleh SISWA
 */
const SISWA_ROUTES = [
  '/siswa',
]

/**
 * Ekstensi file yang tidak perlu diproses (static files)
 */
const PUBLIC_PATHS = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/api/public',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ========================================
  // 1. Skip static files & public paths
  // ========================================
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    return NextResponse.next()
  }

  // ========================================
  // 2. Skip public routes (login, register)
  // ========================================
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
  if (isPublicRoute) {
    // Jika sudah login, redirect ke dashboard sesuai role
    const { supabase, response } = await updateSession(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Cek role user
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = userData?.role

      // Redirect sesuai role
      if (role === 'guru') {
        return NextResponse.redirect(new URL('/guru', request.url))
      } else {
        return NextResponse.redirect(new URL('/siswa', request.url))
      }
    }

    return response
  }

  // ========================================
  // 3. Update session (refresh token if needed)
  // ========================================
  const { supabase, response } = await updateSession(request)

  // ========================================
  // 4. Check authentication
  // ========================================
  const { data: { user } } = await supabase.auth.getUser()

  // Jika tidak ada user (belum login), redirect ke login
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ========================================
  // 5. Get user role from database
  // ========================================
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = userData?.role

  // ========================================
  // 6. Check role-based access
  // ========================================

  // Cek apakah route untuk GURU
  const isGuruRoute = GURU_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Cek apakah route untuk SISWA
  const isSiswaRoute = SISWA_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Jika akses route GURU tapi role bukan guru
  if (isGuruRoute && userRole !== 'guru') {
    // Redirect ke halaman yang sesuai dengan role
    if (userRole === 'siswa') {
      return NextResponse.redirect(new URL('/siswa', request.url))
    }
    // Jika role tidak dikenal, logout dan redirect ke login
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika akses route SISWA tapi role bukan siswa
  if (isSiswaRoute && userRole !== 'siswa') {
    // Redirect ke halaman yang sesuai dengan role
    if (userRole === 'guru') {
      return NextResponse.redirect(new URL('/guru', request.url))
    }
    // Jika role tidak dikenal, logout dan redirect ke login
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ========================================
  // 7. User authenticated & authorized
  // ========================================
  return response
}

/**
 * Configure which routes should trigger this middleware
 * Semua route akan diproses oleh middleware ini
 */
export const config = {
  matcher: [
    /*
     * Match semua request route KECUALI:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
