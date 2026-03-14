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
    keywords: ['微信', '私域', '引流', '客服'],
    authors: [{ name: '私域引流系统' }],
    openGraph: {
      title,
      description,
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      }],
      url,
      type: 'website',
      siteName: '私域引流管理系统',
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
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

  // 重定向到跳转页面
  return (
    <meta httpEquiv="refresh" content={`0;url=/l/${params.shortCode}`} />
  )
}
