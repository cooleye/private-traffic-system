'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ShareButton } from '@/components/share/ShareButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, UserPlus, ExternalLink, Clock } from 'lucide-react'

interface Link {
  id: string
  platform: string
  targetType: string
  targetValue: string
  title: string | null
  description: string | null
  coverImage: string | null
  clickCount: number
  status: string
  expiresAt: string | null
}

const platformIcons: Record<string, string> = {
  DOUYIN: '🎵',
  XIAOHONGSHU: '📕',
  KUAISHOU: '🎬',
  WECHAT: '💬',
  QQ: '🐧',
  WEIBO: '🌊',
  BILIBILI: '📺',
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

export default function LandingPage() {
  const params = useParams()
  const shortCode = params.shortCode as string
  const [link, setLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
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
      const linkData: Link = data.link

      // 检查链接状态
      if (linkData.status === 'INACTIVE') {
        setError('该链接已被禁用')
        setLoading(false)
        return
      }

      // 检查是否过期
      if (linkData.expiresAt && new Date(linkData.expiresAt) < new Date()) {
        setError('该链接已过期')
        setLoading(false)
        return
      }

      setLink(linkData)
      setLoading(false)

      // 记录访问
      fetch('/api/links/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: linkData.id,
          action: 'VIEW',
        }),
      }).catch(console.error)

      // 非微信号类型开始倒计时
      if (linkData.targetType !== 'WECHAT_ID') {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              handleRedirect(linkData)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }
    } catch (err) {
      setError('加载失败')
      setLoading(false)
    }
  }

  const handleRedirect = (linkData: Link) => {
    let url = ''

    switch (linkData.targetType) {
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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

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

  const handleManualRedirect = () => {
    if (link) {
      handleRedirect(link)
    }
  }

  // 获取分享数据
  const getShareData = () => {
    if (!link) return null
    return {
      title: link.title || '点击添加微信好友',
      description: link.description || '一对一专属客服服务',
      coverImage: link.coverImage || `${process.env.NEXT_PUBLIC_APP_URL || ''}/default-share.png`,
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${shortCode}`,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">加载中...</div>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold mb-2">链接不可用</h1>
            <p className="text-gray-600">{error || '该链接已失效或不存在'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shareData = getShareData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 平台标识 */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{platformIcons[link.platform] || '🔗'}</div>
          <p className="text-white/80 text-sm">来自 {platformNames[link.platform] || '未知平台'}</p>
        </div>

        {/* 主要内容卡片 */}
        <Card className="overflow-hidden shadow-2xl">
          {/* 封面图 */}
          {link.coverImage && (
            <div className="w-full h-48 bg-gray-100 relative">
              <img 
                src={link.coverImage} 
                alt={link.title || '封面'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className="p-6">
            {/* 标题和描述 */}
            <h1 className="text-xl font-bold mb-2">
              {link.title || '欢迎添加微信好友'}
            </h1>
            {link.description && (
              <p className="text-gray-600 text-sm mb-6">{link.description}</p>
            )}

            {/* 微信号类型 */}
            {link.targetType === 'WECHAT_ID' ? (
              <div className="space-y-4">
                {/* 微信号展示 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                  <UserPlus className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">微信号</p>
                  <p className="text-3xl font-bold text-green-600 break-all">{link.targetValue}</p>
                </div>

                {/* 复制按钮 */}
                <Button
                  onClick={handleCopy}
                  className="w-full h-14 text-lg gap-2"
                  variant={copied ? "outline" : "default"}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      复制微信号
                    </>
                  )}
                </Button>

                {/* 操作提示 */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    请打开微信，搜索并添加好友
                  </p>
                  {shareData && (
                    <ShareButton shareData={shareData} />
                  )}
                </div>
              </div>
            ) : (
              /* 其他类型 */
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <ExternalLink className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">即将跳转到外部页面</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    {countdown === 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" />
                        正在跳转...
                      </span>
                    ) : (
                      `${countdown} 秒后自动跳转`
                    )}
                  </p>

                  <Button
                    onClick={handleManualRedirect}
                    className="w-full gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    立即跳转
                  </Button>
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-gray-400">
                已有 {link.clickCount.toLocaleString()} 人访问
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <p className="text-center text-white/60 text-xs mt-6">
          私域引流管理系统 · 安全可靠的引流工具
        </p>
      </div>
    </div>
  )
}
