'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ShareCardPreview from '@/components/share/ShareCardPreview'

interface Template {
  id: string
  name: string
  platform: string
  title: string
  description: string | null
  coverImage: string | null
  isSystem: boolean
  createdAt: string
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

const platformNames: Record<string, string> = {
  DOUYIN: '抖音',
  XIAOHONGSHU: '小红书',
  KUAISHOU: '快手',
  WECHAT: '微信',
  QQ: 'QQ',
  WEIBO: '微博',
  BILIBILI: 'B站',
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchTemplates(token)
  }, [router, selectedPlatform])

  const fetchTemplates = async (token: string) => {
    try {
      const url = selectedPlatform
        ? `/api/templates?platform=${selectedPlatform}`
        : '/api/templates'

      const res = await fetch(url, {
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

      const data = await res.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('获取模板失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = (template: Template) => {
    const params = new URLSearchParams({
      template: template.id,
      platform: template.platform,
      title: template.title,
      description: template.description || '',
      coverImage: template.coverImage || '',
    })
    router.push(`/dashboard/links/create?${params.toString()}`)
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">模板库</h1>
          </div>
          <Link href="/dashboard/templates/create">
            <Button className="bg-purple-600 hover:bg-purple-700">
              创建模板
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 筛选 */}
        <div className="mb-6">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* 模板列表 */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">暂无模板</p>
            <Link href="/dashboard/templates/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                创建第一个模板
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                {/* 预览图 */}
                <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 relative">
                  {template.coverImage ? (
                    <img
                      src={template.coverImage}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  )}
                  {template.isSystem && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      系统模板
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {platformNames[template.platform]}
                  </span>
                </div>

                {/* 信息 */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{template.title}</p>
                  {template.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-1">{template.description}</p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUseTemplate(template)
                    }}
                    className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    使用模板
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 预览面板 */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">模板预览</h2>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <ShareCardPreview
                  title={selectedTemplate.title}
                  description={selectedTemplate.description || ''}
                  coverImage={selectedTemplate.coverImage || ''}
                  platform={selectedTemplate.platform}
                />

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    使用此模板
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
