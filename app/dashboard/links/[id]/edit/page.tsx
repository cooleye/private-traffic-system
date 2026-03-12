'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ShareCardPreview from '@/components/share/ShareCardPreview'

const platforms = [
  { value: 'DOUYIN', label: '抖音' },
  { value: 'XIAOHONGSHU', label: '小红书' },
  { value: 'KUAISHOU', label: '快手' },
  { value: 'WECHAT', label: '微信' },
  { value: 'QQ', label: 'QQ' },
  { value: 'WEIBO', label: '微博' },
  { value: 'BILIBILI', label: 'B站' },
]

const targetTypes = [
  { value: 'WECHAT_ID', label: '微信号' },
  { value: 'PUBLIC_ACCOUNT', label: '公众号' },
  { value: 'MINI_APP', label: '小程序' },
  { value: 'WEBSITE', label: '网站' },
]

interface LinkData {
  id: string
  platform: string
  targetType: string
  targetValue: string
  title: string
  description: string
  coverImage: string
  status: string
  shortCode: string
}

export default function EditLinkPage() {
  const router = useRouter()
  const params = useParams()
  const linkId = params.id as string

  const [formData, setFormData] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchLink(token)
  }, [router, linkId])

  const fetchLink = async (token: string) => {
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 404) {
          setError('链接不存在')
        } else if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('获取链接失败')
      }

      const data = await res.json()
      setFormData(data.link)
    } catch (error) {
      console.error('获取链接失败:', error)
      setError('获取链接信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setError('')
    setSaving(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: formData.targetType,
          targetValue: formData.targetValue,
          title: formData.title,
          description: formData.description,
          coverImage: formData.coverImage,
          status: formData.status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '更新失败')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">{error || '链接不存在'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            ← 返回
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧表单 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-2">编辑短链接</h1>
            <p className="text-gray-500 mb-6">短码: {formData.shortCode}</p>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                更新成功，正在跳转...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">平台</label>
                <input
                  type="text"
                  value={platforms.find(p => p.value === formData.platform)?.label || formData.platform}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">平台不可修改</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">目标类型</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {targetTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">目标值</label>
                <input
                  type="text"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="例如：微信号、网址等"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  标题
                  <span className="text-gray-400 text-xs ml-2">{formData.title?.length || 0}/20</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 20) })}
                  placeholder="分享卡片标题"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  描述
                  <span className="text-gray-400 text-xs ml-2">{formData.description?.length || 0}/50</span>
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 50) })}
                  placeholder="分享卡片描述"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">封面图URL</label>
                <input
                  type="url"
                  value={formData.coverImage || ''}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">建议使用 1200×630 像素的图片</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ACTIVE">启用</option>
                  <option value="INACTIVE">禁用</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存修改'}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    取消
                  </Button>
                </Link>
              </div>
            </form>
          </div>

          {/* 右侧预览 */}
          <div>
            <ShareCardPreview
              title={formData.title || ''}
              description={formData.description || ''}
              coverImage={formData.coverImage || ''}
              platform={formData.platform}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
