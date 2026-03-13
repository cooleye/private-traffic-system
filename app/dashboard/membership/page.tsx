'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Crown, Sparkles, Zap, Star } from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  membershipType: string
  membershipExpireAt?: string
}

interface MembershipPlan {
  id: string
  type: string
  name: string
  price: number
  originalPrice?: number
  duration: string
  description: string
  features: string[]
  badge?: string
  popular?: boolean
  icon: React.ReactNode
}

const membershipPlans: MembershipPlan[] = [
  {
    id: 'trial',
    type: 'TRIAL',
    name: '7天免费试用',
    price: 0,
    duration: '7天',
    description: '零风险体验所有基础功能',
    features: [
      '创建最多5个短链接',
      '基础数据统计',
      '模板库基础访问',
      '邮件技术支持',
      '7天完整体验期',
    ],
    badge: '免费',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: 'monthly',
    type: 'MONTHLY',
    name: '月度会员',
    price: 29,
    duration: '1个月',
    description: '适合短期项目需求',
    features: [
      '创建最多50个短链接',
      '高级统计分析',
      '完整模板库访问',
      '优先技术支持',
      '自定义短链接',
      '导出数据报告',
    ],
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 'quarterly',
    type: 'QUARTERLY',
    name: '季度会员',
    price: 79,
    originalPrice: 87,
    duration: '3个月',
    description: '性价比之选，节省9%',
    features: [
      '创建最多200个短链接',
      '高级统计分析',
      '完整模板库访问',
      'API接口访问',
      '优先技术支持',
      '自定义短链接',
      '导出数据报告',
      '团队协作功能',
    ],
    badge: '省9%',
    popular: true,
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: 'yearly',
    type: 'YEARLY',
    name: '年度会员',
    price: 249,
    originalPrice: 348,
    duration: '12个月',
    description: '最佳选择，节省28%',
    features: [
      '无限短链接创建',
      '高级统计分析',
      '完整模板库访问',
      'API接口访问',
      '专属客服支持',
      '自定义域名绑定',
      '自定义短链接',
      '导出数据报告',
      '团队协作功能',
      '白标解决方案',
    ],
    badge: '省28%',
    icon: <Crown className="w-6 h-6" />,
  },
]

export default function MembershipPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [router])

  const handleSubscribe = async (plan: MembershipPlan) => {
    if (plan.price === 0) {
      // 免费试用直接激活
      setProcessing(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/membership/activate-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('user', JSON.stringify(data.user))
          router.push('/dashboard/profile')
        }
      } catch (error) {
        console.error('激活试用失败:', error)
      } finally {
        setProcessing(false)
      }
    } else {
      // 付费套餐跳转到支付页面或显示支付二维码
      setSelectedPlan(plan.id)
      // TODO: 集成支付系统
      alert(`即将跳转到支付页面 - ${plan.name} ¥${plan.price}`)
    }
  }

  const isCurrentPlan = (planType: string) => {
    return user?.membershipType === planType
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile" className="text-purple-600 hover:underline">
              ← 返回个人中心
            </Link>
            <h1 className="text-xl font-bold">升级会员</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            选择适合您的会员方案
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            从免费试用开始，体验我们的核心功能。随时升级以解锁更多高级功能，助力您的业务增长。
          </p>
        </div>

        {/* 会员套餐卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-purple-500 lg:scale-105' : ''
              } ${isCurrentPlan(plan.type) ? 'ring-2 ring-green-500' : ''}`}
            >
              {/* 标签 */}
              {plan.badge && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                  plan.price === 0
                    ? 'bg-green-100 text-green-700'
                    : plan.popular
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* 当前套餐标记 */}
              {isCurrentPlan(plan.type) && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  当前套餐
                </div>
              )}

              <div className="p-6">
                {/* 图标和名称 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    plan.price === 0
                      ? 'bg-green-100 text-green-600'
                      : plan.popular
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.duration}</p>
                  </div>
                </div>

                {/* 价格 */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ¥{plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ¥{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 按钮 */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan(plan.type) || processing}
                  className={`w-full ${
                    isCurrentPlan(plan.type)
                      ? 'bg-green-600 hover:bg-green-600 cursor-default'
                      : plan.price === 0
                      ? 'bg-green-600 hover:bg-green-700'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan(plan.type)
                    ? '当前使用中'
                    : plan.price === 0
                    ? '免费激活'
                    : '立即订阅'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">常见问题</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">可以随时取消吗？</h4>
                <p className="text-sm text-gray-600">是的，您可以随时取消订阅，取消后将在当前计费周期结束时生效。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">支持哪些支付方式？</h4>
                <p className="text-sm text-gray-600">我们支持支付宝、微信支付以及主流银行卡支付。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">可以升级或降级套餐吗？</h4>
                <p className="text-sm text-gray-600">当然可以，您可以随时升级或降级，费用将按比例计算。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">有退款政策吗？</h4>
                <p className="text-sm text-gray-600">7天内不满意可申请全额退款，无需任何理由。</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            有疑问？请联系我们的客服团队：support@example.com
          </p>
        </div>
      </main>
    </div>
  )
}
