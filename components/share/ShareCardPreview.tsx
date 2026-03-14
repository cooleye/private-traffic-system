'use client'

import { useState } from 'react'

interface ShareCardPreviewProps {
  title: string
  description: string
  coverImage?: string
  platform: string
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

export default function ShareCardPreview({
  title,
  description,
  coverImage,
  platform,
}: ShareCardPreviewProps) {
  const [activeTab, setActiveTab] = useState<'douyin' | 'wechat' | 'weibo'>('douyin')

  const displayTitle = title || '点击添加微信好友'
  const displayDesc = description || '一对一专属客服服务'
  const displayImage = coverImage || '/default-card.png'

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">分享卡片预览</h3>

      {/* 平台切换 */}
      <div className="flex gap-2 mb-4">
        {(['douyin', 'wechat', 'weibo'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'douyin' && '抖音'}
            {tab === 'wechat' && '微信'}
            {tab === 'weibo' && '微博'}
          </button>
        ))}
      </div>

      {/* 卡片预览 */}
      <div className="space-y-4">
        {/* 抖音样式 - 横向小卡片 */}
        {activeTab === 'douyin' && (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="flex">
              {/* 左侧正方形封面图 */}
              <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-card.png'
                  }}
                />
              </div>
              {/* 右侧标题和描述 */}
              <div className="flex-1 p-3 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{displayTitle}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{displayDesc}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <span>{platformIcons[platform]}</span>
                  <span className="truncate">{platformNames[platform]}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 微信样式 */}
        {activeTab === 'wechat' && (
          <div className="bg-[#f5f5f5] rounded-lg p-3">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="flex">
                <div className="flex-1 p-3">
                  <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">{displayTitle}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{displayDesc}</p>
                </div>
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-card.png'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span className="text-[#07c160]">💬 微信</span>
              <span>·</span>
              <span>公众号文章</span>
            </div>
          </div>
        )}

        {/* 微博样式 */}
        {activeTab === 'weibo' && (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">
                  私
                </div>
                <div>
                  <div className="text-sm font-medium">私域引流助手</div>
                  <div className="text-xs text-gray-400">刚刚</div>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-700 mb-3">{displayDesc}</p>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-card.png'
                  }}
                />
                <div className="p-2">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{displayTitle}</h4>
                  <p className="text-xs text-gray-500 mt-1">私域引流系统</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 提示 */}
      <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded">
        <p className="font-medium text-blue-700 mb-1">💡 优化建议：</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>标题建议控制在 20 字以内</li>
          <li>描述建议控制在 50 字以内</li>
          <li>封面图建议使用 1200×630 像素</li>
          <li>不同平台的卡片展示效果可能略有差异</li>
        </ul>
      </div>
    </div>
  )
}
