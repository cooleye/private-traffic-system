import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params

    const link = await prisma.shortLink.findUnique({
      where: { shortCode },
    })

    if (!link || link.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '链接不存在或已失效' },
        { status: 404 }
      )
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error('获取链接失败:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}
