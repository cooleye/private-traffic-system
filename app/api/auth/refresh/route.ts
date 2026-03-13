import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken, verifyRefreshToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { error: '刷新令牌不能为空' },
        { status: 400 }
      )
    }

    // 验证刷新令牌
    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return NextResponse.json(
        { error: '刷新令牌无效或已过期' },
        { status: 401 }
      )
    }

    // 检查用户是否仍然存在且状态正常
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '账号已被禁用' },
        { status: 403 }
      )
    }

    // 生成新的访问令牌
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      message: '刷新成功',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('刷新令牌失败:', error)
    return NextResponse.json(
      { error: '刷新失败' },
      { status: 500 }
    )
  }
}
