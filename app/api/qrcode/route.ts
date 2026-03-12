import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { z } from 'zod'

const qrcodeSchema = z.object({
  text: z.string().min(1, '内容不能为空'),
  size: z.number().optional().default(300),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, size } = qrcodeSchema.parse(body)

    // 生成二维码
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return NextResponse.json({
      success: true,
      qrcode: dataUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('生成二维码失败:', error)
    return NextResponse.json(
      { error: '生成二维码失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text')
    const size = parseInt(searchParams.get('size') || '300')

    if (!text) {
      return NextResponse.json(
        { error: '缺少text参数' },
        { status: 400 }
      )
    }

    // 生成二维码
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return NextResponse.json({
      success: true,
      qrcode: dataUrl,
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
    return NextResponse.json(
      { error: '生成二维码失败' },
      { status: 500 }
    )
  }
}
