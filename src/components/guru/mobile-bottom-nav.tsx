'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Users,
  BookOpen,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const bottomNavItems = [
  { icon: Home, label: 'Dashboard', href: '/guru' },
  { icon: BookOpen, label: 'Mapel', href: '/guru/matapelajaran' },
  { icon: Users, label: 'siswa', href: '/guru/siswa' },
  { icon: Settings, label: 'Settings', href: '/guru/settings' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden"
    >
      <nav className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive ? "bg-blue-100 text-blue-600" : "text-gray-500"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-blue-600" : "text-gray-500"
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