'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import UserMenu from '@/components/layout/UserMenu'
import { useAuth } from '@/lib/useAuth'
import ExportMenu from '@/components/export/ExportMenu'

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

const platforms = [
  { value: '', label: '全部平台' },
  { value: 'DOUYIN', label: '抖音' },
  { value: 'XIAOHONGSHU', label: '小红书' },
  { value: 'KUAISHOU', label: '快手' },
  { value: 'WECHAT', label: '微信' },
  { value: 'QQ', label: 'QQ' },
  { value: 'WEIBO', label: '微博' },
  { value: 'BILIBILI', label: 'B站' },
]

const sortOptions = [
  { value: 'createdAt-desc', label: '最新创建' },
  { value: 'createdAt-asc', label: '最早创建' },
  { value: 'clickCount-desc', label: '点击量高' },
  { value: 'clickCount-asc', label: '点击量低' },
]

export default function DashboardPage() {
  const router = useRouter()
  useAuth() // 启用Token自动刷新
  const [links, setLinks] = useState<Link[]>([])
  const [stats, setStats] = useState<Stats>({ totalVisits: 0, totalLinks: 0 })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // 搜索筛选状态
  const [keyword, setKeyword] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('createdAt-desc')

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

  const fetchData = async (token: string, searchParams?: URLSearchParams) => {
    try {
      setLoading(true)
      
      // 构建查询参数
      const params = searchParams || new URLSearchParams()
      const url = `/api/links?${params.toString()}`
      
      // 获取链接列表
      const linksRes = await fetch(url, {
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

  // 执行搜索
  const handleSearch = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const params = new URLSearchParams()
    
    if (keyword) params.set('keyword', keyword)
    if (platform) params.set('platform', platform)
    if (status) params.set('status', status)
    
    const [sortField, sortOrder] = sortBy.split('-')
    params.set('sortBy', sortField)
    params.set('sortOrder', sortOrder)

    fetchData(token, params)
  }, [keyword, platform, status, sortBy])

  // 重置筛选
  const handleReset = () => {
    setKeyword('')
    setPlatform('')
    setStatus('')
    setSortBy('createdAt-desc')
    
    const token = localStorage.getItem('token')
    if (token) {
      fetchData(token)
    }
  }

  // 监听筛选变化自动搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword, platform, status, sortBy])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
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
        setLinks(links.filter(link => link.id !== linkId))
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

  if (loading && links.length === 0) {
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">总访问量</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalVisits}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">短链接数</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalLinks}</p>
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
            <ExportMenu />
            <Link href="/dashboard/links/create">
              <Button className="bg-purple-600 hover:bg-purple-700">创建短链接</Button>
            </Link>
          </div>
        </div>

        {/* 搜索筛选区域 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 关键词搜索 */}
            <div className="lg:col-span-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索标题、描述、目标值、短码..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 平台筛选 */}
            <div>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">全部状态</option>
                <option value="ACTIVE">启用</option>
                <option value="INACTIVE">禁用</option>
              </select>
            </div>

            {/* 排序 */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 重置按钮 */}
          {(keyword || platform || status || sortBy !== 'createdAt-desc') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                重置筛选
              </button>
            </div>
          )}
        </div>

        {/* Links Table */}
        {links.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">暂无短链接</p>
            <Link href="/dashboard/links/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                创建第一个短链接
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full min-w-[800px]">
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
