'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/header'
import GuruSidebar from '@/components/guru/sidebar'
import MobileBottomNav from '@/components/guru/mobile-bottom-nav'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userData?.role !== 'guru') {
      router.push(userData?.role === 'siswa' ? '/siswa' : '/login')
      return
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* Header - always visible */}
      <Header role="guru" />

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 z-40 overflow-y-auto">
          <GuruSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 lg:ml-72 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}