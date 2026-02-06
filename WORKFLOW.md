# 教案管理系统开发流程

> **版本**: v1.0  
> **技术栈**: Vue 3 + TipTap/ProseMirror + TypeScript + Elysia.js + PostgreSQL + Docker Compose  
> **目标**: 高职院校教案编写管理 Web 应用

---

## 开发流程总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                        开发流程流水线                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Phase 0: 需求澄清                                                 │
│   └── 使用 brainstorming 技能                                       │
│       └── 与用户确认需求、约束、成功标准                              │
│                                                                     │
│   Phase 1: 架构设计                                                 │
│   └── 输出: docs/design/YYYY-MM-DD-architecture.md                  │
│       ├── 系统架构图                                                 │
│       ├── 数据模型设计                                               │
│       ├── API 设计                                                   │
│       └── Docker Compose 配置                                        │
│                                                                     │
│   Phase 2: 实施计划                                                 │
│   └── 使用 writing-plans 技能                                       │
│       └── 输出: docs/plans/YYYY-MM-DD-implementation.md             │
│           └── 详细的任务分解（每个任务2-5分钟）                       │
│                                                                     │
│   Phase 3: 执行开发                                                 │
│   └── 使用 using-git-worktrees + subagent-driven-development       │
│       └── 或: using-git-worktrees + executing-plans                │
│           ├── 每个任务：Coding Agent 实现                            │
│           ├── 规范审查（Spec Review）                                │
│           ├── 代码质量审查（Code Quality Review）                    │
│           └── 标记完成，进入下一任务                                  │
│                                                                     │
│   Phase 4: 完成与交付                                               │
│   └── 使用 finishing-a-development-branch                          │
│       ├── 最终代码审查                                               │
│       ├── 合并到 main 分支                                           │
│       ├── Docker 镜像构建                                            │
│       └── 部署文档                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 技术栈详情

### 前端
| 技术 | 用途 | 版本 |
|------|------|------|
| Vue 3 | 前端框架 | ^3.4 |
| Vite | 构建工具 | ^5.0 |
| TipTap | 富文本编辑器封装 | ^2.0 |
| ProseMirror | 底层编辑引擎 (TipTap依赖) | - |
| Pinia | 状态管理 | ^2.0 |
| Vue Router | 路由管理 | ^4.0 |
| Tailwind CSS | 样式框架 | ^3.4 |
| Axios | HTTP 客户端 | ^1.6 |

### 后端
| 技术 | 用途 | 版本 |
|------|------|------|
| TypeScript | 类型安全 | ^5.3 |
| Elysia.js | Web 框架 (Bun-based) | ^1.0 |
| Bun | JavaScript 运行时 | ^1.0 |
| Prisma | ORM | ^5.0 |
| Zod | 数据验证 | ^3.22 |

### 基础设施
| 技术 | 用途 | 版本 |
|------|------|------|
| PostgreSQL | 数据库 | 16 |
| Docker | 容器化 | 24.x |
| Docker Compose | 编排 | 2.x |
| Nginx | 反向代理 | 1.25 |

---

## Phase 0: 需求澄清 (brainstorming)

### 目标
与用户充分沟通，明确需求边界和成功标准。

### 关键问题清单
1. **用户认证方式** (账号密码/学校SSO/其他)
2. **教案数据结构** (基础字段/完整字段)
3. **协作需求** (个人/组内共享/完全开放)
4. **版本管理** (需要/不需要)
5. **部署环境** (内网/云端/混合)

### 输出
- 需求确认文档: `docs/design/YYYY-MM-DD-requirements.md`
- 用户故事列表
- 功能边界定义

---

## Phase 1: 架构设计

### 1.1 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        学校内网环境                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │   教师浏览器  │                                           │
│   └──────┬──────┘                                           │
│          │ HTTPS                                             │
│          ▼                                                   │
│   ┌──────────────────────────────────────────────────┐      │
│   │              Docker Compose Network               │      │
│   │                                                   │      │
│   │  ┌─────────┐     ┌─────────┐     ┌──────────┐   │      │
│   │  │  Nginx  │────▶│ Frontend│     │ Backend  │   │      │
│   │  │  :80    │     │  :5173  │     │  :3000   │   │      │
│   │  └─────────┘     └─────────┘     └────┬─────┘   │      │
│   │                                       │         │      │
│   │                               ┌───────▼──────┐  │      │
│   │                               │ PostgreSQL   │  │      │
│   │                               │   :5432      │  │      │
│   │                               └──────────────┘  │      │
│   └──────────────────────────────────────────────────┘      │
│                                                              │
│          │ (导出时外网访问)                                    │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  WPS API    │                                           │
│   │ (WebOffice) │                                           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 数据模型

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String   // hashed
  role      Role     @default(TEACHER)
  department String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teachingPlans TeachingPlan[]
}

model TeachingPlan {
  id           String   @id @default(uuid())
  title        String
  courseName   String
  className    String?
  duration     String?  // 课时安排
  
  // 教学目标 (富文本)
  objectives   Json?    // TipTap JSON
  
  // 教学重难点 (富文本)
  keyPoints    Json?    // TipTap JSON
  
  // 教学方法
  methods      String[]
  
  // 教学过程 (富文本)
  process      Json     // TipTap JSON
  
  // 板书设计 (富文本)
  blackboard   Json?    // TipTap JSON
  
  // 课后反思 (富文本)
  reflection   Json?    // TipTap JSON
  
  // 教学资源
  resources    String[] // 资源链接列表
  
  // 完整HTML (用于导出)
  htmlContent  String?  @db.Text
  
  status       PlanStatus @default(DRAFT)
  teacherId    String
  teacher      User     @relation(fields: [teacherId], references: [id])
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  TEACHER
  ADMIN
}

enum PlanStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 1.3 API 设计

```typescript
// 基础路径: /api/v1

// 认证
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

// 教案管理
GET    /plans              // 列表 (支持分页、搜索)
POST   /plans              // 创建
GET    /plans/:id          // 详情
PUT    /plans/:id          // 更新
DELETE /plans/:id          // 删除
POST   /plans/:id/duplicate // 复制

// 导出
POST   /export/preview     // 生成预览URL
POST   /export/word        // 导出Word
POST   /export/pdf         // 导出PDF
```

### 1.4 Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

  frontend:
    build: ./frontend
    environment:
      - VITE_API_BASE=/api/v1

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/teaching_plan
      - WPS_APP_ID=${WPS_APP_ID}
      - WPS_APP_SECRET=${WPS_APP_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=teaching_plan

volumes:
  postgres_data:
```

---

## Phase 2: 实施计划 (writing-plans)

### 任务分解原则
- 每个任务 **2-5分钟** 可完成
- 包含完整代码和测试
- 明确的验证步骤
- 频繁的 git commit

### 任务列表示例

#### Milestone 1: 基础架构 (Architecture)
- [ ] Task 1.1: 初始化 Bun + Elysia 后端项目
- [ ] Task 1.2: 配置 Prisma + PostgreSQL
- [ ] Task 1.3: 创建数据库模型
- [ ] Task 1.4: 实现基础 API 路由
- [ ] Task 1.5: 编写 Docker 配置

#### Milestone 2: 编辑器核心 (Editor Core)
- [ ] Task 2.1: 初始化 Vue 3 + Vite 前端
- [ ] Task 2.2: 安装并配置 TipTap + ProseMirror
- [ ] Task 2.3: 创建富文本编辑器组件
- [ ] Task 2.4: 实现教案表单组件
- [ ] Task 2.5: 创建教案编辑页面

#### Milestone 3: WPS 集成 (WPS Integration)
- [ ] Task 3.1: 封装 WPS API 服务
- [ ] Task 3.2: 实现 HTML 转 Word 模板
- [ ] Task 3.3: 前端导出功能
- [ ] Task 3.4: 预览功能

#### Milestone 4: 管理与认证 (Management & Auth)
- [ ] Task 4.1: 实现 JWT 认证
- [ ] Task 4.2: 教案列表页面
- [ ] Task 4.3: 教案搜索与筛选
- [ ] Task 4.4: 用户管理（管理员）

---

## Phase 3: 执行开发

### 3.1 选择执行策略

根据任务特性选择执行方式：

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 任务独立、可并行 | `executing-plans` + 多个 Coding Agent | 速度快 |
| 任务依赖、需协调 | `subagent-driven-development` | 质量高 |
| 复杂逻辑、需审查 | `subagent-driven-development` | 有审查环节 |

### 3.2 使用 Git Worktrees

每个 Milestone 创建独立 worktree：

```bash
# Milestone 1
git worktree add .worktrees/milestone-1-architecture -b milestone/architecture
cd .worktrees/milestone-1-architecture

# Milestone 2  
git worktree add .worktrees/milestone-2-editor -b milestone/editor

# 以此类推...
```

### 3.3 Coding Agent 使用规范

#### 启动 Agent（示例）

```bash
# 使用 Claude Code
bash pty:true workdir:./.worktrees/milestone-1-architecture \
  background:true \
  command:"claude '执行 Task 1.1: 初始化 Bun + Elysia 后端项目。要求：1) 使用 bun init 创建项目 2) 安装 elysia 和 @elysiajs/cors 3) 创建 src/index.ts 启动文件 4) 配置热重载 5) 提交 git commit'"
```

#### Agent 任务指令模板

```
**任务**: [Task ID] [Task Name]

**工作目录**: [worktree path]

**目标**: [一句话描述]

**具体要求**:
1. [具体步骤1]
2. [具体步骤2]
3. [具体步骤3]

**验证标准**:
- [ ] [验证点1]
- [ ] [验证点2]

**Git 提交**:
```bash
git add .
git commit -m "[type]: [description]"
```

**完成后报告**:
- 完成状态
- 遇到的问题
- 提交哈希

请开始执行。
```

### 3.4 审查流程 (subagent-driven-development)

每个任务完成后，执行两阶段审查：

#### 阶段 1: 规范审查 (Spec Review)
- 是否符合任务要求？
- 是否缺少功能？
- 是否有额外功能？

#### 阶段 2: 代码质量审查 (Code Quality Review)
- 代码风格是否一致？
- 是否有测试覆盖？
- 是否有潜在bug？

```bash
# 规范审查
sessions_spawn(
  agentId="shuri",
  task="审查以下代码是否符合规范 [task description]..."
)

# 代码质量审查  
sessions_spawn(
  agentId="friday",
  task="代码质量审查：检查代码风格、测试覆盖、潜在问题..."
)
```

---

## Phase 4: 完成与交付

### 4.1 合并流程

使用 `finishing-a-development-branch` 技能：

```bash
# 1. 最终审查
codex review --base main

# 2. 合并到 main
git checkout main
git merge milestone/architecture

# 3. 清理 worktree
git worktree remove .worktrees/milestone-1-architecture
```

### 4.2 Docker 构建

```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 推送到镜像仓库（如需要）
docker tag teaching-plan-system:latest registry.internal/teaching-plan:v1.0
docker push registry.internal/teaching-plan:v1.0
```

### 4.3 部署文档

```markdown
# 部署指南

## 环境要求
- Docker 24.x
- Docker Compose 2.x
- 4GB RAM, 2 CPU cores

## 部署步骤
1. 复制 docker-compose.prod.yml 到服务器
2. 创建 .env 文件（包含 WPS API 密钥）
3. 运行 docker-compose up -d
4. 执行数据库迁移: docker-compose exec backend bunx prisma migrate deploy
5. 访问 http://server-ip

## 备份
- 数据库: docker-compose exec db pg_dump ...
- 文件: 无（纯数据库存储）
```

---

## 开发规范

### Git 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式调整
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**:
```
feat(editor): add TipTap image upload

- Implement image drop handler
- Add image resize functionality
- Update toolbar with image button

Closes #123
```

### 代码规范

**TypeScript**:
- 严格模式启用
- 显式返回类型
- 避免 any

**Vue 3**:
- Composition API
- `<script setup>` 语法
- Props 显式类型定义

### 测试规范

- 每个功能必须有单元测试
- API 测试使用 Elysia 测试工具
- 前端组件使用 Vitest + Vue Test Utils

---

## 监控与维护

### 日志收集
```yaml
# docker-compose.yml 添加
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 健康检查
```typescript
// backend/src/routes/health.ts
app.get('/health', () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION 
  }
})
```

---

## 附录

### 环境变量模板

```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@db:5432/teaching_plan
JWT_SECRET=your-secret-key
WPS_APP_ID=your-wps-app-id
WPS_APP_SECRET=your-wps-app-secret
```

### 目录结构

```
teaching-plan-system/
├── docs/
│   ├── design/              # 设计文档
│   └── plans/               # 实施计划
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── views/           # 页面
│   │   ├── stores/          # Pinia stores
│   │   └── services/        # API 服务
│   └── Dockerfile
├── backend/                 # Elysia 后端
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务逻辑
│   │   └── models/          # 数据模型
│   ├── prisma/
│   │   └── schema.prisma    # 数据库模型
│   └── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

### 快速启动命令

```bash
# 开发环境启动
docker-compose up -d

# 后端开发 (热重载)
cd backend && bun dev

# 前端开发 (热重载)
cd frontend && npm run dev

# 数据库迁移
cd backend && bunx prisma migrate dev

# 生成 Prisma 客户端
cd backend && bunx prisma generate
```

---

*文档版本: v1.0*  
*创建时间: 2026-02-06*  
*遵循 Superpowers 开发方法论*
