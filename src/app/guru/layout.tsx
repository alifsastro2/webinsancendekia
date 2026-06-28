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
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-green-50">
      {/* Header - always visible */}
      <Header role="guru" />

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        <GuruSidebar />
        <main className="flex-1 lg:ml-72 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}