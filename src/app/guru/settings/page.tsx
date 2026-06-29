'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Save, Settings as SettingsIcon, Layers, Users, Edit, Trash2, Plus, X, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface User {
  id: string
  nama: string
  username: string
  email: string | null
  is_active: boolean
}

interface Kelas {
  id: string
  nama: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [kelas, setKelas] = useState<(Kelas & { created_by?: string })[]>([])
  const [loadingKelas, setLoadingKelas] = useState(true)
  const [formData, setFormData] = useState({ nama: '', username: '', email: '' })
  const [newKelas, setNewKelas] = useState('')
  const [editingKelas, setEditingKelas] = useState<string | null>(null)
  const [editKelasName, setEditKelasName] = useState('')

  useEffect(() => {
    fetchUser()
    fetchKelas()
  }, [])

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (data) {
        setUser(data)
        setFormData({ nama: data.nama, username: data.username, email: data.email || '' })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchKelas = async () => {
    try {
      const { data } = await supabase.from('kelas').select('*').order('nama')
      if (data) setKelas(data)
    } catch (e) { console.error(e) }
    finally { setLoadingKelas(false) }
  }

  const handleSave = async () => {
    if (!formData.nama || !formData.username) return toast.error('Nama dan username wajib diisi')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi tidak valid')
      const { error } = await supabase.from('users').update(formData).eq('id', session.user.id)
      if (error) throw error
      toast.success('Profil berhasil diupdate')
      fetchUser()
    } catch (e: any) { toast.error(e.message || 'Terjadi kesalahan') }
    finally { setSaving(false) }
  }

  const handleAddKelas = async () => {
    if (!newKelas.trim()) return toast.error('Nama kelas wajib diisi')

    const kelasName = newKelas.trim().toUpperCase()

    // Cek apakah nama kelas sudah ada
    const { data: existing } = await supabase
      .from('kelas')
      .select('id')
      .eq('nama', kelasName)
      .maybeSingle()

    if (existing) {
      return toast.error(`Kelas "${kelasName}" sudah ada`)
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return toast.error('Sesi tidak valid')
      const { error } = await supabase.from('kelas').insert({ nama: kelasName, created_by: session.user.id })
      if (error) throw error
      toast.success('Kelas ditambahkan')
      setNewKelas('')
      fetchKelas()
    } catch (e: any) { toast.error(e.message || 'Terjadi kesalahan') }
  }

  const handleUpdateKelas = async (id: string, createdBy?: string | null) => {
    if (!editKelasName.trim()) return toast.error('Nama kelas wajib diisi')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return toast.error('Sesi tidak valid')
    if (createdBy && createdBy !== session.user.id) {
      return toast.error('Anda tidak memiliki izin untuk mengedit kelas ini')
    }

    const kelasName = editKelasName.trim().toUpperCase()

    // Cek apakah nama kelas sudah ada (kecuali kelas yang sedang diedit)
    const { data: existing } = await supabase
      .from('kelas')
      .select('id')
      .eq('nama', kelasName)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return toast.error(`Kelas "${kelasName}" sudah ada`)
    }

    try {
      const { error } = await supabase.from('kelas').update({ nama: kelasName }).eq('id', id)
      if (error) throw error
      toast.success('Kelas diupdate')
      setEditingKelas(null)
      fetchKelas()
    } catch (e: any) { toast.error(e.message || 'Terjadi kesalahan') }
  }

  const handleDeleteKelas = async (id: string, createdBy?: string | null) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return toast.error('Sesi tidak valid')
    if (createdBy && createdBy !== session.user.id) {
      return toast.error('Anda tidak memiliki izin untuk menghapus kelas ini')
    }

    // Cek apakah kelas masih dipakai oleh mata_pelajaran atau siswa
    const { data: refs } = await supabase.rpc('count_kelas_references', { p_kelas_id: id })
    if (refs) {
      const mapelRef = refs.find((r: { table_name: string, count: number }) => r.table_name === 'mata_pelajaran')
      const siswaRef = refs.find((r: { table_name: string, count: number }) => r.table_name === 'users')
      if (mapelRef && mapelRef.count > 0) {
        return toast.error(`Kelas tidak bisa dihapus — masih digunakan oleh ${mapelRef.count} mata pelajaran`)
      }
      if (siswaRef && siswaRef.count > 0) {
        return toast.error(`Kelas tidak bisa dihapus — masih memiliki ${siswaRef.count} siswa`)
      }
    }

    if (!confirm('Yakin hapus kelas ini?')) return
    try {
      await supabase.from('kelas').delete().eq('id', id)
      toast.success('Kelas dihapus')
      fetchKelas()
    } catch { toast.error('Gagal hapus kelas') }
  }

  if (loading) return (
    <div className="p-4 lg:p-6 xl:p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-12 w-48 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-gray-500">Kelola akun dan referensi</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profil">
            <Users className="h-4 w-4 mr-2" /> Profil
          </TabsTrigger>
          <TabsTrigger value="referensi">
            <Layers className="h-4 w-4 mr-2" /> Referensi
          </TabsTrigger>
        </TabsList>

        {/* Tab Profil */}
        <TabsContent value="profil" className="space-y-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Informasi Profil</CardTitle>
                  <p className="text-sm text-gray-500">Kelola data diri Anda</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{user?.nama}</h3>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="mt-2" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="mt-2" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} disabled className="mt-2 bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-11 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Referensi */}
        <TabsContent value="referensi">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Daftar Kelas</CardTitle>
                  <p className="text-sm text-gray-500">Kelola kelas yang tersedia</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah kelas baru..."
                  value={newKelas}
                  onChange={(e) => setNewKelas(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKelas()}
                  className="flex-1"
                />
                <button
                  onClick={handleAddKelas}
                  className="h-11 px-5 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Tambah
                </button>
              </div>
              <Separator />
              {loadingKelas ? (
                <p className="text-center py-8 text-gray-500">Memuat...</p>
              ) : kelas.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Belum ada kelas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {kelas.map((k) => (
                    <div key={k.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                      {editingKelas === k.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editKelasName}
                            onChange={(e) => setEditKelasName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateKelas(k.id, k.created_by)}
                            autoFocus
                            className="h-8 text-sm"
                          />
                          <button onClick={() => handleUpdateKelas(k.id, k.created_by)} className="p-1.5 hover:bg-green-100 rounded-lg">
                            <Save className="h-4 w-4 text-green-600" />
                          </button>
                          <button onClick={() => setEditingKelas(null)} className="p-1.5 hover:bg-gray-200 rounded-lg">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{k.nama}</span>
                          </div>
                          {user && k.created_by === user.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <button className="inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none h-8 w-8 rounded-lg hover:bg-gray-200 transition-opacity" />
                                }
                              >
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => { setEditingKelas(k.id); setEditKelasName(k.nama) }} className="cursor-pointer">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteKelas(k.id, k.created_by)} className="cursor-pointer text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
