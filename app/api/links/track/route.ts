import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const trackSchema = z.object({
  linkId: z.string(),
  action: z.enum(['VIEW', 'COPY', 'SAVE_QRCODE', 'ADD_SUCCESS']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, action } = trackSchema.parse(body)

    // 获取请求信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || ''

    // 解析User Agent
    const deviceInfo = parseUserAgent(userAgent)

    // 创建访问记录
    await prisma.visitLog.create({
      data: {
        shortLinkId: linkId,
        ipAddress: ipAddress.toString(),
        userAgent,
        deviceType: deviceInfo.deviceType,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        referrer,
        action,
      },
    })

    // 更新点击计数
    if (action === 'VIEW') {
      await prisma.shortLink.update({
        where: { id: linkId },
        data: { clickCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('记录访问失败:', error)
    return NextResponse.json({ error: '记录失败' }, { status: 500 })
  }
}

function parseUserAgent(userAgent: string) {
  const deviceInfo = {
    deviceType: 'desktop',
    os: 'unknown',
    browser: 'unknown',
  }

  // 检测设备类型
  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    deviceInfo.deviceType = 'mobile'
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceInfo.deviceType = 'tablet'
  }

  // 检测操作系统
  if (/windows/i.test(userAgent)) {
    deviceInfo.os = 'Windows'
  } else if (/macintosh|mac os/i.test(userAgent)) {
    deviceInfo.os = 'macOS'
  } else if (/linux/i.test(userAgent)) {
    deviceInfo.os = 'Linux'
  } else if (/android/i.test(userAgent)) {
    deviceInfo.os = 'Android'
  } else if (/ios|iphone|ipad|ipod/i.test(userAgent)) {
    deviceInfo.os = 'iOS'
  }

  // 检测浏览器
  if (/chrome/i.test(userAgent)) {
    deviceInfo.browser = 'Chrome'
  } else if (/safari/i.test(userAgent)) {
    deviceInfo.browser = 'Safari'
  } else if (/firefox/i.test(userAgent)) {
    deviceInfo.browser = 'Firefox'
  } else if (/edge/i.test(userAgent)) {
    deviceInfo.browser = 'Edge'
  }

  return deviceInfo
}
