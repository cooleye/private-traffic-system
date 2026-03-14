import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface PageProps {
  params: {
    shortCode: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const link = await prisma.shortLink.findUnique({
    where: { shortCode: params.shortCode },
  })

  if (!link) {
    return {
      title: '链接不存在',
    }
  }

  const title = link.title || '点击添加微信好友'
  const description = link.description || '一对一专属客服服务'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://private-traffic-system.vercel.app'
  const image = link.coverImage ? (link.coverImage.startsWith('http') ? link.coverImage : `${baseUrl}${link.coverImage}`) : `${baseUrl}/default-card.png`
  const url = `${baseUrl}/s/${params.shortCode}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      url,
      type: 'website',
    },
  }
}

export default async function SharePage({ params }: PageProps) {
  const link = await prisma.shortLink.findUnique({
    where: { shortCode: params.shortCode },
  })

  if (!link || link.status !== 'ACTIVE') {
    notFound()
  }

  const title = link.title || '点击添加微信好友'
  const description = link.description || '一对一专属客服服务'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://private-traffic-system.vercel.app'
  const image = link.coverImage ? (link.coverImage.startsWith('http') ? link.coverImage : `${baseUrl}${link.coverImage}`) : `${baseUrl}/default-card.png`

  // 输出完整的 HTML 确保 meta 标签正确
  return (
    <html>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="website" />
        <meta httpEquiv="refresh" content={`0;url=/l/${params.shortCode}`} />
      </head>
      <body>
        <p>正在跳转...</p>
      </body>
    </html>
  )
}
