# Vercel 详细配置指南

## 📋 前置准备

1. 代码已推送到 GitHub
2. 有 Vercel 账号（可以用 GitHub 直接登录）
3. 准备一个 PostgreSQL 数据库（推荐 Neon 免费版）

---

## 第一步：创建 PostgreSQL 数据库

### 使用 Neon（推荐，免费）

1. 访问 https://neon.tech
2. 点击 **Sign Up**，用 GitHub 账号登录
3. 创建新项目
   - 项目名称：`private-traffic-db`
   - 选择地区：Singapore 或 Hong Kong（离中国近）
4. 进入项目后，点击左侧 **Connection String**
5. 复制连接字符串，格式如下：
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```
6. **保存好这个字符串，后面要用**

### 使用 Supabase（备选）

1. 访问 https://supabase.com
2. 创建新项目
3. 进入 Project Settings → Database
4. 复制 Connection String

---

## 第二步：在 Vercel 导入项目

### 2.1 进入 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 点击 **Add New...** → **Project**

### 2.2 导入 GitHub 仓库

1. 在 **Import Git Repository** 列表中找到你的项目
2. 点击 **Import**

### 2.3 配置项目

在 **Configure Project** 页面：

| 配置项 | 值 |
|--------|-----|
| **Framework Preset** | Next.js |
| **Root Directory** | `my-app` ⚠️ 重要！必须设置为 my-app |
| **Build Command** | 保持默认（会自动读取 vercel.json） |
| **Output Directory** | 保持默认 |
| **Install Command** | 保持默认 |

### 2.4 配置环境变量

点击 **Environment Variables** 展开，添加以下变量：

#### 必需变量

```
DB_PROVIDER=postgresql
```

```
DATABASE_URL=postgresql://用户名:密码@主机:端口/数据库名?sslmode=require
```

```
NEXTAUTH_SECRET=你的随机密钥（32位以上）
```

```
JWT_SECRET=你的随机密钥（32位以上）
```

```
NEXTAUTH_URL=https://你的项目名.vercel.app
```

#### 生成随机密钥

在终端执行：
```bash
openssl rand -base64 32
```

执行两次，分别作为 `NEXTAUTH_SECRET` 和 `JWT_SECRET`

#### 可选变量

```
UPLOAD_DIR=/tmp
```

```
CDN_URL=https://你的项目名.vercel.app
```

### 2.5 部署

1. 点击 **Deploy** 按钮
2. 等待 2-3 分钟构建完成
3. 部署成功后，点击 **Visit** 查看网站

---

## 第三步：验证部署

### 3.1 检查网站是否正常运行

访问 Vercel 提供的域名（如 `https://private-traffic-xxx.vercel.app`）

### 3.2 检查数据库连接

1. 尝试注册一个新用户
2. 如果能成功注册，说明数据库连接正常

### 3.3 查看部署日志

在 Vercel Dashboard：
1. 点击你的项目
2. 点击 **Deployments**
3. 点击最新的部署
4. 点击 **Build Logs** 查看构建日志

---

## 第四步：配置自定义域名（可选）

### 4.1 添加域名

1. 在 Vercel Dashboard 点击你的项目
2. 点击 **Settings** → **Domains**
3. 输入你的域名，如 `yourdomain.com`
4. 点击 **Add**

### 4.2 DNS 配置

根据 Vercel 提示，在你的域名服务商添加 DNS 记录：

**方式一：A 记录**
```
类型：A
名称：@ 或 www
值：76.76.21.21
```

**方式二：CNAME 记录**
```
类型：CNAME
名称：www
值：cname.vercel-dns.com
```

### 4.3 更新环境变量

如果有自定义域名，更新 `NEXTAUTH_URL`：
```
NEXTAUTH_URL=https://yourdomain.com
```

---

## 第五步：启用自动部署

Vercel 默认会自动部署：

- 每次推送到 `main` 或 `master` 分支
- 每次创建 Pull Request（会生成预览链接）

### 5.1 测试自动部署

1. 在本地修改代码
2. 提交并推送到 GitHub
3. 观察 Vercel Dashboard 自动开始构建
4. 约 2-3 分钟后，网站自动更新

---

## 🛠️ 常见问题排查

### 问题 1：构建失败

**症状**：部署状态显示 ❌ Failed

**解决**：
1. 点击失败的部署
2. 查看 **Build Logs**
3. 常见错误：
   - `DATABASE_URL` 未设置 → 添加环境变量
   - 数据库连接失败 → 检查连接字符串
   - Prisma 迁移失败 → 检查数据库权限

### 问题 2：数据库连接失败

**症状**：网站打开但无法注册/登录

**解决**：
1. 检查 `DATABASE_URL` 是否正确
2. 确保数据库允许外部连接（Neon/Supabase 默认允许）
3. 检查是否包含 `?sslmode=require`

### 问题 3：环境变量未生效

**症状**：修改环境变量后没有变化

**解决**：
1. 修改环境变量后需要 **重新部署**
2. 在 Vercel Dashboard 点击 **Redeploy**

### 问题 4：根目录设置错误

**症状**：构建失败，提示找不到 package.json

**解决**：
1. 进入项目 Settings → General
2. 找到 **Root Directory**
3. 设置为 `my-app`
4. 点击 **Save** 并重新部署

---

## 📊 Vercel Dashboard 常用功能

### 查看流量统计

1. 进入项目
2. 点击 **Analytics**（需要 Pro 计划）

### 查看日志

1. 进入项目
2. 点击 **Logs**
3. 可以查看实时请求日志

### 管理环境变量

1. 进入项目
2. 点击 **Settings** → **Environment Variables**
3. 可以添加/修改/删除变量

---

## 🎉 完成！

现在你已经完成了 Vercel 的完整配置：

✅ 数据库：PostgreSQL（Neon/Supabase）
✅ 后端：Next.js API Routes
✅ 前端：Next.js + React
✅ 部署：Vercel 自动部署
✅ 域名：Vercel 免费二级域名或自定义域名

**每次推送代码到 GitHub，Vercel 会自动构建并部署！**
