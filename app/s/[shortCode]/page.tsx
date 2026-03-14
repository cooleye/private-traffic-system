import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    shortCode: string
  }
}

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
  const baseUrl = 'https://private-traffic.byjr.ren'
  const image = link.coverImage 
    ? (link.coverImage.startsWith('http') ? link.coverImage : `${baseUrl}${link.coverImage}`) 
    : `${baseUrl}/default-card.png`
  const targetUrl = `/l/${params.shortCode}`

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph - 抖音等社交平台抓取 */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={`${baseUrl}/s/${params.shortCode}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="私域引流管理系统" />
        
        {/* 图片尺寸 */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        
        {/* 3秒后跳转到落地页 */}
        <meta httpEquiv="refresh" content={`3;url=${targetUrl}`} />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* 封面图 */}
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 20px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#f0f0f0'
          }}>
            <img 
              src={image} 
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${baseUrl}/default-card.png`
              }}
            />
          </div>
          
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '0 0 10px',
            color: '#333'
          }}>
            {title}
          </h1>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            margin: '0 0 30px',
            lineHeight: '1.5'
          }}>
            {description}
          </p>
          
          {/* 加载动画 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#999',
            fontSize: '14px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>正在跳转...</span>
          </div>
          
          <p style={{ 
            fontSize: '12px', 
            color: '#999', 
            marginTop: '20px'
          }}>
            如果没有自动跳转，<a href={targetUrl} style={{ color: '#667eea', textDecoration: 'none' }}>请点击这里</a>
          </p>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </body>
    </html>
  )
}
