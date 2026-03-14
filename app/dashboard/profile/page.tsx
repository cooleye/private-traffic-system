'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  membershipType: string
  membershipExpireAt?: string
  createdAt: string
}

const membershipLabels: Record<string, string> = {
  TRIAL: '7天试用',
  MONTHLY: '月度会员',
  QUARTERLY: '季度会员',
  YEARLY: '年度会员',
}

const membershipColors: Record<string, string> = {
  TRIAL: 'bg-gray-100 text-gray-600 border-gray-200',
  MONTHLY: 'bg-blue-100 text-blue-600 border-blue-200',
  QUARTERLY: 'bg-purple-100 text-purple-600 border-purple-200',
  YEARLY: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const membershipBenefits: Record<string, string[]> = {
  TRIAL: ['创建最多5个短链接', '基础数据统计', '7天有效期'],
  MONTHLY: ['创建最多50个短链接', '高级统计分析', '模板库使用', '优先技术支持'],
  QUARTERLY: ['创建最多200个短链接', '高级统计分析', '模板库使用', 'API接口访问', '优先技术支持'],
  YEARLY: ['无限短链接创建', '高级统计分析', '模板库使用', 'API接口访问', '专属客服支持', '自定义域名'],
}

// 使用 DiceBear API 生成头像
function generateAvatarUrl(seed: string, style: string = 'avataaars'): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

// 头像风格选项
const avatarStyles = [
  { value: 'avataaars', label: '卡通人物' },
  { value: 'bottts', label: '机器人' },
  { value: 'fun-emoji', label: '表情符号' },
  { value: 'identicon', label: '几何图案' },
  { value: 'initials', label: '首字母' },
  { value: 'lorelei', label: '洛丽塔' },
  { value: 'notionists', label: '简约风格' },
  { value: 'pixel-art', label: '像素艺术' },
]

// 头像组件，处理加载错误
function Avatar({ src, alt, fallback }: { src?: string; alt: string; fallback: string }) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (!src || error) {
    return <span>{fallback}</span>
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
      />
    </>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', avatarStyle: 'avataaars' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      // 从现有 avatar URL 中提取风格，如果没有则使用默认
      const currentStyle = parsed.avatar?.includes('dicebear') 
        ? new URL(parsed.avatar).pathname.split('/')[2] 
        : 'avataaars'
      setEditForm({ name: parsed.name || '', avatarStyle: currentStyle })
    }
    setLoading(false)
  }, [router])

  const getAvatarUrl = (style: string, seed: string) => {
    return generateAvatarUrl(seed, style)
  }

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    // 生成新的头像 URL
    const avatarUrl = getAvatarUrl(editForm.avatarStyle, user?.email || 'user')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          avatar: avatarUrl,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setIsEditing(false)
        setMessage('个人信息更新成功')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorData = await res.json()
        setMessage(errorData.error || '更新失败')
      }
    } catch (error) {
      console.error('更新失败:', error)
      setMessage('网络错误，请稍后重试')
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('两次输入的密码不一致')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage('新密码至少6位')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (res.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordForm(false)
        setMessage('密码修改成功')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setMessage(data.error || '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
    }
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未设置'
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">未登录</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">个人中心</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧：个人信息 */}
          <div className="md:col-span-2 space-y-6">
            {/* 基本信息卡片 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold">基本信息</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    编辑
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">昵称</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="请输入昵称"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">选择头像风格</label>
                    <div className="grid grid-cols-4 gap-3">
                      {avatarStyles.map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setEditForm({ ...editForm, avatarStyle: style.value })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            editForm.avatarStyle === style.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-gray-100 relative">
                            <Avatar
                              src={getAvatarUrl(style.value, user.email)}
                              alt={style.label}
                              fallback={getInitials(user.email)}
                            />
                          </div>
                          <p className="text-xs text-center">{style.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      保存
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        const currentStyle = user.avatar?.includes('dicebear') 
                          ? new URL(user.avatar).pathname.split('/')[2] 
                          : 'avataaars'
                        setEditForm({ name: user.name || '', avatarStyle: currentStyle })
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-medium overflow-hidden relative">
                    <Avatar
                      src={user.avatar}
                      alt={user.name || user.email}
                      fallback={getInitials(user.name || user.email)}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-medium">{user.name || '未设置昵称'}</p>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      注册时间：{formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 修改密码卡片 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">账号安全</h2>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    修改密码
                  </button>
                )}
              </div>

              {showPasswordForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">当前密码</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">新密码</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">确认新密码</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleUpdatePassword}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      确认修改
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">定期修改密码可以保护账号安全</p>
              )}
            </div>
          </div>

          {/* 右侧：会员信息 */}
          <div className="space-y-6">
            {/* 会员等级卡片 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">会员等级</h2>
              <div className={`inline-block px-4 py-2 rounded-lg border text-sm font-medium mb-4 ${membershipColors[user.membershipType] || membershipColors.TRIAL}`}>
                {membershipLabels[user.membershipType] || '7天试用'}
              </div>
              {user.membershipExpireAt && (
                <p className="text-sm text-gray-500 mb-4">
                  有效期至：{formatDate(user.membershipExpireAt)}
                </p>
              )}
              <Link href="/dashboard/membership">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  升级会员
                </Button>
              </Link>
            </div>

            {/* 会员权益卡片 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">当前权益</h2>
              <ul className="space-y-3">
                {(membershipBenefits[user.membershipType] || membershipBenefits.TRIAL).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 数据统计卡片 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">使用统计</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">短链接数</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">总访问量</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">模板数</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
              <Link href="/dashboard/statistics">
                <Button variant="outline" className="w-full mt-4">
                  查看详细统计
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
