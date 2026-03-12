'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Link {
  id: string
  platform: string
  shortCode: string
  targetValue: string
  clickCount: number
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
            <span className="text-gray-600">{user?.name || user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>退出</Button>
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
          <Link href="/dashboard/links/create">
            <Button className="bg-purple-600 hover:bg-purple-700">创建短链接</Button>
          </Link>
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">创建时间</th>
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
                      {new Date(link.createdAt).toLocaleDateString()}
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
