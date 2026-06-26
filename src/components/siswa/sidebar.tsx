'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FileText,
  ClipboardList,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: GraduationCap, label: 'Dashboard', href: '/siswa' },
  { icon: BookOpen, label: 'Mata Pelajaran', href: '/siswa/matapelajaran' },
  { icon: ClipboardList, label: 'Kuis Saya', href: '/siswa/kuis' },
  { icon: User, label: 'Profil', href: '/siswa/profil' },
]

export default function siswaSidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col"
    >
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-green-600">
          Portal Siswa
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-green-50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-white")} />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/login">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Keluar</span>
          </motion.button>
        </Link>
      </div>
    </motion.aside>
  )
}
