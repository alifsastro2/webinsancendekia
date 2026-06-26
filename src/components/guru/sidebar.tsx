'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Users,
  BookOpen,
  Settings,
  Home,
  X,
  Menu,
  Layers,
  LogOut,
  School
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/guru' },
  { icon: Users, label: 'Kelola siswa', href: '/guru/siswa' },
  { icon: BookOpen, label: 'Mata Pelajaran', href: '/guru/matapelajaran' },
  { icon: Settings, label: 'Pengaturan', href: '/guru/settings' },
]

export default function GuruSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-50 w-12 h-12 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              <SidebarContent pathname={pathname} onClose={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 min-h-screen flex-col bg-white border-r border-gray-200">
        <SidebarContent pathname={pathname} onClose={() => {}} />
      </div>
    </>
  )
}

function SidebarContent({ pathname, onClose }: { pathname: string, onClose: () => void }) {
  return (
    <>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <School className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-red-600">
                Portal Guru
              </h2>
              <p className="text-xs text-gray-500 hidden lg:block">Insan Cendekia Nusantara</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
                    : "text-gray-700 hover:bg-red-50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-red-600"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5 relative z-10" />
                <span className="font-medium relative z-10 text-sm lg:text-base">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 lg:p-4 border-t border-gray-100">
        <Link href="/login" onClick={onClose}>
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm lg:text-base">Keluar</span>
          </motion.div>
        </Link>
      </div>

      {/* Bottom decoration */}
      <div className="p-3 lg:p-4 border-t border-gray-100 hidden lg:block">
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Tips hari ini</p>
          <p className="text-xs text-gray-500">Buat kuis interaktif untuk meningkatkan partisipasi siswa.</p>
        </div>
      </div>
    </>
  )
}