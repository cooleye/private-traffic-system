import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { strictRateLimiter, getClientIP } from '@/lib/rateLimit'
import { generateRandomToken } from '@/lib/security'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

// 模拟发送邮件（实际项目中应该接入真实的邮件服务）
async function sendResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`
  
  // 在控制台输出重置链接（开发环境）
  console.log('========================================')
  console.log('密码重置邮件')
  console.log('收件人:', email)
  console.log('重置链接:', resetUrl)
  console.log('========================================')
  
  // TODO: 接入真实邮件服务
  // 可选：SendGrid、阿里云邮件推送、AWS SES 等
  // await sendgrid.send({
  //   to: email,
  //   subject: '密码重置请求',
  //   html: `...`
  // })
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    // IP限流检查
    const ip = getClientIP(request)
    if (!strictRateLimiter.isAllowed(ip)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 即使用户不存在也返回成功（防止邮箱枚举攻击）
    if (!user) {
      return NextResponse.json({
        message: '如果该邮箱已注册，我们将发送密码重置链接',
      })
    }

    // 生成重置令牌
    const resetToken = generateRandomToken(32)
    const resetTokenExpireAt = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

    // 保存重置令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpireAt,
      },
    })

    // 发送重置邮件
    await sendResetEmail(email, resetToken)

    return NextResponse.json({
      message: '如果该邮箱已注册，我们将发送密码重置链接',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('发送重置邮件失败:', error)
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    )
  }
}
