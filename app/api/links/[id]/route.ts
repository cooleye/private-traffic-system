import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const updateLinkSchema = z.object({
  targetType: z.enum(['WECHAT_ID', 'PUBLIC_ACCOUNT', 'MINI_APP', 'WEBSITE']),
  targetValue: z.string().min(1, '目标值不能为空'),
  title: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

// 获取单个链接详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const link = await prisma.shortLink.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!link) {
      return NextResponse.json({ error: '链接不存在' }, { status: 404 })
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error('获取链接详情失败:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 更新链接
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查链接是否存在且属于当前用户
    const existingLink = await prisma.shortLink.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!existingLink) {
      return NextResponse.json({ error: '链接不存在' }, { status: 404 })
    }

    const body = await request.json()
    const data = updateLinkSchema.parse(body)

    // 更新链接
    const updatedLink = await prisma.shortLink.update({
      where: { id: params.id },
      data: {
        targetType: data.targetType,
        targetValue: data.targetValue,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        ...(data.status && { status: data.status }),
      },
    })

    return NextResponse.json({
      message: '更新成功',
      link: updatedLink,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('更新链接失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 删除链接
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查链接是否存在且属于当前用户
    const existingLink = await prisma.shortLink.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!existingLink) {
      return NextResponse.json({ error: '链接不存在' }, { status: 404 })
    }

    // 删除链接（关联的访问记录会自动删除）
    await prisma.shortLink.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除链接失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
