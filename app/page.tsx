import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            私域引流管理系统
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            一站式多平台私域引流解决方案，支持抖音、小红书、快手等平台，
            轻松管理短链接、分享卡片和数据统计
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                进入系统
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="border border-white bg-transparent text-white hover:bg-white/10">
                注册账号
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="多平台支持"
            description="支持抖音、小红书、快手、微信等主流平台"
            icon="🚀"
          />
          <FeatureCard
            title="智能短链接"
            description="自定义短链接，支持二维码生成和分享卡片"
            icon="🔗"
          />
          <FeatureCard
            title="数据统计"
            description="实时统计访问数据，分析引流效果"
            icon="📊"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  )
}
