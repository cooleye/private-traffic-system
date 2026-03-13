# 数据库迁移说明

## 📊 数据库模型变更总结

### 当前数据库模型（最新）

| 模型 | 说明 | 字段数 |
|------|------|--------|
| `User` | 用户表 | 14个字段 |
| `ShortLink` | 短链接表 | 15个字段 |
| `VisitLog` | 访问日志表 | 14个字段 |
| `ConversionLog` | 转化日志表 | 10个字段 |
| `Template` | 模板表 | 10个字段 |

### 最新变更（2026-03-13）

✅ **新增 `ConversionLog` 表**
- 用于追踪用户转化行为
- 字段：id, shortLinkId, action, sessionId, ipAddress, userAgent, country, province, city, createdAt

✅ **ShortLink 表新增字段**
- `conversionCount` - 转化次数统计

✅ **数据库多环境支持**
- 开发环境：SQLite
- 生产环境：PostgreSQL

---

## 🔄 迁移文件说明

### 迁移文件列表

```
prisma/migrations/
├── 20260312144523_init/                    # 初始迁移（SQLite）
├── 20260312160148_add_membership/          # 添加会员系统
├── 20260312161345_add_password_reset/      # 添加密码重置
├── 20260313021159_add_conversion_tracking/ # 添加转化追踪（最新）
└── 20260313000000_init_postgresql/         # PostgreSQL 初始化（Vercel用）
```

### 迁移策略

| 环境 | 使用的迁移 | 说明 |
|------|-----------|------|
| **本地开发** | SQLite 迁移文件 | 按时间顺序执行 |
| **Vercel 生产** | PostgreSQL 初始化文件 | 一次性创建所有表 |

---

## 🚀 Vercel 部署时的数据库处理

### 首次部署

Vercel 会自动执行：
```bash
prisma migrate deploy
```

这会读取 `20260313000000_init_postgresql/migration.sql` 创建所有表。

### 后续更新

如果数据库模型有变更：
1. 创建新的 PostgreSQL 迁移文件
2. 提交到 GitHub
3. Vercel 自动执行迁移

---

## 🛠️ 本地开发环境配置

### 环境变量（.env）

```env
# 开发环境使用 SQLite
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

### 本地数据库操作

```bash
# 生成 Prisma Client
npm run db:generate

# 创建迁移（开发环境）
npm run db:migrate

# 打开数据库管理界面
npm run db:studio
```

---

## 📋 Vercel 生产环境配置

### 环境变量（Vercel Dashboard）

```env
# 生产环境使用 PostgreSQL
DB_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### 生产环境部署流程

1. **首次部署**
   - Vercel 自动执行 PostgreSQL 初始化迁移
   - 创建所有表结构

2. **后续更新**
   - 修改 schema.prisma
   - 创建新的 PostgreSQL 迁移
   - 推送到 GitHub
   - Vercel 自动执行迁移

---

## ⚠️ 重要注意事项

### 1. 不要混合使用迁移文件

- SQLite 迁移文件（时间戳格式）用于本地开发
- PostgreSQL 迁移文件（20260313000000_init_postgresql）用于 Vercel

### 2. 数据库备份

生产环境部署前建议备份数据：
```bash
# PostgreSQL 备份
pg_dump $DATABASE_URL > backup.sql
```

### 3. 迁移失败处理

如果迁移失败：
1. 检查 Vercel 构建日志
2. 确认数据库连接字符串正确
3. 确认数据库用户有创建表权限
4. 必要时手动在数据库中执行迁移 SQL

---

## 🔄 数据库模型变更流程

### 步骤 1：修改 schema.prisma

```prisma
// 添加或修改模型
model NewTable {
  id        String   @id @default(cuid())
  // ... 其他字段
}
```

### 步骤 2：创建本地迁移（SQLite）

```bash
npx prisma migrate dev --name add_new_table
```

### 步骤 3：创建 PostgreSQL 迁移

创建新的 SQL 文件：`prisma/migrations/YYYYMMDD_HHMMSS_migration_name/migration.sql`

### 步骤 4：提交并部署

```bash
git add .
git commit -m "feat: add new table"
git push
```

Vercel 会自动执行迁移。

---

## 📞 故障排查

### 问题 1：本地开发正常，Vercel 部署失败

**原因**：SQLite 和 PostgreSQL 语法差异

**解决**：确保 PostgreSQL 迁移文件语法正确

### 问题 2：迁移执行顺序错误

**原因**：迁移文件时间戳问题

**解决**：确保 PostgreSQL 初始化迁移文件名时间戳最早

### 问题 3：表已存在错误

**原因**：重复执行迁移

**解决**：在 Vercel Dashboard 中手动标记迁移已执行

---

## ✅ 检查清单

部署前确认：

- [ ] schema.prisma 中的 provider 使用 `env("DB_PROVIDER")`
- [ ] 本地开发使用 SQLite，生产环境使用 PostgreSQL
- [ ] PostgreSQL 迁移文件已创建
- [ ] 环境变量 `DB_PROVIDER` 和 `DATABASE_URL` 已设置
- [ ] 数据库连接字符串包含 `?sslmode=require`
