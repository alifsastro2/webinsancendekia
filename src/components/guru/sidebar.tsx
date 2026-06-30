'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Settings,
  Home,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/guru', color: 'red' },
  { icon: Users, label: 'Kelola siswa', href: '/guru/siswa', color: 'green' },
  { icon: BookOpen, label: 'Mata Pelajaran', href: '/guru/matapelajaran', color: 'amber' },
  { icon: Settings, label: 'Pengaturan', href: '/guru/settings', color: 'blue' },
]

export default function GuruSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex fixed left-0 top-16 bottom-0 w-72 flex-col bg-white border-r border-gray-200 z-40 overflow-y-auto">
      <SidebarContent pathname={pathname} />
    </div>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(data)
      }
    }
    getUserInfo()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div>
          <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            {user?.nama || 'Guru'}
          </h2>
          <p className="text-xs text-gray-500 hidden lg:block">@{user?.username || '...'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const colorMap: Record<string, { bg: string, hover: string, text: string }> = {
            red: { bg: 'bg-red-500', hover: 'hover:bg-red-50', text: 'text-red-500' },
            green: { bg: 'bg-green-500', hover: 'hover:bg-green-50', text: 'text-green-500' },
            amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-50', text: 'text-amber-500' },
            blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-50', text: 'text-blue-500' },
          }
          const colors = colorMap[item.color]

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4, backgroundColor: isActive ? undefined : '#fef2f2' }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? `${colors.bg} text-white shadow-lg`
                    : `text-gray-700 ${colors.hover}`
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className={`absolute inset-0 ${colors.bg}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-white' : colors.text}`} />
                <span className="font-medium relative z-10 text-sm lg:text-base">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 lg:p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="w-full">
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm lg:text-base">Keluar</span>
          </motion.div>
        </button>
      </div>


    </>
  )
}
