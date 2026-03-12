'use client'

import { useEffect, useState } from 'react'

interface Link {
  id: string
  platform: string
  targetType: string
  targetValue: string
  title: string | null
  description: string | null
  clickCount: number
}

interface LinkRedirectProps {
  link: Link
}

export default function LinkRedirect({ link }: LinkRedirectProps) {
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // 记录访问
    fetch('/api/links/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        linkId: link.id,
        action: 'VIEW',
      }),
    }).catch(console.error)

    // 倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [link.id])

  const handleRedirect = () => {
    setIsRedirecting(true)
    
    let url = ''
    
    switch (link.targetType) {
      case 'WECHAT_ID':
        // 显示微信添加页面
        window.location.href = `/wechat-add?target=${encodeURIComponent(link.targetValue)}&linkId=${link.id}`
        return
      case 'WEBSITE':
        url = link.targetValue
        break
      case 'PUBLIC_ACCOUNT':
        url = `https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${link.targetValue}`
        break
      default:
        url = link.targetValue
    }

    if (url) {
      window.location.href = url
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.targetValue)
      alert('已复制到剪贴板')
      
      // 记录复制行为
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
              <p className="text-2xl font-bold text-purple-600">{link.targetValue}</p>
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
              {isRedirecting ? '正在跳转...' : `${countdown} 秒后自动跳转`}
            </p>
            
            <button
              onClick={handleRedirect}
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
