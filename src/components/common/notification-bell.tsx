'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, GraduationCap, ClipboardCheck, Clock, FileText, PenLine } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/lib/types'

interface NotificationBellProps {
  className?: string
  role?: 'guru' | 'siswa'
}

export default function NotificationBell({ className = '', role = 'siswa' }: NotificationBellProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data as Notification[])
        setUnreadCount((data as Notification[]).filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const checkDeadlines = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: userData } = await supabase
        .from('users')
        .select('kelas_id')
        .eq('id', session.user.id)
        .single()
      if (!userData?.kelas_id) return

      const { data: mapels } = await supabase
        .from('mata_pelajaran')
        .select('id')
        .eq('kelas_id', userData.kelas_id)
      if (!mapels?.length) return

      const mapelIds = mapels.map((m: { id: string }) => m.id)
      const now = new Date()
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const { data: deadlineKuis } = await supabase
        .from('kuis')
        .select('id, judul, mata_pelajaran_id')
        .in('mata_pelajaran_id', mapelIds)
        .gte('due_date', now.toISOString())
        .lte('due_date', in24h.toISOString())
        .eq('published', true)

      if (!deadlineKuis?.length) return

      const { data: existing } = await supabase
        .from('notifications')
        .select('link')
        .eq('user_id', session.user.id)
        .eq('type', 'quiz_deadline_soon')

      const existingLinks = new Set((existing || []).map((n: { link: string }) => n.link))

      const newOnes = deadlineKuis
        .filter((k: { id: string; mata_pelajaran_id: string }) => {
          const link = `/siswa/matapelajaran/${k.mata_pelajaran_id}/kuis/${k.id}`
          return !existingLinks.has(link)
        })
        .map((k: { id: string; mata_pelajaran_id: string; judul: string }) => ({
          user_id: session.user.id,
          type: 'quiz_deadline_soon',
          title: `Kuis "${k.judul}" deadline kurang dari 24 jam!`,
          link: `/siswa/matapelajaran/${k.mata_pelajaran_id}/kuis/${k.id}`
        }))

      if (newOnes.length > 0) {
        await supabase.from('notifications').insert(newOnes)
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error checking deadlines:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Check deadlines only for siswa
    if (role === 'siswa') {
      checkDeadlines()
    }
  }, [role])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (notif: Notification) => {
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    if (notif.link) {
      setOpen(false)
      router.push(notif.link)
    }
  }

  const markAllRead = async () => {
    try {
      const ids = notifications.filter(n => !n.is_read).map(n => n.id)
      if (!ids.length) return
      await supabase.from('notifications').update({ is_read: true }).in('id', ids)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz_published': return <GraduationCap className="h-5 w-5 text-blue-500" />
      case 'quiz_graded': return <ClipboardCheck className="h-5 w-5 text-green-500" />
      case 'quiz_deadline_soon': return <Clock className="h-5 w-5 text-amber-500" />
      case 'materi_published': return <FileText className="h-5 w-5 text-purple-500" />
      case 'essay_submitted': return <PenLine className="h-5 w-5 text-orange-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Notifikasi</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!notifications.length ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      !notif.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
