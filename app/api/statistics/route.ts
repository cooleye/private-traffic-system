import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'token无效' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取用户的短链接ID
    const userLinks = await prisma.shortLink.findMany({
      where: { userId: user.userId },
      select: { id: true },
    })

    const linkIds = userLinks.map(link => link.id)

    if (linkIds.length === 0) {
      return NextResponse.json({
        totalVisits: 0,
        totalLinks: 0,
        platformStats: [],
        dailyStats: [],
        deviceStats: [],
      })
    }

    // 总访问量
    const totalVisits = await prisma.visitLog.count({
      where: {
        shortLinkId: { in: linkIds },
        createdAt: { gte: startDate },
      },
    })

    // 平台统计
    const platformStats = await prisma.shortLink.groupBy({
      by: ['platform'],
      where: { userId: user.userId },
      _count: { id: true },
    })

    // 每日统计
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM visit_logs
      WHERE short_link_id IN (${linkIds.join(',')})
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    // 设备统计
    const deviceStats = await prisma.visitLog.groupBy({
      by: ['deviceType'],
      where: {
        shortLinkId: { in: linkIds },
        createdAt: { gte: startDate },
      },
      _count: { id: true },
    })

    return NextResponse.json({
      totalVisits,
      totalLinks: userLinks.length,
      platformStats: platformStats.map(p => ({
        platform: p.platform,
        count: p._count.id,
      })),
      dailyStats,
      deviceStats: deviceStats.map(d => ({
        deviceType: d.deviceType,
        count: d._count.id,
      })),
    })
  } catch (error) {
    console.error('获取统计失败:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
