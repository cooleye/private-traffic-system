import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cache, generateCacheKey } from '@/lib/cache'
import { rateLimiter, getClientIP } from '@/lib/rateLimit'

// 配置为动态路由
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // IP限流检查
    const ip = getClientIP(request)
    if (!rateLimiter.isAllowed(ip)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

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

    // 缓存键
    const cacheKey = generateCacheKey('stats', {
      userId: user.userId,
      days,
      linkId: linkId || 'all',
    })

    // 尝试从缓存获取
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

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
      const emptyResult = {
        overview: { totalVisits: 0, uniqueVisitors: 0, totalLinks: 0, avgVisitsPerLink: 0 },
        platformStats: [],
        dailyStats: [],
        deviceStats: [],
        osStats: [],
        browserStats: [],
        hourlyStats: [],
        topLinks: [],
        provinceStats: [],
        cityStats: [],
        conversionStats: {
          funnel: [
            { stage: '点击链接', count: 0, rate: 100 },
            { stage: '复制信息', count: 0, rate: 0 },
            { stage: '添加成功', count: 0, rate: 0 },
          ],
          totalConversion: 0,
          conversionRate: 0,
        },
      }
      cache.set(cacheKey, emptyResult, 60 * 1000) // 缓存1分钟
      return NextResponse.json(emptyResult)
    }

    // 基础查询条件
    const visitWhere: any = {
      shortLinkId: { in: linkIds },
      createdAt: { gte: startDate },
    }

    // 构建转化查询条件
    const conversionWhere: any = {
      shortLinkId: { in: linkIds },
      createdAt: { gte: startDate },
    }

    // 并行查询所有统计数据
    const [
      totalVisits,
      uniqueVisitorsResult,
      platformStatsRaw,
      deviceStatsRaw,
      osStatsRaw,
      browserStatsRaw,
      topLinksRaw,
      provinceStatsRaw,
      cityStatsRaw,
      conversionStatsRaw,
    ] = await Promise.all([
      // 总访问量
      prisma.visitLog.count({ where: visitWhere }),
      
      // 独立访客
      prisma.visitLog.groupBy({
        by: ['ipAddress'],
        where: visitWhere,
        _count: { ipAddress: true },
      }),

      // 平台统计
      prisma.visitLog.groupBy({
        by: ['shortLinkId'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 设备类型统计
      prisma.visitLog.groupBy({
        by: ['deviceType'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 操作系统统计
      prisma.visitLog.groupBy({
        by: ['os'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 浏览器统计
      prisma.visitLog.groupBy({
        by: ['browser'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 热门链接排行
      prisma.visitLog.groupBy({
        by: ['shortLinkId'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 省份统计
      prisma.visitLog.groupBy({
        by: ['province'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 城市统计
      prisma.visitLog.groupBy({
        by: ['city'],
        where: visitWhere,
        _count: { id: true },
      }),

      // 转化统计
      prisma.conversionLog.groupBy({
        by: ['action'],
        where: conversionWhere,
        _count: { id: true },
      }),
    ])

    // 处理平台统计
    const platformMap = new Map()
    platformStatsRaw.forEach((stat: any) => {
      const link = userLinks.find(l => l.id === stat.shortLinkId)
      if (link) {
        const current = platformMap.get(link.platform) || 0
        platformMap.set(link.platform, current + stat._count.id)
      }
    })
    const platformStats = Array.from(platformMap.entries()).map(([platform, count]) => ({
      platform,
      count,
    }))

    // 处理设备统计
    const deviceStats = deviceStatsRaw.map((s: any) => ({
      deviceType: s.deviceType || 'Unknown',
      count: s._count.id,
    }))

    // 处理操作系统统计
    const osStats = osStatsRaw
      .map((s: any) => ({ os: s.os || 'Unknown', count: s._count.id }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // 处理浏览器统计
    const browserStats = browserStatsRaw
      .map((s: any) => ({ browser: s.browser || 'Unknown', count: s._count.id }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // 处理热门链接
    const topLinks = topLinksRaw
      .map((stat: any) => {
        const link = userLinks.find(l => l.id === stat.shortLinkId)
        return {
          id: stat.shortLinkId,
          shortCode: link?.shortCode || '',
          title: link?.title || '',
          platform: link?.platform || '',
          visits: stat._count.id,
        }
      })
      .sort((a: any, b: any) => b.visits - a.visits)
      .slice(0, 10)

    // 处理省份统计
    const provinceStats = provinceStatsRaw
      .filter((s: any) => s.province && s.province !== '未知' && s.province !== '本地')
      .map((s: any) => ({
        province: s.province,
        count: s._count.id,
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 15)

    // 处理城市统计
    const cityStats = cityStatsRaw
      .filter((s: any) => s.city && s.city !== '未知' && s.city !== '本地')
      .map((s: any) => ({
        city: s.city,
        count: s._count.id,
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 15)

    // 处理转化统计
    const conversionMap = new Map()
    conversionStatsRaw.forEach((stat: any) => {
      conversionMap.set(stat.action, stat._count.id)
    })
    
    const viewCount = conversionMap.get('VIEW') || 0
    const copyCount = conversionMap.get('COPY') || 0
    const addSuccessCount = conversionMap.get('ADD_SUCCESS') || 0
    
    const conversionStats = {
      funnel: [
        { stage: '点击链接', count: viewCount, rate: 100 },
        { stage: '复制信息', count: copyCount, rate: viewCount > 0 ? Math.round((copyCount / viewCount) * 100) : 0 },
        { stage: '添加成功', count: addSuccessCount, rate: viewCount > 0 ? Math.round((addSuccessCount / viewCount) * 100) : 0 },
      ],
      totalConversion: addSuccessCount,
      conversionRate: viewCount > 0 ? Math.round((addSuccessCount / viewCount) * 100) : 0,
    }

    const result = {
      overview: {
        totalVisits,
        uniqueVisitors: uniqueVisitorsResult.length,
        totalLinks: userLinks.length,
        avgVisitsPerLink: userLinks.length > 0 ? Math.round(totalVisits / userLinks.length) : 0,
      },
      platformStats,
      dailyStats: [],
      deviceStats,
      osStats,
      browserStats,
      hourlyStats: [],
      topLinks,
      provinceStats,
      cityStats,
      conversionStats,
    }

    // 缓存结果（5分钟）
    cache.set(cacheKey, result, 5 * 60 * 1000)

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取详细统计失败:', error)
    return NextResponse.json({ error: '获取统计失败' }, { status: 500 })
  }
}
