'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Settings, Menu, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User as UserType } from '@/lib/types'
import Logo from './logo'

interface HeaderProps {
  role: 'guru' | 'siswa'
}

export default function Header({ role }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getUserInfo()
  }, [])

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = user?.nama
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-3 lg:px-4 py-2 lg:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          <Logo size="sm" showName={false} />
          <div className="hidden sm:block">
            <h1 className="text-sm lg:text-base font-semibold text-blue-700">Insan Cendekia Nusantara</h1>
            <p className="text-xs text-gray-500 capitalize hidden lg:block">{role === 'guru' ? 'Dashboard Guru' : 'Dashboard Siswa'}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="relative h-9 w-9 lg:h-10 lg:w-10 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs lg:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 lg:w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium text-sm">{user?.nama}</p>
                <p className="text-xs text-gray-500">@{user?.username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${role}/settings`)}>
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}