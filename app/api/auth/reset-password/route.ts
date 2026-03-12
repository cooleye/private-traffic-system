import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { strictRateLimiter, getClientIP } from '@/lib/rateLimit'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, '重置令牌不能为空'),
  password: z.string().min(6, '密码至少6位'),
})

// 验证令牌是否有效
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: '重置令牌不能为空' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpireAt: {
          gt: new Date(), // 令牌未过期
        },
      },
      select: {
        id: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '重置链接已过期或无效', valid: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
    })
  } catch (error) {
    console.error('验证重置令牌失败:', error)
    return NextResponse.json(
      { error: '验证失败', valid: false },
      { status: 500 }
    )
  }
}

// 重置密码
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
    const { token, password } = resetPasswordSchema.parse(body)

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpireAt: {
          gt: new Date(), // 令牌未过期
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '重置链接已过期或无效' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await hashPassword(password)

    // 更新密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpireAt: null,
      },
    })

    return NextResponse.json({
      message: '密码重置成功，请使用新密码登录',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('重置密码失败:', error)
    return NextResponse.json(
      { error: '重置密码失败，请稍后重试' },
      { status: 500 }
    )
  }
}
