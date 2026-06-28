'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  ClipboardList,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

const bottomNavItems = [
  { icon: Home, label: 'Dashboard', href: '/siswa', color: 'green' },
  { icon: BookOpen, label: 'Mapel', href: '/siswa/matapelajaran', color: 'amber' },
  { icon: ClipboardList, label: 'Kuis', href: '/siswa/kuis', color: 'purple' },
  { icon: User, label: 'Profil', href: '/siswa/profil', color: 'cyan' },
]

export default function SiswaMobileBottomNav() {
  const pathname = usePathname()

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white border-t border-gray-200 lg:hidden"
    >
      <nav className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const colorMap: Record<string, { bg: string, text: string }> = {
            green: { bg: 'bg-green-100 text-green-600', text: 'text-green-600' },
            amber: { bg: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
            purple: { bg: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
            cyan: { bg: 'bg-cyan-100 text-cyan-600', text: 'text-cyan-600' },
          }
          const colors = colorMap[item.color] || colorMap.green

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive ? colors.bg : "text-gray-500"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? colors.text : "text-gray-500"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </motion.div>
  )
}
