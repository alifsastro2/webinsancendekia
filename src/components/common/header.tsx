'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Settings } from 'lucide-react'
import NotificationBell from '@/components/common/notification-bell'
import { supabase } from '@/lib/supabase'
import { User as UserType } from '@/lib/types'
import Logo from '@/components/common/logo'

interface HeaderProps {
  role: 'guru' | 'siswa'
}

export default function Header({ role }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
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
    router.push('/login')
  }

  const initials = user?.nama
    ?.split(' ')
    ?.map((n: string) => n[0])
    ?.join('')
    ?.toUpperCase()
    ?.slice(0, 2) || '?'

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"
          >
            <Logo size="sm" showName={false} />
          </motion.div>

          <div className="hidden sm:block">
            <h1 className="font-bold text-gray-900">Insan Cendekia</h1>
            <p className="text-xs text-gray-500">{user?.nama || (role === 'guru' ? 'Guru' : 'Siswa')}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.nama || 'Memuat...'}</p>
                    <p className="text-xs text-gray-500">@{user?.username || '...'}</p>
                  </div>
                </motion.button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-2">
                  <p className="font-medium">{user?.nama}</p>
                  <p className="text-xs text-gray-500 font-normal">@{user?.username}</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={() => router.push(`/${role}/profil`)}
                className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="p-3 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
