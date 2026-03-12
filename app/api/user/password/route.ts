import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth'
import { strictRateLimiter, getClientIP } from '@/lib/rateLimit'
import { z } from 'zod'

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(6, '新密码至少6位'),
})

function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export async function PUT(request: NextRequest) {
  try {
    // IP限流检查
    const ip = getClientIP(request)
    if (!strictRateLimiter.isAllowed(ip)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = updatePasswordSchema.parse(body)

    // 获取用户当前密码
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { password: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, dbUser.password)
    if (!isValid) {
      return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
    }

    // 更新密码
    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: '密码修改成功' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('修改密码失败:', error)
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 })
  }
}
