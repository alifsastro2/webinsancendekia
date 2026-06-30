'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ClipboardList,
  User as UserIcon,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'

const menuItems = [
  { icon: GraduationCap, label: 'Dashboard', href: '/siswa', color: 'green' },
  { icon: BookOpen, label: 'Mata Pelajaran', href: '/siswa/matapelajaran', color: 'amber' },
  { icon: ClipboardList, label: 'Kuis Saya', href: '/siswa/kuis', color: 'purple' },
  { icon: UserIcon, label: 'Profil', href: '/siswa/profil', color: 'cyan' },
]

export default function SiswaSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [kelas, setKelas] = useState<string | null>(null)

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

        if (data?.kelas_id) {
          const { data: kelasData } = await supabase
            .from('kelas')
            .select('nama')
            .eq('id', data.kelas_id)
            .single()
          setKelas(kelasData?.nama || null)
        }
      }
    }
    getUserInfo()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="hidden lg:flex w-64 bg-white border-r h-screen sticky top-0 flex-col"
    >
      <div className="p-6 border-b">
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            {user?.nama || 'Siswa'}
          </h2>
            <p className="text-xs text-gray-500">{kelas || '...'}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const colorMap: Record<string, { bg: string, hover: string, text: string }> = {
            green: { bg: 'bg-green-500', hover: 'hover:bg-green-50', text: 'text-green-500' },
            amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-50', text: 'text-amber-500' },
            purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-50', text: 'text-purple-500' },
            cyan: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-50', text: 'text-cyan-500' },
          }
          const colors = colorMap[item.color]

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? `${colors.bg} text-white shadow-lg`
                    : `text-gray-700 ${colors.hover}`
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? 'text-white' : colors.text)} />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button onClick={handleLogout} className="w-full">
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Keluar</span>
          </motion.div>
        </button>
      </div>
    </motion.aside>
  )
}
