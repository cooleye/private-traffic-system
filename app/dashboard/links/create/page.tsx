'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ShareCardPreview from '@/components/share/ShareCardPreview'

// 配置为动态渲染
export const dynamic = 'force-dynamic'

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

export default function CreateLinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    platform: 'DOUYIN',
    targetType: 'WECHAT_ID',
    targetValue: '',
    title: '',
    description: '',
    coverImage: '',
    expiresAt: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdLink, setCreatedLink] = useState<any>(null)
  const [qrcode, setQrcode] = useState('')

  // 从 URL 参数导入模板数据
  useEffect(() => {
    const platform = searchParams.get('platform')
    const title = searchParams.get('title')
    const description = searchParams.get('description')
    const coverImage = searchParams.get('coverImage')

    if (platform || title || description || coverImage) {
      setFormData(prev => ({
        ...prev,
        ...(platform && { platform }),
        ...(title && { title }),
        ...(description && { description }),
        ...(coverImage && { coverImage }),
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('API错误:', res.status, data)
        setError(data.error || `创建失败 (${res.status})`)
        return
      }

      setCreatedLink(data.link)

      // 生成二维码
      const shortUrl = `${window.location.origin}/s/${data.link.shortCode}`
      const qrRes = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shortUrl, size: 200 }),
      })

      if (qrRes.ok) {
        const qrData = await qrRes.json()
        setQrcode(qrData.qrcode)
      }
    } catch (err: any) {
      console.error('创建链接错误:', err)
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  if (createdLink) {
    const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${createdLink.shortCode}`

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              ← 返回
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold mb-4">短链接创建成功！</h1>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">短链接</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <code className="text-base sm:text-lg font-mono break-all text-center">{shortUrl}</code>
                  <button
                    onClick={() => handleCopy(shortUrl)}
                    className="text-purple-600 hover:text-purple-700 text-sm whitespace-nowrap"
                  >
                    复制
                  </button>
                </div>
              </div>

              {qrcode && (
                <div className="flex justify-center">
                  <img src={qrcode} alt="二维码" className="w-48 h-48" />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  返回列表
                </Button>
              </Link>
              <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setCreatedLink(null)
                    setQrcode('')
                    setFormData({
                      platform: 'DOUYIN',
                      targetType: 'WECHAT_ID',
                      targetValue: '',
                      title: '',
                      description: '',
                      coverImage: '',
                      expiresAt: '',
                    })
                  }}
                >
                  再创建一个
                </Button>
            </div>
          </div>
        </main>
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
            <h1 className="text-2xl font-bold mb-6">创建短链接</h1>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">选择平台</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
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
                  标题（可选）
                  <span className="text-gray-400 text-xs ml-2">{formData.title.length}/20</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 20) })}
                  placeholder="分享卡片标题"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  描述（可选）
                  <span className="text-gray-400 text-xs ml-2">{formData.description.length}/50</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 50) })}
                  placeholder="分享卡片描述"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">封面图URL（可选）</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">建议使用 1200×630 像素的图片</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  过期时间（可选）
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">设置后链接将在指定时间自动失效</p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? '创建中...' : '创建'}
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
              title={formData.title}
              description={formData.description}
              coverImage={formData.coverImage}
              platform={formData.platform}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
