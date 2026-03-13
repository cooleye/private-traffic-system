import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import shortid from 'shortid'

const createLinkSchema = z.object({
  platform: z.enum(['DOUYIN', 'XIAOHONGSHU', 'KUAISHOU', 'WECHAT', 'QQ', 'WEIBO', 'BILIBILI']),
  targetType: z.enum(['WECHAT_ID', 'PUBLIC_ACCOUNT', 'MINI_APP', 'WEBSITE']),
  targetValue: z.string().min(1, '目标值不能为空'),
  title: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
})

function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const keyword = searchParams.get('keyword')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询条件
    const where: any = {
      userId: user.userId,
    }

    // 平台筛选
    if (platform) {
      where.platform = platform
    }

    // 状态筛选
    if (status) {
      where.status = status
    }

    // 关键词搜索（搜索标题、描述、目标值、短码）
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { targetValue: { contains: keyword, mode: 'insensitive' } },
        { shortCode: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    // 构建排序条件
    const orderBy: any = {}
    if (sortBy === 'clickCount') {
      orderBy.clickCount = sortOrder
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [links, total] = await Promise.all([
      prisma.shortLink.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.shortLink.count({ where }),
    ])

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取链接失败:', error)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const data = createLinkSchema.parse(body)

    const shortCode = shortid.generate()

    const link = await prisma.shortLink.create({
      data: {
        platform: data.platform,
        targetType: data.targetType,
        targetValue: data.targetValue,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        shortCode,
        userId: user.userId,
      },
    })

    return NextResponse.json({
      message: '创建成功',
      link,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('创建链接失败:', error)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
