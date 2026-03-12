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
  const image = link.coverImage || '/default-card.png'
  const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/s/${params.shortCode}`

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
    // 抖音
    other: {
      // 抖音
      'tt:card': 'summary_large_image',
      'tt:title': title,
      'tt:description': description,
      'tt:image': image,
      // 微信
      'wx:title': title,
      'wx:description': description,
      'wx:image': image,
      // QQ
      'qq:title': title,
      'qq:description': description,
      'qq:image': image,
      // 微博
      'wb:card': 'summary_large_image',
      'wb:title': title,
      'wb:description': description,
      'wb:image': image,
      // 小红书
      'xh:title': title,
      'xh:description': description,
      'xh:image': image,
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
