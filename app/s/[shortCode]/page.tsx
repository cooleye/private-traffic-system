import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    shortCode: string
  }
}

// 强制动态渲染
export const dynamic = 'force-dynamic'

export default async function SharePage({ params }: PageProps) {
  const link = await prisma.shortLink.findUnique({
    where: { shortCode: params.shortCode },
  })

  if (!link || link.status !== 'ACTIVE') {
    notFound()
  }

  const title = link.title || '点击添加微信好友'
  const description = link.description || '一对一专属客服服务'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://byjr.ren'
  const image = link.coverImage 
    ? (link.coverImage.startsWith('http') ? link.coverImage : `${baseUrl}${link.coverImage}`) 
    : `${baseUrl}/default-card.png`
  const url = `${baseUrl}/s/${params.shortCode}`

  // 输出完整的 HTML 确保 meta 标签正确
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {/* 抖音/头条 */}
        <meta name="tt:card" content="summary_large_image" />
        <meta name="tt:title" content={title} />
        <meta name="tt:description" content={description} />
        <meta name="tt:image" content={image} />
        
        {/* 微信 */}
        <meta name="wx:title" content={title} />
        <meta name="wx:description" content={description} />
        <meta name="wx:image" content={image} />
        
        {/* QQ */}
        <meta name="qq:title" content={title} />
        <meta name="qq:description" content={description} />
        <meta name="qq:image" content={image} />
        
        <meta httpEquiv="refresh" content={`0;url=/l/${params.shortCode}`} />
      </head>
      <body style={{ margin: 0, padding: '20px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <p>正在跳转...</p>
        <p style={{ fontSize: '12px', color: '#999' }}>如果未自动跳转，<a href={`/l/${params.shortCode}`}>请点击这里</a></p>
      </body>
    </html>
  )
}
