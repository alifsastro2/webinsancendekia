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
  { icon: Home, label: 'Dashboard', href: '/guru', color: 'red' },
  { icon: BookOpen, label: 'Mapel', href: '/guru/matapelajaran', color: 'amber' },
  { icon: Users, label: 'Siswa', href: '/guru/siswa', color: 'green' },
  { icon: Settings, label: 'Settings', href: '/guru/settings', color: 'blue' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white border-t border-gray-200 lg:hidden safe-area-inset-bottom"
    >
      <nav className="flex items-center justify-around py-2 px-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/guru' && pathname.startsWith(item.href))
          const Icon = item.icon
          const colorMap: Record<string, { bg: string, text: string }> = {
            red: { bg: 'bg-red-100 text-red-600', text: 'text-red-600' },
            green: { bg: 'bg-green-100 text-green-600', text: 'text-green-600' },
            amber: { bg: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
            blue: { bg: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
          }
          const colors = colorMap[item.color] || colorMap.red

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors min-h-[56px] justify-center",
                  isActive ? colors.bg : "text-gray-500"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl transition-all",
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  isActive ? colors.text : ""
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