'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

interface StatisticsData {
  overview: {
    totalVisits: number
    uniqueVisitors: number
    totalLinks: number
    avgVisitsPerLink: number
  }
  platformStats: { platform: string; count: number }[]
  dailyStats: { date: string; visits: number; uniqueVisitors: number }[]
  deviceStats: { deviceType: string; count: number }[]
  osStats: { os: string; count: number }[]
  browserStats: { browser: string; count: number }[]
  hourlyStats: { hour: number; count: number }[]
  topLinks: { id: string; shortCode: string; title: string; platform: string; visits: number }[]
  provinceStats: { province: string; count: number }[]
  cityStats: { city: string; count: number }[]
}

const platformNames: Record<string, string> = {
  DOUYIN: '抖音',
  XIAOHONGSHU: '小红书',
  KUAISHOU: '快手',
  WECHAT: '微信',
  QQ: 'QQ',
  WEIBO: '微博',
  BILIBILI: 'B站',
}

const platformColors: Record<string, string> = {
  DOUYIN: '#000000',
  XIAOHONGSHU: '#FF2442',
  KUAISHOU: '#FF6600',
  WECHAT: '#07C160',
  QQ: '#12B7F5',
  WEIBO: '#E6162D',
  BILIBILI: '#00A1D6',
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']

export default function StatisticsPage() {
  const router = useRouter()
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchStatistics(token)
  }, [router, days])

  const fetchStatistics = async (token: string) => {
    try {
      const res = await fetch(`/api/statistics/detail?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('获取失败')
      }

      const statsData = await res.json()
      setData(statsData)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">获取数据失败</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">数据统计</h1>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-sm rounded ${
                  days === d
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}天
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">总访问量</p>
            <p className="text-3xl font-bold text-purple-600">{data.overview.totalVisits.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">独立访客</p>
            <p className="text-3xl font-bold text-blue-600">{data.overview.uniqueVisitors.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">短链接数</p>
            <p className="text-3xl font-bold text-green-600">{data.overview.totalLinks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">平均访问/链接</p>
            <p className="text-3xl font-bold text-orange-600">{data.overview.avgVisitsPerLink}</p>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 访问趋势 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">访问趋势</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="visits" name="访问量" stroke="#667eea" strokeWidth={2} />
                  <Line type="monotone" dataKey="uniqueVisitors" name="独立访客" stroke="#764ba2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 平台分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">平台分布</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.platformStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, count }) => `${platformNames[platform] || platform}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="platform"
                  >
                    {data.platformStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={platformColors[entry.platform] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 设备分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">设备分布</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.deviceStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="deviceType"
                    label={({ deviceType, count }) => `${deviceType}: ${count}`}
                  >
                    {data.deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 小时分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">24小时访问分布</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(value) => `${value}时`} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="访问量" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 地域分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 省份分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">省份分布 TOP15</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.provinceStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="province" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" name="访问量" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 城市分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">城市分布 TOP15</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cityStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="city" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" name="访问量" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 系统和浏览器统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 操作系统 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">操作系统 TOP5</h2>
            <div className="space-y-3">
              {data.osStats.map((os, index) => (
                <div key={os.os} className="flex items-center">
                  <span className="w-8 text-gray-500">#{index + 1}</span>
                  <span className="flex-1">{os.os}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{
                          width: `${(os.count / data.osStats[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-gray-600">{os.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 浏览器 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">浏览器 TOP5</h2>
            <div className="space-y-3">
              {data.browserStats.map((browser, index) => (
                <div key={browser.browser} className="flex items-center">
                  <span className="w-8 text-gray-500">#{index + 1}</span>
                  <span className="flex-1">{browser.browser}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${(browser.count / data.browserStats[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-gray-600">{browser.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 热门链接 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">热门链接 TOP10</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">排名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">平台</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">标题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">短链接</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">访问量</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topLinks.map((link, index) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{platformNames[link.platform] || link.platform}</td>
                    <td className="px-4 py-3 text-sm">{link.title || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <a href={`/l/${link.shortCode}`} target="_blank" className="text-purple-600 hover:underline">
                        {link.shortCode}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{link.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
