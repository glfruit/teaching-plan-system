# 教案管理系统架构设计

> **文档版本**: v1.0  
> **创建日期**: 2026-02-06  
> **目标**: 高职院校教案编写管理 Web 应用

---

## 1. 需求总结

### 1.1 功能需求
- 教师账号密码登录
- 教案编写（富文本编辑器）
- 教案管理（CRUD + 高级筛选）
- 导出 Word/PDF（WPS API）
- 基础教案模板（可扩展）
- 自动定时备份

### 1.2 非功能需求
- 部署: Docker Compose，学校内网
- 规模: < 50 并发用户
- 风格: 现代专业界面
- 安全: JWT 认证，数据加密

---

## 2. 系统架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         学校内网环境                              │
│                                                                  │
│   ┌─────────────────┐                                           │
│   │    教师浏览器     │                                           │
│   │   (Chrome/Edge)  │                                           │
│   └────────┬────────┘                                           │
│            │ HTTPS                                               │
│            ▼                                                     │
│   ┌─────────────────────────────────────────────────────┐       │
│   │              Docker Compose Network                  │       │
│   │                                                       │       │
│   │  ┌─────────────┐     ┌─────────────┐                 │       │
│   │  │    Nginx    │────▶│   Frontend  │                 │       │
│   │  │    :80      │     │  Vue 3 SPA  │                 │       │
│   │  │  反向代理    │     │   :5173     │                 │       │
│   │  └─────────────┘     └──────┬──────┘                 │       │
│   │                             │                        │       │
│   │                             ▼                        │       │
│   │  ┌──────────────────────────────────────────────┐   │       │
│   │  │              Backend (Elysia.js)              │   │       │
│   │  │  ┌────────────┐  ┌──────────┐  ┌──────────┐  │   │       │
│   │  │  │  Auth API  │  │ Plan API │  │Export API│  │   │       │
│   │  │  │  (JWT)     │  │ (CRUD)   │  │ (WPS)    │  │   │       │
│   │  │  └────────────┘  └──────────┘  └──────────┘  │   │       │
│   │  │                                              │   │       │
│   │  │  ┌──────────────────────────────────────┐   │   │       │
│   │  │  │        Business Logic Layer          │   │   │       │
│   │  │  │   (Services, Validators, Utils)      │   │   │       │
│   │  │  └──────────────────────────────────────┘   │   │       │
│   │  └──────────────────────┬──────────────────────┘   │       │
│   │                         │                         │       │
│   │                         ▼                         │       │
│   │  ┌────────────────────────────────────────────┐  │       │
│   │  │          Prisma ORM + PostgreSQL           │  │       │
│   │  │           (Data Persistence)               │  │       │
│   │  └────────────────────────────────────────────┘  │       │
│   └─────────────────────────────────────────────────────┘       │
│                                                                  │
│            │ (仅导出时访问外网)                                    │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │    WPS API      │                                           │
│   │  (WebOffice)    │                                           │
│   └─────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 组件说明

| 组件 | 技术 | 职责 |
|------|------|------|
| **Nginx** | nginx:alpine | 反向代理，静态资源服务 |
| **Frontend** | Vue 3 + Vite + TipTap | 用户界面，富文本编辑 |
| **Backend** | Elysia.js (Bun) | REST API，业务逻辑 |
| **Database** | PostgreSQL 16 | 数据持久化 |
| **Backup** | postgres:alpine | 定时数据库备份 |
| **WPS API** | 金山云服务 | 文档渲染与导出 |

---

## 3. 技术选型

### 3.1 选型理由

| 技术 | 选择理由 |
|------|----------|
| **Elysia.js** | 基于 Bun，性能优异；TypeScript 原生支持；API 设计简洁 |
| **Bun** | 比 Node.js 更快的启动速度；内置 bundler；原生 TypeScript |
| **Prisma** | 类型安全的 ORM；优秀的迁移工具；可视化数据管理 |
| **Vue 3** | 组件化开发；Composition API；优秀的生态系统 |
| **TipTap** | 基于 ProseMirror；高度可定制；Vue 3 原生支持 |
| **Tailwind CSS** | 实用优先；快速开发；一致的视觉风格 |

### 3.2 性能考量（小规模部署）

- **单实例部署**：< 50 并发，单容器足够
- **无 Redis**：小规模无需缓存层，数据库查询足够快
- **无负载均衡**：单 Nginx 足够
- **资源需求**：2 CPU + 4GB RAM

---

## 4. 数据模型

### 4.1 Prisma Schema

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String   // bcrypt 哈希
  role      Role     @default(TEACHER)
  department String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联
  teachingPlans TeachingPlan[]
  templates     Template[]

  @@map("users")
}

// 教案模型
model TeachingPlan {
  id          String     @id @default(uuid())
  title       String
  courseName  String
  className   String?
  duration    String?    // 课时安排，如 "2课时"
  
  // 富文本内容 (TipTap JSON)
  objectives  Json?      // 教学目标
  keyPoints   Json?      // 教学重难点
  process     Json       // 教学过程（核心）
  blackboard  Json?      // 板书设计
  reflection  Json?      // 课后反思
  
  // 其他字段
  methods     String[]   // 教学方法列表
  resources   String[]   // 教学资源链接
  
  // 导出用 HTML
  htmlContent String?    @db.Text
  
  // 元数据
  status      PlanStatus @default(DRAFT)
  templateId  String?    // 基于哪个模板创建
  teacherId   String
  
  // 时间戳
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // 关联
  teacher     User       @relation(fields: [teacherId], references: [id])
  template    Template?  @relation(fields: [templateId], references: [id])

  @@map("teaching_plans")
  @@index([teacherId])
  @@index([status])
  @@index([courseName])
}

// 教案模板模型
model Template {
  id             String   @id @default(uuid())
  name           String
  category       TemplateCategory @default(GENERAL)
  description    String?
  
  // 模板结构定义
  sections       Json     // [{ name: "教学目标", required: true }, ...]
  defaultContent Json     // 默认 TipTap JSON
  
  // 创建者
  createdById    String
  createdBy      User     @relation(fields: [createdById], references: [id])
  
  isSystem       Boolean  @default(false)  // 系统预设模板
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // 关联
  teachingPlans  TeachingPlan[]

  @@map("templates")
}

// 枚举定义
enum Role {
  TEACHER
  ADMIN
}

enum PlanStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum TemplateCategory {
  GENERAL     // 通用
  THEORY      // 理论课
  EXPERIMENT  // 实验课
  TRAINING    // 实训课
}
```

### 4.2 数据关系图

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    User     │       │   TeachingPlan   │       │  Template   │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ id (PK)          │       │ id (PK)     │
│ username    │   1:N │ title            │       │ name        │
│ email       │       │ courseName       │       │ category    │
│ password    │       │ className        │       │ sections    │
│ role        │       │ duration         │       │ isSystem    │
│ department  │       │ objectives (JSON)│◄──────┤ createdById │
│             │       │ keyPoints (JSON) │  N:1  │             │
│             │       │ process (JSON)   │       │             │
│             │       │ blackboard (JSON)│       │             │
│             │       │ reflection (JSON)│       │             │
│             │       │ methods []       │       │             │
│             │       │ resources []     │       │             │
│             │       │ htmlContent      │       │             │
│             │       │ status           │       │             │
│             │       │ teacherId (FK)   │       │             │
│             │       │ templateId (FK)  │       │             │
│             │       │ createdAt        │       │             │
└─────────────┘       └──────────────────┘       └─────────────┘
```

---

## 5. API 设计

### 5.1 认证模块

```typescript
// POST /api/v1/auth/register
// 注册（仅管理员可创建账号）
{
  username: string      // 3-20字符，字母数字下划线
  email: string         // 有效邮箱
  password: string      // 8-32字符，需包含字母和数字
  department?: string
}

// POST /api/v1/auth/login
// 登录
{
  username: string
  password: string
}
// Response: { token: string, user: { id, username, role } }

// GET /api/v1/auth/me
// 获取当前用户信息
// Response: { id, username, email, role, department }

// POST /api/v1/auth/logout
// 登出
```

### 5.2 教案模块

```typescript
// GET /api/v1/plans
// 获取教案列表（支持分页、筛选、搜索）
Query: {
  page?: number        // 默认 1
  pageSize?: number    // 默认 10
  status?: 'draft' | 'published' | 'archived'
  courseName?: string  // 课程名称筛选
  keyword?: string     // 标题关键词搜索
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}
// Response: { items: Plan[], total: number, page, pageSize }

// GET /api/v1/plans/:id
// 获取教案详情
// Response: 完整 Plan 对象

// POST /api/v1/plans
// 创建教案
{
  title: string
  courseName: string
  className?: string
  duration?: string
  templateId?: string  // 基于模板创建
  // 如果不传 templateId，使用默认空白
}
// Response: { id, ... }

// PUT /api/v1/plans/:id
// 更新教案（完整更新）
{
  title?: string
  courseName?: string
  className?: string
  duration?: string
  objectives?: TipTapJSON
  keyPoints?: TipTapJSON
  process?: TipTapJSON
  blackboard?: TipTapJSON
  reflection?: TipTapJSON
  methods?: string[]
  resources?: string[]
  status?: 'draft' | 'published' | 'archived'
}

// DELETE /api/v1/plans/:id
// 删除教案

// POST /api/v1/plans/:id/duplicate
// 复制教案
// Response: 新创建的 Plan
```

### 5.3 导出模块

```typescript
// POST /api/v1/export/preview
// 生成预览URL
{
  planId: string
}
// Response: { previewUrl: string, expiresAt: string }

// POST /api/v1/export/word
// 导出Word文档
{
  planId: string
}
// Response: 文件流 (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

// POST /api/v1/export/pdf
// 导出PDF文档
{
  planId: string
}
// Response: 文件流 (application/pdf)
```

### 5.4 模板模块

```typescript
// GET /api/v1/templates
// 获取所有可用模板
// Response: Template[]

// GET /api/v1/templates/:id
// 获取模板详情
// Response: 完整 Template 对象
```

---

## 6. 界面设计

### 6.1 风格定义

**现代专业风格**:
- **配色**: 蓝色主色调 (#3B82F6)，灰色中性色，白色背景
- **字体**: Inter / 思源黑体
- **圆角**: 8-12px 统一圆角
- **阴影**: 柔和阴影，层级清晰
- **布局**: 左侧导航 + 右侧主内容区

### 6.2 页面结构

```
┌─────────────────────────────────────────────────────┐
│  Logo          教案管理系统          用户名 ▼ [退出] │  ← Header
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  📋 我的教案 │     [+ 新建教案]                       │
│          │                                          │
│  📝 草稿箱  │     ┌─────────────────────────────┐   │
│          │     │  搜索...    [课程▼] [状态▼]   │   │  ← Filter
│  📚 已发布  │     └─────────────────────────────┘   │
│          │                                          │
│  🗄️ 归档   │     ┌─────────────────────────────┐   │
│          │     │ 📄 教案标题              草稿 │   │
│  ─────────  │     │ 课程名称 • 2024-01-15      [编辑]│   │  ← Card
│          │     └─────────────────────────────┘   │
│  ⚙️ 设置   │                                          │
│          │     ┌─────────────────────────────┐   │
└──────────┴─────┤ 📄 另一个教案          已发布│   │
                 │ 课程名称 • 2024-01-10   [编辑]│   │
                 └─────────────────────────────┘   │
                                                    │
                 [1] [2] [3] ... [10]              │  ← Pagination
                                                    │
└─────────────────────────────────────────────────────┘
```

### 6.3 编辑器页面

```
┌─────────────────────────────────────────────────────┐
│  ← 返回列表    教案编辑              [保存] [预览] [导出]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  [教案标题输入框...]                                 │
│                                                     │
│  课程名称: [____________]  授课班级: [____________] │
│  课时安排: [____________]                          │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📋 教学目标                    [展开/收起]   │ │
│  ├───────────────────────────────────────────────┤ │
│  │                                                │ │
│  │   [富文本编辑器 - TipTap]                      │ │
│  │   ┌────┬────┬────┬────┐                       │ │
│  │   │ B  │ I  │ H2 │ 🖼️ │  ← 工具栏             │ │
│  │   └────┴────┴────┴────┘                       │ │
│  │                                                │ │
│  │   学生能够理解...                              │ │
│  │   学生能够掌握...                              │ │
│  │                                                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📋 教学重难点                  [展开/收起]   │ │
│  ├───────────────────────────────────────────────┤ │
│  │   [富文本编辑器]                              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📋 教学过程 ✓ (必填)           [展开/收起]   │ │
│  ├───────────────────────────────────────────────┤ │
│  │   [富文本编辑器 - 核心内容]                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [+ 添加更多章节: 板书设计 / 课后反思 / 教学资源]    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. Docker Compose 配置

### 7.1 生产环境配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/html:/usr/share/nginx/html:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - VITE_API_BASE=/api/v1
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - WPS_APP_ID=${WPS_APP_ID}
      - WPS_APP_SECRET=${WPS_APP_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backup:
    image: postgres:16-alpine
    volumes:
      - ./backups:/backups
    environment:
      - PGPASSWORD=${DB_PASSWORD}
      - DB_USER=${DB_USER}
      - DB_NAME=${DB_NAME}
    command: >
      sh -c "
        echo '0 2 * * * pg_dump -h db -U $$DB_USER $$DB_NAME > /backups/backup_$$(date +\%Y\%m\%d_\%H\%M\%S).sql' | crontab -
        crond -f
      "
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
```

### 7.2 Nginx 配置

```nginx
# nginx/nginx.conf
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # 前端静态资源
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # API 代理
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # 前端路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 7.3 环境变量模板

```bash
# .env
# 数据库配置
DB_USER=teaching_plan_user
DB_PASSWORD=your_secure_password_here
DB_NAME=teaching_plan_db

# JWT 配置
JWT_SECRET=your_jwt_secret_key_min_32_characters

# WPS API 配置
WPS_APP_ID=your_wps_app_id
WPS_APP_SECRET=your_wps_app_secret
```

---

## 8. 安全设计

### 8.1 认证与授权
- **JWT Token**: HS256 签名，24小时有效期
- **密码存储**: bcrypt 哈希，cost factor 12
- **API 保护**: 所有非公开 API 需认证

### 8.2 数据安全
- **SQL 注入**: Prisma ORM 自动防护
- **XSS**: 前端转义输出，CSP 策略
- **CSRF**: 不适用（REST API + JWT）

### 8.3 网络安全
- **HTTPS**: 建议配置 SSL 证书
- **CORS**: 仅允许同源访问
- **Rate Limit**: 登录接口限流（5次/分钟）

---

## 9. 备份与恢复

### 9.1 自动备份
- **频率**: 每日凌晨 2:00
- **保留**: 最近 30 天备份
- **位置**: `./backups/` 目录

### 9.2 手动备份
```bash
# 进入备份容器
docker-compose exec backup sh

# 手动执行备份
pg_dump -h db -U teaching_plan_user teaching_plan_db > /backups/manual_$(date +%Y%m%d_%H%M%S).sql
```

### 9.3 数据恢复
```bash
# 停止应用
docker-compose down

# 恢复数据
docker-compose up -d db
docker-compose exec -T db psql -U teaching_plan_user -d teaching_plan_db < ./backups/backup_20240115_020000.sql

# 启动应用
docker-compose up -d
```

---

## 10. 部署清单

### 10.1 服务器要求
- **OS**: Linux (Ubuntu 22.04 LTS 推荐)
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk**: 50GB SSD
- **Network**: 内网访问，导出时需外网

### 10.2 部署步骤
```bash
# 1. 克隆代码
git clone <repository> /opt/teaching-plan-system
cd /opt/teaching-plan-system

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填写实际值

# 3. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 4. 执行数据库迁移
docker-compose exec backend bunx prisma migrate deploy

# 5. 初始化数据（可选）
docker-compose exec backend bun run seed

# 6. 验证
curl http://localhost/api/v1/health
```

---

*文档完成 - 准备进入实施计划阶段*
