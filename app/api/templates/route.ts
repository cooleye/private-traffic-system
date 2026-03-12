import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空'),
  platform: z.enum(['DOUYIN', 'XIAOHONGSHU', 'KUAISHOU', 'WECHAT', 'QQ', 'WEIBO', 'BILIBILI']),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
})

function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

// 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { isSystem: true },
          { userId: user.userId },
        ],
        ...(platform && { platform }),
      },
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('获取模板失败:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

// 创建模板
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = templateSchema.parse(body)

    const template = await prisma.template.create({
      data: {
        ...data,
        userId: user.userId,
      },
    })

    return NextResponse.json({
      message: '创建成功',
      template,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('创建模板失败:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
