# 私域引流管理系统 - 开发计划

## 项目概述

基于 shadcn/ui 构建的多用户私域引流管理系统，支持多平台（抖音、小红书、快手等）短链接生成与分享，具备完善的用户管理、数据统计和平台对接功能。

---

## 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **UI组件库**: shadcn/ui
- **样式**: Tailwind CSS
- **状态管理**: Zustand / React Query
- **后端**: Node.js + Express
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + bcrypt
- **文件存储**: 本地/云存储（封面图）

---

## 功能模块规划

### 一、用户认证与权限管理

#### 1.1 用户注册/登录
- **注册页面**: 邮箱/手机号注册，验证码验证
- **登录页面**: 邮箱+密码、手机号+验证码登录
- **密码重置**: 邮箱验证重置密码
- **JWT认证**: Token刷新机制，自动登录保持

#### 1.2 用户管理
- **个人中心**: 修改个人信息、头像、密码
- **账号设置**: 绑定第三方账号（微信、QQ）
- **订阅管理**: 免费版/专业版/企业版权限控制
- **团队成员**: 企业版支持子账号管理

#### 1.3 数据隔离
- 每个用户只能看到自己的短链接和统计数据
- 数据库层面通过userId进行数据过滤
- 团队版支持数据共享给成员

### 二、多平台短链接管理

#### 2.1 平台适配器设计
支持平台：抖音、小红书、快手、微信、QQ、微博、B站

**各平台特性:**
| 平台 | 分享方式 | 特殊要求 | 卡片支持 |
|------|---------|---------|---------|
| 抖音 | H5链接/小程序 | 需申请开放平台权限 | 支持OG卡片 |
| 小红书 | H5链接 | 需优化OG标签 | 支持OG卡片 |
| 快手 | H5链接 | 类似抖音 | 支持OG卡片 |
| 微信 | H5链接/公众号 | 需备案域名 | 支持JS-SDK分享 |
| QQ | H5链接 | 需优化OG标签 | 支持OG卡片 |
| 微博 | H5链接 | 需优化OG标签 | 支持OG卡片 |
| B站 | H5链接 | 需优化OG标签 | 支持OG卡片 |

#### 2.2 短链接创建流程
1. 选择目标平台
2. 配置跳转目标（微信号/公众号/个人主页等）
3. 设置分享卡片（封面图、标题、描述）
4. 生成短链接和二维码
5. 提供平台特定的分享代码/SDK

#### 2.3 短链接管理
- 列表展示：短链接、平台、创建时间、访问次数
- 搜索筛选：按平台、时间、关键词搜索
- 批量操作：批量删除、导出
- 链接编辑：修改目标、更新卡片信息
- 链接状态：启用/禁用/过期设置

### 三、分享卡片系统

#### 3.1 卡片编辑器
- **封面图上传**: 支持本地上传、URL引用、在线裁剪
- **标题编辑**: 最大长度限制（各平台不同）
- **描述编辑**: 支持表情符号，长度限制
- **实时预览**: 模拟各平台分享效果

#### 3.2 模板库
- 预设各行业模板（电商、教育、医疗等）
- 用户可保存自定义模板
- 模板分类和搜索

#### 3.3 OG标签优化
自动生成符合各平台规范的OG标签：
```html
<!-- 通用 -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="封面图URL">
<meta property="og:url" content="短链接">

<!-- 抖音 -->
<meta name="tt:card" content="summary_large_image">
<meta name="tt:title" content="标题">
<meta name="tt:description" content="描述">
<meta name="tt:image" content="封面图URL">

<!-- 微信 -->
<meta name="wx:title" content="标题">
<meta name="wx:description" content="描述">
<meta name="wx:image" content="封面图URL">
```

### 四、抖音开放平台集成

#### 4.1 授权流程
1. 用户绑定抖音账号
2. 获取access_token
3. 调用分享API

#### 4.2 H5分享功能
根据抖音文档实现：
- **分享至发布页**: `snssdk1128://openplatform/share`
- **参数配置**:
  - share_type=h5
  - client_key（应用Key）
  - title（视频标题）
  - image_path（封面图）
  - hashtag_list（话题标签）
  - micro_app_info（小程序信息）

#### 4.3 数据回传
- 获取share_id追踪发布状态
- 接收抖音回调通知
- 统计视频播放量、点赞数

### 五、数据统计与分析

#### 5.1 基础统计
- **访问统计**: PV、UV、IP数
- **设备分析**: 操作系统、浏览器、设备型号
- **地域分布**: 省份、城市访问分布
- **时间趋势**: 24小时、7天、30天趋势图

#### 5.2 转化统计
- **点击转化**: 短链接点击→复制微信号→添加成功
- **平台对比**: 各平台引流效果对比
- **用户路径**: 访问来源→行为轨迹→转化结果

#### 5.3 实时数据
- WebSocket实时推送访问数据
- 实时在线人数
- 实时访问地图

#### 5.4 数据导出
- 支持Excel、CSV导出
- 定时报告邮件推送
- 数据API接口

### 六、高级功能

#### 6.1 A/B测试
- 同一目标多版本卡片测试
- 自动分配流量
- 统计各版本转化率

#### 6.2 智能优化
- 最佳发布时间推荐
- 热门话题推荐
- 封面图优化建议

#### 6.3 防刷机制
- IP限流（单IP访问频率限制）
- 验证码验证（异常流量时触发）
- 设备指纹追踪
- 黑名单管理

#### 6.4 自动化工作流
- 定时生成短链接
- 自动回复设置
- 数据异常告警

### 七、系统管理（管理员）

#### 7.1 用户管理
- 用户列表、状态管理
- 权限分配
- 数据查看

#### 7.2 平台配置
- 各平台API密钥管理
- 平台开关控制
- 分享模板管理

#### 7.3 系统监控
- 服务健康状态
- 接口调用统计
- 错误日志查看

---

## 数据库设计

### 核心表结构

```sql
-- 用户表
users
- id (PK)
- email
- phone
- password_hash
- avatar
- role (admin/user)
- subscription_plan
- created_at
- updated_at

-- 短链接表
short_links
- id (PK)
- user_id (FK)
- platform (douyin/xiaohongshu/kuaishou/wechat/qq/weibo/bilibili)
- short_code
- target_url
- target_type (wechat_id/public_account/mini_app/website)
- target_value
- title
- description
- cover_image
- status (active/inactive/expired)
- expires_at
- created_at
- updated_at

-- 访问记录表
visit_logs
- id (PK)
- short_link_id (FK)
- user_id (FK)
- ip_address
- user_agent
- device_type
- os
- browser
- country
- province
- city
- referrer
- action (view/copy/save_qrcode/add_success)
- created_at

-- 平台配置表
platform_configs
- id (PK)
- platform
- config_key
- config_value
- is_active

-- 模板表
templates
- id (PK)
- user_id (FK, nullable for system templates)
- name
- platform
- title
- description
- cover_image
- is_system
- created_at

-- 团队成员表（企业版）
team_members
- id (PK)
- team_owner_id (FK to users)
- member_id (FK to users)
- role (admin/member)
- permissions (JSON)
- created_at
```

---

## 页面规划

### 前端页面结构

```
app/
├── (auth)/                    # 认证相关（不显示侧边栏）
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── layout.tsx
│
├── (dashboard)/               # 仪表盘（显示侧边栏）
│   ├── layout.tsx
│   ├── page.tsx              # 首页仪表盘
│   │
│   ├── links/                # 短链接管理
│   │   ├── page.tsx          # 链接列表
│   │   ├── create/page.tsx   # 创建链接
│   │   └── [id]/edit/page.tsx # 编辑链接
│   │
│   ├── platforms/            # 平台管理
│   │   └── page.tsx          # 平台配置
│   │
│   ├── templates/            # 模板库
│   │   ├── page.tsx          # 模板列表
│   │   └── create/page.tsx   # 创建模板
│   │
│   ├── statistics/           # 数据统计
│   │   ├── page.tsx          # 概览
│   │   ├── links/page.tsx    # 链接统计
│   │   └── platforms/page.tsx # 平台统计
│   │
│   ├── settings/             # 设置
│   │   ├── profile/page.tsx  # 个人资料
│   │   ├── account/page.tsx  # 账号设置
│   │   └── team/page.tsx     # 团队管理（企业版）
│   │
│   └── admin/                # 系统管理（仅管理员）
│       ├── users/page.tsx
│       ├── platforms/page.tsx
│       └── system/page.tsx
│
├── api/                       # API路由
│   ├── auth/
│   ├── links/
│   ├── platforms/
│   ├── statistics/
│   └── admin/
│
├── layout.tsx                 # 根布局
└── page.tsx                   # 落地页

components/
├── ui/                        # shadcn/ui 组件
├── layout/                    # 布局组件
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── breadcrumb.tsx
├── links/                     # 短链接相关组件
│   ├── link-card.tsx
│   ├── link-form.tsx
│   ├── platform-selector.tsx
│   └── share-preview.tsx
├── statistics/                # 统计组件
│   ├── stats-card.tsx
│   ├── chart-line.tsx
│   ├── chart-pie.tsx
│   └── chart-map.tsx
└── platforms/                 # 平台组件
    ├── douyin-share.tsx
    ├── xiaohongshu-share.tsx
    └── platform-icon.tsx
```

---

## 开发阶段

### 阶段一：基础架构（Week 1）
1. 初始化Next.js项目 + shadcn/ui
2. 配置Tailwind CSS主题
3. 搭建数据库（PostgreSQL + Prisma）
4. 实现基础认证系统
5. 搭建页面布局和路由

### 阶段二：核心功能（Week 2-3）
1. 短链接CRUD功能
2. 多平台适配器实现
3. 分享卡片编辑器
4. 基础数据统计

### 阶段三：平台集成（Week 4）
1. 抖音开放平台对接
2. OG标签优化
3. 各平台分享SDK集成
4. 数据回传处理

### 阶段四：高级功能（Week 5）
1. 高级统计分析
2. A/B测试功能
3. 防刷机制
4. 模板系统

### 阶段五：优化上线（Week 6）
1. 性能优化
2. 安全加固
3. 测试完善
4. 部署上线

---

## 技术实现要点

### 1. shadcn/ui 组件清单
```bash
# 基础组件
npx shadcn@latest add button card input label badge avatar

# 表单组件
npx shadcn@latest add form select textarea checkbox radio-group switch

# 数据展示
npx shadcn@latest add table data-table pagination tabs

# 反馈组件
npx shadcn@latest add dialog alert-dialog toast skeleton

# 导航组件
npx shadcn@latest add breadcrumb navigation-menu sidebar

# 图表（可选）
npx shadcn@latest add chart
```

### 2. 关键依赖
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "qrcode": "^1.5.3",
    "shortid": "^2.2.16"
  }
}
```

### 3. 环境变量
```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/private_traffic"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# 抖音开放平台
DOUYIN_CLIENT_KEY="your-client-key"
DOUYIN_CLIENT_SECRET="your-client-secret"

# 文件存储
UPLOAD_DIR="./uploads"
CDN_URL="https://your-cdn.com"

# 其他平台API密钥
XIAOHONGSHU_APP_ID=""
KUAISHOU_APP_ID=""
```

---

## 部署方案

### 开发环境
```bash
# 本地开发
npm run dev

# 数据库迁移
npx prisma migrate dev
npx prisma generate

# 种子数据
npx prisma db seed
```

### 生产环境
- **Vercel**: Next.js前端部署
- **Railway/Render**: Node.js后端 + PostgreSQL
- **Cloudflare R2/AWS S3**: 文件存储
- **CDN**: 静态资源加速

---

## 风险评估

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| 抖音API变更 | 高 | 关注官方文档，预留适配接口 |
| 平台封号风险 | 高 | 提供合规指南，限制发送频率 |
| 数据安全 | 中 | 加密存储，HTTPS传输，定期备份 |
| 性能瓶颈 | 中 | 缓存优化，数据库索引，CDN加速 |

---

## 后续迭代计划

### V1.1
- 微信小程序端
- AI智能文案生成
- 更多平台支持（知乎、贴吧等）

### V1.2
- 企业微信集成
- 自动化营销工作流
- 客户画像分析

### V2.0
- SaaS化多租户
- 开放API平台
- 第三方插件市场

---

## 开发里程碑记录

### 里程碑历史记录

#### 2026-03-12 - V1.0.0 核心功能完成
**主要更新内容：**
- ✅ **基础架构搭建**: Next.js 14 + TypeScript + Prisma + SQLite
- ✅ **用户认证系统**: JWT认证、注册/登录、bcrypt密码加密
- ✅ **数据库设计**: User、ShortLink、VisitLog、Template 模型
- ✅ **短链接CRUD**: 创建、列表、删除、二维码生成
- ✅ **多平台适配**: 支持7个平台（抖音、小红书、快手、微信、QQ、微博、B站）
- ✅ **分享卡片系统**: OG标签优化、实时预览、封面图支持
- ✅ **模板库**: 6个系统预设模板 + 自定义模板创建
- ✅ **基础统计**: 总访问量、独立访客统计
- ✅ **高级统计分析**: 访问趋势、平台分布、设备分析、24小时分布、TOP排行
- ✅ **个人中心**: 头像、昵称编辑、修改密码、会员等级显示
- ✅ **性能优化**: API缓存(5分钟)、数据库并行查询
- ✅ **安全加固**: IP限流防刷、安全响应头、SQL/XSS防护

**GitHub提交**: [8a59bb9](https://github.com/cooleye/private-traffic-system/commit/8a59bb9)

---

#### 2026-03-13 - V1.1.0 密码重置功能
**新增功能：**
- ✅ **密码重置功能**: 邮箱验证重置密码
  - 忘记密码页面 (/forgot-password)
  - 重置密码页面 (/reset-password)
  - 发送重置邮件 API
  - 验证令牌和重置密码 API
  - 登录页面添加"忘记密码"链接
- ✅ **安全增强**: IP限流保护、令牌1小时有效期

**技术实现：**
- 数据库添加 resetToken 和 resetTokenExpireAt 字段
- 使用随机32位令牌
- 邮件发送使用控制台输出（开发环境）
- TODO: 接入真实邮件服务（SendGrid/阿里云/AWS SES）

**GitHub提交**: [cd93248](https://github.com/cooleye/private-traffic-system/commit/cd93248)

---

#### 2026-03-13 - V1.2.0 短链接编辑功能
**新增功能：**
- ✅ **短链接编辑**: 支持修改链接信息
  - 编辑页面 (/dashboard/links/[id]/edit)
  - 支持修改：目标类型、目标值、标题、描述、封面图、状态
  - 平台字段不可修改（保持短码不变）
  - 保留分享卡片预览功能
- ✅ **链接删除**: Dashboard 支持删除链接
  - 带确认对话框防止误删
  - 删除后自动更新列表和统计
- ✅ **链接状态显示**: Dashboard 表格显示启用/禁用状态

**API更新：**
- `GET /api/links/[id]` - 获取链接详情
- `PUT /api/links/[id]` - 更新链接
- `DELETE /api/links/[id]` - 删除链接

**GitHub提交**: [d8abacd](https://github.com/cooleye/private-traffic-system/commit/d8abacd)

---

#### 2026-03-13 - V1.3.0 链接搜索筛选功能
**新增功能：**
- ✅ **链接搜索筛选**: Dashboard 支持多维度筛选
  - 关键词搜索（标题、描述、目标值、短码）
  - 平台筛选（7个平台）
  - 状态筛选（启用/禁用）
  - 排序功能（创建时间、点击量）
- ✅ **自动搜索**: 输入防抖300ms自动搜索
- ✅ **重置筛选**: 一键重置所有筛选条件

**API更新：**
- `GET /api/links?keyword=&platform=&status=&sortBy=&sortOrder=` - 支持筛选参数

**GitHub提交**: [1fce3ed](https://github.com/cooleye/private-traffic-system/commit/1fce3ed)

---

#### 2026-03-13 - V1.4.0 链接状态管理功能
**新增功能：**
- ✅ **链接过期时间**: 创建/编辑链接支持设置过期时间
- ✅ **自动过期检测**: 跳转页面自动检查链接是否过期
- ✅ **状态检查**: 跳转页面检查链接是否被禁用
- ✅ **过期提示**: 过期链接显示"该链接已过期"
- ✅ **禁用提示**: 禁用链接显示"该链接已被禁用"

**技术实现：**
- 数据库已支持 `expiresAt` 字段
- 前端添加 `datetime-local` 时间选择器
- 跳转时实时检查 `status` 和 `expiresAt`

**GitHub提交**: [1dfba5c](https://github.com/cooleye/private-traffic-system/commit/1dfba5c)

---

**待完成功能：**
- ⏸️ ~~批量操作（删除/导出）~~ - 暂缓开发
- ⏸️ ~~链接状态管理（启用/禁用/过期）~~ - 已完成
- ⏸️ Token刷新机制
- ⏸️ 地域分布统计
- ⏸️ 转化统计（点击→添加成功）
- ⏸️ 数据导出功能
- ⏸️ 抖音开放平台对接（需申请权限）
- ⏸️ 绑定第三方账号

---

### 版本更新日志模板

```
#### YYYY-MM-DD - vX.X.X 版本说明
**新增功能：**
- ✅ 功能1
- ✅ 功能2

**优化改进：**
- 🔧 优化1
- 🔧 优化2

**Bug修复：**
- 🐛 修复1
- 🐛 修复2

**GitHub提交**: [commit-hash](链接)
```

---

*计划制定完成，等待确认后开始实施。*
