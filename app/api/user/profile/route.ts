import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(),
})

function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        name: data.name,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        membershipType: true,
        membershipExpireAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: '更新成功',
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('更新资料失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
