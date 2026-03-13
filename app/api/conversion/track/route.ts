import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getGeoByIP } from '@/lib/geo'

const conversionSchema = z.object({
  linkId: z.string(),
  action: z.enum(['VIEW', 'COPY', 'ADD_SUCCESS']),
  sessionId: z.string().optional(), // 用于关联同一用户的多个行为
})

// 生成会话ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, action, sessionId } = conversionSchema.parse(body)

    // 获取请求信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 获取地域信息
    const geoInfo = getGeoByIP(ipAddress.toString())

    // 创建转化记录
    const conversion = await prisma.conversionLog.create({
      data: {
        shortLinkId: linkId,
        action,
        sessionId: sessionId || generateSessionId(),
        ipAddress: ipAddress.toString(),
        userAgent,
        country: geoInfo.country,
        province: geoInfo.province,
        city: geoInfo.city,
      },
    })

    // 如果是 VIEW 或 ADD_SUCCESS，更新短链接的转化计数
    if (action === 'VIEW') {
      await prisma.shortLink.update({
        where: { id: linkId },
        data: { clickCount: { increment: 1 } },
      })
    } else if (action === 'ADD_SUCCESS') {
      await prisma.shortLink.update({
        where: { id: linkId },
        data: { conversionCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: conversion.sessionId 
    })
  } catch (error) {
    console.error('记录转化失败:', error)
    return NextResponse.json({ error: '记录失败' }, { status: 500 })
  }
}
