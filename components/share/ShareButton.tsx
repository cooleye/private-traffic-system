'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Share2, Copy, Check } from 'lucide-react'

interface ShareData {
  title: string
  description: string
  coverImage: string
  url: string
}

interface ShareButtonProps {
  shareData: ShareData
}

export function ShareButton({ shareData }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // 尝试原生分享
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        })
        return
      } catch (err) {
        // 用户取消或分享失败，显示弹窗
        console.log('原生分享失败或取消')
      }
    }
    
    // 显示分享指引弹窗
    setShowModal(true)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const shareToDouyin = async () => {
    await copyLink()
    alert('链接已复制！\n\n请打开抖音，进入私信或群聊，粘贴链接发送。\n链接会自动显示为卡片形式。')
    setShowModal(false)
  }

  return (
    <>
      <Button 
        onClick={handleShare}
        variant="outline"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        分享
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享到抖音</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 预览卡片 */}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              {shareData.coverImage && (
                <div className="w-full h-32 bg-gray-200 relative">
                  <img 
                    src={shareData.coverImage} 
                    alt={shareData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-1">{shareData.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{shareData.description}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{shareData.url}</p>
              </div>
            </div>

            {/* 分享步骤 */}
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium">分享步骤：</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>点击"复制链接"按钮</li>
                <li>打开抖音，进入私信或群聊</li>
                <li>粘贴链接并发送</li>
                <li>链接会自动显示为卡片形式</li>
              </ol>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button 
                onClick={shareToDouyin}
                className="flex-1 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制链接
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
