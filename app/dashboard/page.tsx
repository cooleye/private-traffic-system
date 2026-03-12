'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import UserMenu from '@/components/layout/UserMenu'

interface Link {
  id: string
  platform: string
  shortCode: string
  targetValue: string
  clickCount: number
  status: string
  createdAt: string
}

interface Stats {
  totalVisits: number
  totalLinks: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>([])
  const [stats, setStats] = useState<Stats>({ totalVisits: 0, totalLinks: 0 })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchData(token)
  }, [router])

  const fetchData = async (token: string) => {
    try {
      // 获取链接列表
      const linksRes = await fetch('/api/links', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!linksRes.ok) {
        if (linksRes.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('获取失败')
      }

      const linksData = await linksRes.json()
      setLinks(linksData.links)

      // 获取统计数据
      const statsRes = await fetch('/api/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('确定要删除这个短链接吗？此操作不可恢复。')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/links/manage/${linkId}?t=${Date.now()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        // 从列表中移除
        setLinks(links.filter(link => link.id !== linkId))
        // 更新统计
        setStats(prev => ({
          ...prev,
          totalLinks: prev.totalLinks - 1
        }))
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">私域引流管理系统</h1>
          <div className="flex items-center gap-4">
            {user && (
              <UserMenu 
                user={user} 
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">总访问量</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalVisits}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">短链接数</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalLinks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">今日访问</p>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">我的短链接</h2>
          <div className="flex gap-3">
            <Link href="/dashboard/templates">
              <Button variant="outline">📋 模板库</Button>
            </Link>
            <Link href="/dashboard/statistics">
              <Button variant="outline">📊 数据统计</Button>
            </Link>
            <Link href="/dashboard/links/create">
              <Button className="bg-purple-600 hover:bg-purple-700">创建短链接</Button>
            </Link>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">还没有创建短链接</p>
            <Link href="/dashboard/links/create">
              <Button className="bg-purple-600 hover:bg-purple-700">创建第一个短链接</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">平台</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">短链接</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">目标</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">点击</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">创建时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{link.platform}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <a 
                        href={`/l/${link.shortCode}`} 
                        target="_blank"
                        className="text-purple-600 hover:underline"
                      >
                        {link.shortCode}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap max-w-[150px] truncate">{link.targetValue}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{link.clickCount}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${link.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {link.status === 'ACTIVE' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/links/${link.id}/edit`}>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            编辑
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(link.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
