import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

interface PageProps {
  params: {
    shortCode: string
  }
}

export const dynamic = 'force-dynamic'

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
  const baseUrl = 'https://private-traffic.byjr.ren'
  const image = link.coverImage 
    ? (link.coverImage.startsWith('http') ? link.coverImage : `${baseUrl}${link.coverImage}`) 
    : `${baseUrl}/default-card.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
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

  // 直接重定向到落地页
  redirect(`/l/${params.shortCode}`)
}
