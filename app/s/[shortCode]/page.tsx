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
  const url = `${process.env.NEXTAUTH_URL}/s/${params.shortCode}`

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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    other: {
      'tt:card': 'summary_large_image',
      'tt:title': title,
      'tt:description': description,
      'tt:image': image,
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
