# Vercel 一键部署指南

## 🚀 快速开始

### 1. 准备工作

- GitHub 账号
- Vercel 账号（可以用 GitHub 登录）
- PostgreSQL 数据库（推荐 Neon 免费版）

### 2. 创建 PostgreSQL 数据库

#### 方案 A：Neon（推荐，免费）
1. 访问 https://neon.tech
2. 用 GitHub 账号登录
3. 创建新项目
4. 复制连接字符串（Connection String）

#### 方案 B：Supabase（免费）
1. 访问 https://supabase.com
2. 创建新项目
3. 在 Settings > Database 中找到连接字符串

### 3. 部署到 Vercel

#### 方式一：Vercel Dashboard（推荐）

1. 访问 https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `my-app`
4. 添加环境变量：
   ```
   DB_PROVIDER=postgresql
   DATABASE_URL=你的PostgreSQL连接字符串
   NEXTAUTH_SECRET=随机生成的32位以上密钥
   JWT_SECRET=随机生成的32位以上密钥
   NEXTAUTH_URL=https://你的域名.vercel.app
   ```
5. 点击 **Deploy**

#### 方式二：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 4. 生成密钥

```bash
# 生成 NEXTAUTH_SECRET 和 JWT_SECRET
openssl rand -base64 32
```

## 🔧 环境配置说明

### 开发环境（本地）

```env
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
```

### 生产环境（Vercel）

```env
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

## 📁 项目结构

```
my-app/
├── app/                    # Next.js 应用代码
│   ├── api/               # API 路由
│   └── ...
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── migrations/        # 数据库迁移
├── vercel.json            # Vercel 配置
├── next.config.mjs        # Next.js 配置
└── package.json           # 依赖和脚本
```

## 🔄 自动部署流程

每次推送到 GitHub 主分支，Vercel 会自动：

1. 安装依赖 `npm install`
2. 生成 Prisma Client `prisma generate`
3. 执行数据库迁移 `prisma migrate deploy`
4. 构建应用 `next build`
5. 部署到全球 CDN

## 🛠️ 常用命令

```bash
# 本地开发
npm run dev

# 数据库操作
npm run db:migrate      # 创建迁移
npm run db:migrate:prod # 生产环境迁移
npm run db:studio       # 打开数据库管理界面

# 构建
npm run build
```

## 📝 注意事项

1. **数据库**: 生产环境必须使用 PostgreSQL，SQLite 不支持 Vercel Serverless
2. **文件上传**: Vercel 是只读文件系统，上传的文件需要使用云存储（如 AWS S3、阿里云 OSS）
3. **环境变量**: 敏感信息不要提交到 GitHub，只在 Vercel Dashboard 中设置
4. **域名**: Vercel 提供免费二级域名，也可以绑定自定义域名

## 🆘 常见问题

### 1. 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确保数据库允许外部连接
- 检查 SSL 配置

### 2. 构建失败
- 检查 `vercel.json` 配置
- 确保所有环境变量已设置
- 查看 Vercel 构建日志

### 3. 迁移失败
- 确保数据库用户有创建表的权限
- 检查数据库是否已存在同名表

## 💰 成本估算

| 服务 | 免费额度 | 超出费用 |
|------|----------|----------|
| Vercel | 100GB 带宽/月 | $0.40/GB |
| Neon | 500MB 存储 | $0.016/GB/月 |
| Supabase | 500MB 存储 | 按量付费 |

**初期成本：$0/月**

## 📞 支持

- Vercel 文档: https://vercel.com/docs
- Next.js 文档: https://nextjs.org/docs
- Prisma 文档: https://www.prisma.io/docs
