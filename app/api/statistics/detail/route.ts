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
    const linkId = searchParams.get('linkId')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 构建查询条件
    const linkWhere: any = { userId: user.userId }
    if (linkId) {
      linkWhere.id = linkId
    }

    // 获取用户的短链接
    const userLinks = await prisma.shortLink.findMany({
      where: linkWhere,
      select: { id: true, platform: true, shortCode: true, title: true },
    })

    const linkIds = userLinks.map(link => link.id)

    if (linkIds.length === 0) {
      return NextResponse.json({
        overview: { totalVisits: 0, uniqueVisitors: 0, totalLinks: 0, avgVisitsPerLink: 0 },
        platformStats: [],
        dailyStats: [],
        deviceStats: [],
        osStats: [],
        browserStats: [],
        hourlyStats: [],
        topLinks: [],
      })
    }

    // 基础查询条件
    const visitWhere: any = {
      shortLinkId: { in: linkIds },
      createdAt: { gte: startDate },
    }

    // 总访问量和独立访客
    const [totalVisits, uniqueVisitors] = await Promise.all([
      prisma.visitLog.count({ where: visitWhere }),
      prisma.visitLog.groupBy({
        by: ['ipAddress'],
        where: visitWhere,
        _count: { ipAddress: true },
      }).then(results => results.length),
    ])

    // 平台统计 - 按访问量
    const platformStats = await prisma.visitLog.groupBy({
      by: ['shortLinkId'],
      where: visitWhere,
      _count: { id: true },
    }).then(stats => {
      const platformMap = new Map()
      stats.forEach(stat => {
        const link = userLinks.find(l => l.id === stat.shortLinkId)
        if (link) {
          const current = platformMap.get(link.platform) || 0
          platformMap.set(link.platform, current + stat._count.id)
        }
      })
      return Array.from(platformMap.entries()).map(([platform, count]) => ({
        platform,
        count,
      }))
    })

    // 每日统计
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as visits,
        COUNT(DISTINCT ip_address) as uniqueVisitors
      FROM visit_logs
      WHERE short_link_id IN (${linkIds.join(',')})
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    // 设备类型统计
    const deviceStats = await prisma.visitLog.groupBy({
      by: ['deviceType'],
      where: visitWhere,
      _count: { id: true },
    }).then(stats => stats.map(s => ({
      deviceType: s.deviceType || 'Unknown',
      count: s._count.id,
    })))

    // 操作系统统计
    const osStats = await prisma.visitLog.groupBy({
      by: ['os'],
      where: visitWhere,
      _count: { id: true },
    }).then(stats => stats.map(s => ({
      os: s.os || 'Unknown',
      count: s._count.id,
    })).sort((a, b) => b.count - a.count).slice(0, 5))

    // 浏览器统计
    const browserStats = await prisma.visitLog.groupBy({
      by: ['browser'],
      where: visitWhere,
      _count: { id: true },
    }).then(stats => stats.map(s => ({
      browser: s.browser || 'Unknown',
      count: s._count.id,
    })).sort((a, b) => b.count - a.count).slice(0, 5))

    // 小时分布统计
    const hourlyStats = await prisma.$queryRaw`
      SELECT 
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        COUNT(*) as count
      FROM visit_logs
      WHERE short_link_id IN (${linkIds.join(',')})
        AND created_at >= ${startDate}
      GROUP BY hour
      ORDER BY hour
    `

    // 热门链接排行
    const topLinks = await prisma.visitLog.groupBy({
      by: ['shortLinkId'],
      where: visitWhere,
      _count: { id: true },
    }).then(stats => {
      return stats
        .map(stat => {
          const link = userLinks.find(l => l.id === stat.shortLinkId)
          return {
            id: stat.shortLinkId,
            shortCode: link?.shortCode || '',
            title: link?.title || '',
            platform: link?.platform || '',
            visits: stat._count.id,
          }
        })
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10)
    })

    return NextResponse.json({
      overview: {
        totalVisits,
        uniqueVisitors,
        totalLinks: userLinks.length,
        avgVisitsPerLink: userLinks.length > 0 ? Math.round(totalVisits / userLinks.length) : 0,
      },
      platformStats,
      dailyStats,
      deviceStats,
      osStats,
      browserStats,
      hourlyStats,
      topLinks,
    })
  } catch (error) {
    console.error('获取详细统计失败:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
