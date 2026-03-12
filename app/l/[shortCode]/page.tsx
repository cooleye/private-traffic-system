'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Link {
  id: string
  platform: string
  targetType: string
  targetValue: string
  title: string | null
  description: string | null
  clickCount: number
}

export default function ShortLinkPage() {
  const params = useParams()
  const shortCode = params.shortCode as string
  const [link, setLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    fetchLink()
  }, [shortCode])

  const fetchLink = async () => {
    try {
      const res = await fetch(`/api/links/${shortCode}`)
      if (!res.ok) {
        setError('链接不存在或已失效')
        setLoading(false)
        return
      }

      const data = await res.json()
      setLink(data.link)
      setLoading(false)

      // 记录访问
      fetch('/api/links/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: data.link.id,
          action: 'VIEW',
        }),
      }).catch(console.error)

      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleRedirect(data.link)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } catch (err) {
      setError('加载失败')
      setLoading(false)
    }
  }

  const handleRedirect = (linkData: Link) => {
    let url = ''

    switch (linkData.targetType) {
      case 'WECHAT_ID':
        // 微信类型不自动跳转，显示复制按钮
        return
      case 'WEBSITE':
        url = linkData.targetValue
        break
      case 'PUBLIC_ACCOUNT':
        url = `https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${linkData.targetValue}`
        break
      default:
        url = linkData.targetValue
    }

    if (url) {
      window.location.href = url
    }
  }

  const handleCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link.targetValue)
      alert('已复制到剪贴板')

      fetch('/api/links/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link.id,
          action: 'COPY',
        }),
      }).catch(console.error)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const handleManualRedirect = () => {
    if (link) {
      handleRedirect(link)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">链接不存在</h1>
          <p className="text-gray-600">{error || '该链接已失效或不存在'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">
            {link.platform === 'DOUYIN' && '🎵'}
            {link.platform === 'XIAOHONGSHU' && '📕'}
            {link.platform === 'KUAISHOU' && '🎬'}
            {link.platform === 'WECHAT' && '💬'}
            {link.platform === 'QQ' && '🐧'}
            {link.platform === 'WEIBO' && '🌊'}
            {link.platform === 'BILIBILI' && '📺'}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {link.title || '正在跳转...'}
          </h1>

          {link.description && (
            <p className="text-gray-600">{link.description}</p>
          )}
        </div>

        {link.targetType === 'WECHAT_ID' ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">微信号</p>
              <p className="text-2xl font-bold text-purple-600 break-all">{link.targetValue}</p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              复制微信号
            </button>

            <p className="text-sm text-gray-500">
              请打开微信，搜索并添加好友
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              {countdown === 0 ? '正在跳转...' : `${countdown} 秒后自动跳转`}
            </p>

            <button
              onClick={handleManualRedirect}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              立即跳转
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t text-sm text-gray-400">
          访问次数: {link.clickCount + 1}
        </div>
      </div>
    </div>
  )
}
