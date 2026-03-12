import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建系统模板
  const templates = [
    {
      name: '抖音-添加微信',
      platform: 'DOUYIN',
      title: '👉 点击添加微信好友',
      description: '一对一专属客服，快速解答您的问题',
      coverImage: '',
      isSystem: true,
    },
    {
      name: '小红书-添加微信',
      platform: 'XIAOHONGSHU',
      title: '💬 私信获取更多资料',
      description: '添加微信领取专属福利和详细攻略',
      coverImage: '',
      isSystem: true,
    },
    {
      name: '快手-添加微信',
      platform: 'KUAISHOU',
      title: '🎬 关注后添加微信',
      description: '获取更多独家内容和优惠活动',
      coverImage: '',
      isSystem: true,
    },
    {
      name: '微信-公众号',
      platform: 'WECHAT',
      title: '🔔 关注公众号',
      description: '订阅获取最新资讯和独家内容',
      coverImage: '',
      isSystem: true,
    },
    {
      name: '微博-添加微信',
      platform: 'WEIBO',
      title: '🌊 转发后添加微信',
      description: '参与互动赢取专属福利',
      coverImage: '',
      isSystem: true,
    },
    {
      name: 'B站-添加微信',
      platform: 'BILIBILI',
      title: '📺 一键三连后添加',
      description: '获取UP主独家资源和福利',
      coverImage: '',
      isSystem: true,
    },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: {
        id: `system-${template.platform.toLowerCase()}`,
      },
      update: {},
      create: {
        id: `system-${template.platform.toLowerCase()}`,
        ...template,
      },
    })
  }

  console.log('系统模板创建完成')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
