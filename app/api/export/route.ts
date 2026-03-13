import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// 导出类型
 type ExportType = 'links' | 'visits' | 'conversions' | 'statistics'

// 生成 CSV 内容
function generateCSV(data: any[], headers: string[], fields: string[]): string {
  const rows = data.map(item => {
    return fields.map(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], item)
        : item[field]
      
      // 处理包含逗号或换行符的值
      const str = String(value ?? '')
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

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
    const type = searchParams.get('type') as ExportType
    const format = searchParams.get('format') || 'csv'
    const days = parseInt(searchParams.get('days') || '30')

    if (!type || !['links', 'visits', 'conversions', 'statistics'].includes(type)) {
      return NextResponse.json({ error: '无效的导出类型' }, { status: 400 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let data: any[] = []
    let filename = ''
    let content = ''

    switch (type) {
      case 'links':
        // 导出短链接数据
        const links = await prisma.shortLink.findMany({
          where: { userId: user.userId },
          orderBy: { createdAt: 'desc' },
        })
        
        data = links.map(link => ({
          ...link,
          status: link.status === 'ACTIVE' ? '启用' : '禁用',
          expiresAt: link.expiresAt ? new Date(link.expiresAt).toLocaleString() : '无',
          createdAt: new Date(link.createdAt).toLocaleString(),
        }))
        
        filename = `短链接数据_${new Date().toISOString().split('T')[0]}.csv`
        content = generateCSV(
          data,
          ['短码', '平台', '目标类型', '目标值', '标题', '描述', '状态', '点击量', '转化量', '过期时间', '创建时间'],
          ['shortCode', 'platform', 'targetType', 'targetValue', 'title', 'description', 'status', 'clickCount', 'conversionCount', 'expiresAt', 'createdAt']
        )
        break

      case 'visits':
        // 获取用户的短链接ID
        const userLinks = await prisma.shortLink.findMany({
          where: { userId: user.userId },
          select: { id: true, shortCode: true },
        })
        const linkIds = userLinks.map(l => l.id)
        
        // 导出访问记录
        const visits = await prisma.visitLog.findMany({
          where: {
            shortLinkId: { in: linkIds },
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            shortLink: { select: { shortCode: true } },
          },
        })
        
        data = visits.map(visit => ({
          ...visit,
          shortCode: visit.shortLink.shortCode,
          createdAt: new Date(visit.createdAt).toLocaleString(),
        }))
        
        filename = `访问记录_${new Date().toISOString().split('T')[0]}.csv`
        content = generateCSV(
          data,
          ['短码', 'IP地址', '设备类型', '操作系统', '浏览器', '国家', '省份', '城市', '行为', '访问时间'],
          ['shortCode', 'ipAddress', 'deviceType', 'os', 'browser', 'country', 'province', 'city', 'action', 'createdAt']
        )
        break

      case 'conversions':
        // 获取用户的短链接ID
        const userLinks2 = await prisma.shortLink.findMany({
          where: { userId: user.userId },
          select: { id: true, shortCode: true },
        })
        const linkIds2 = userLinks2.map(l => l.id)
        
        // 导出转化记录
        const conversions = await prisma.conversionLog.findMany({
          where: {
            shortLinkId: { in: linkIds2 },
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            shortLink: { select: { shortCode: true } },
          },
        })
        
        data = conversions.map(conv => ({
          ...conv,
          shortCode: conv.shortLink.shortCode,
          action: conv.action === 'VIEW' ? '点击' : conv.action === 'COPY' ? '复制' : '添加成功',
          createdAt: new Date(conv.createdAt).toLocaleString(),
        }))
        
        filename = `转化记录_${new Date().toISOString().split('T')[0]}.csv`
        content = generateCSV(
          data,
          ['短码', '会话ID', '行为', 'IP地址', '国家', '省份', '城市', '时间'],
          ['shortCode', 'sessionId', 'action', 'ipAddress', 'country', 'province', 'city', 'createdAt']
        )
        break

      case 'statistics':
        // 导出统计数据汇总
        const statsLinks = await prisma.shortLink.findMany({
          where: { userId: user.userId },
          select: {
            shortCode: true,
            platform: true,
            title: true,
            clickCount: true,
            conversionCount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { clickCount: 'desc' },
        })
        
        data = statsLinks.map(link => ({
          ...link,
          status: link.status === 'ACTIVE' ? '启用' : '禁用',
          conversionRate: link.clickCount > 0 
            ? ((link.conversionCount / link.clickCount) * 100).toFixed(2) + '%'
            : '0%',
          createdAt: new Date(link.createdAt).toLocaleString(),
        }))
        
        filename = `统计数据_${new Date().toISOString().split('T')[0]}.csv`
        content = generateCSV(
          data,
          ['短码', '平台', '标题', '点击量', '转化量', '转化率', '状态', '创建时间'],
          ['shortCode', 'platform', 'title', 'clickCount', 'conversionCount', 'conversionRate', 'status', 'createdAt']
        )
        break
    }

    // 返回 CSV 文件
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('导出数据失败:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
    return NextResponse.json({ error: '导出失败: ' + error.message }, { status: 500 })
  }
}
