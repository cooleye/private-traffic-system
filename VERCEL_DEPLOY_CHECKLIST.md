# Vercel 部署检查清单

## ✅ 准备工作已完成

- [x] 代码已推送到 GitHub
- [x] Neon 数据库已创建
- [x] 数据库连接字符串已获取

---

## 🚀 Vercel 部署步骤

### 步骤 1：进入 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 点击 **Add New...** → **Project**

### 步骤 2：导入项目

1. 找到你的 GitHub 仓库
2. 点击 **Import**

### 步骤 3：配置项目（关键！）

| 配置项 | 值 |
|--------|-----|
| **Framework Preset** | Next.js |
| **Root Directory** | `my-app` ⚠️ 必须设置 |

### 步骤 4：配置环境变量

点击 **Environment Variables**，添加以下变量：

#### 必需变量

```
DB_PROVIDER=postgresql
```

```
DATABASE_URL=postgresql://neondb_owner:npg_zH18sAZJiXbU@ep-nameless-leaf-a1j4sks7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
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

> 生成随机密钥命令：`openssl rand -base64 32`

#### 可选变量

```
UPLOAD_DIR=/tmp
```

```
CDN_URL=https://你的项目名.vercel.app
```

### 步骤 5：部署

1. 点击 **Deploy**
2. 等待 2-3 分钟
3. 点击 **Visit** 查看网站

---

## 🔧 部署后验证

### 1. 检查网站是否正常运行
- 访问 Vercel 提供的域名
- 确认页面能正常打开

### 2. 检查数据库连接
- 尝试注册一个新用户
- 如果能成功注册，说明数据库连接正常

### 3. 检查数据库表
在 Neon Dashboard 中查看是否创建了以下表：
- `users`
- `short_links`
- `visit_logs`
- `conversion_logs`
- `templates`

---

## 📝 环境变量总结

### 开发环境（本地 .env）
```env
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="本地开发密钥"
JWT_SECRET="本地开发密钥"
```

### 生产环境（Vercel）
```env
DB_PROVIDER=postgresql
DATABASE_URL=postgresql://neondb_owner:npg_zH18sAZJiXbU@ep-nameless-leaf-a1j4sks7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://你的域名.vercel.app
NEXTAUTH_SECRET=生产环境密钥
JWT_SECRET=生产环境密钥
```

---

## ⚠️ 常见问题

### 问题 1：构建失败
**解决**：检查 Root Directory 是否设置为 `my-app`

### 问题 2：数据库连接失败
**解决**：
- 确认 DATABASE_URL 正确复制
- 确认包含 `?sslmode=require`
- 在 Neon Dashboard 中确认数据库允许连接

### 问题 3：迁移失败
**解决**：
- 检查 Vercel 构建日志
- 确认数据库用户有创建表权限

---

## 🎉 完成！

部署成功后：
- ✅ 网站可通过 Vercel 域名访问
- ✅ 数据库已自动创建表
- ✅ 每次推送代码自动部署

**你的 Neon 数据库连接字符串：**
```
postgresql://neondb_owner:npg_zH18sAZJiXbU@ep-nameless-leaf-a1j4sks7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**注意**：这个连接字符串包含敏感信息，不要提交到 GitHub！
