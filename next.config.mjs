/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Vercel 部署配置
  output: 'standalone',
  // 环境变量配置
  env: {
    DB_PROVIDER: process.env.DB_PROVIDER || 'sqlite',
  },
}

export default nextConfig
