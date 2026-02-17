# AGENTS.md - 教案管理系统开发指南

> 本文档面向 AI 编程助手，用于快速理解项目架构、开发规范和贡献流程。

## 项目概述

**教案管理系统**是一个面向高职院校教师的教案编写与管理平台，提供富文本教案编辑、模板管理、数据分析和文档导出功能。

### 核心功能
- **教案编辑**: 基于 TipTap/ProseMirror 的所见即所得编辑器，支持多媒体、表格、教学排版块
- **模板系统**: 可复用的教案模板库，支持快速创建教案
- **教学计划管理**: 学期计划、周计划和课程表管理
- **数据分析**: 工作量统计、执行分析、质量评分、趋势分析
- **文档导出**: Word/Excel/PDF 格式导出

### 技术架构
```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose 编排                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  Frontend   │◄──►│   Backend   │◄──►│   PostgreSQL        │ │
│  │   Vue 3     │    │  Elysia.js  │    │      :5432          │ │
│  │   :5173     │    │   :3000     │    │                     │ │
│  └─────────────┘    └──────┬──────┘    └─────────────────────┘ │
│                            │                                    │
│                     ┌──────▼──────┐                            │
│                     │ Export      │                            │
│                     │ Service     │                            │
│                     │ (Python)    │                            │
│                     │   :8000     │                            │
│                     └─────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端 (frontend/)
| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue 3](https://vuejs.org/) | ^3.5.27 | 渐进式前端框架 |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.3 | 类型安全开发 |
| [Vite](https://vitejs.dev/) | ^7.2.4 | 构建工具 |
| [TipTap](https://tiptap.dev/) | ^3.19.0 | 无头富文本编辑器 |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.4 | 状态管理 |
| [Vue Router](https://router.vuejs.org/) | ^4 | 路由管理 |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.1.18 | 原子化 CSS 框架 |
| [ECharts](https://echarts.apache.org/) | ^6.0.0 | 数据可视化 |
| [Axios](https://axios-http.com/) | ^1.13.4 | HTTP 客户端 |
| [Vitest](https://vitest.dev/) | ^4.0.18 | 单元测试框架 |

### 后端 (backend/)
| 技术 | 版本 | 用途 |
|------|------|------|
| [Bun](https://bun.sh/) | ^1.0 | JavaScript 运行时 |
| [Elysia.js](https://elysiajs.com/) | ^1.4.22 | 高性能 HTTP 框架 |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | 类型安全开发 |
| [Prisma ORM](https://www.prisma.io/) | ^7.3.0 | 数据库访问层 |
| [PostgreSQL](https://www.postgresql.org/) | 16 | 关系型数据库 |
| [Zod](https://zod.dev/) | ^4.3.6 | 运行时类型校验 |
| [JWT](https://jwt.io/) | @elysiajs/jwt | 身份认证 |
| [lru-cache](https://www.npmjs.com/package/lru-cache) | ^11.2.5 | 内存缓存 |

### 导出服务 (export-service/)
| 技术 | 版本 | 用途 |
|------|------|------|
| [Python](https://www.python.org/) | 3.11 | 编程语言 |
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115.0 | Web 框架 |
| [python-docx](https://python-docx.readthedocs.io/) | 1.1.2 | Word 文档生成 |
| [Uvicorn](https://www.uvicorn.org/) | 0.32.0 | ASGI 服务器 |
| [Pydantic](https://docs.pydantic.dev/) | 2.9.0 | 数据验证 |

## 项目结构

```
teaching-plan-system/
├── .ai/                        # AI 开发配置和流程文档
│   └── INSTRUCTIONS.md         # 详细的 Superpowers 开发流程
├── .codex/                     # OpenSpec 技能配置
│   └── skills/                 # 自定义技能定义
├── backend/                    # Elysia.js 后端服务
│   ├── src/
│   │   ├── index.ts            # 服务入口
│   │   ├── lib/
│   │   │   ├── prisma.ts       # Prisma 客户端
│   │   │   └── auth.ts         # 认证工具
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT 认证中间件
│   │   ├── routes/             # API 路由
│   │   │   ├── auth.ts         # 认证相关接口
│   │   │   ├── teaching-plans.ts  # 教案 CRUD
│   │   │   ├── plan-templates.ts  # 模板管理
│   │   │   ├── export.ts       # 导出接口
│   │   │   └── analytics.ts    # 数据分析接口
│   │   ├── utils/
│   │   │   └── quality.ts      # 质量评分算法
│   │   └── test-utils/         # 测试工具
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型定义
│   │   └── migrations/         # 数据库迁移文件
│   ├── package.json            # 依赖配置
│   ├── tsconfig.json           # TypeScript 配置
│   └── Dockerfile              # 容器构建配置
├── frontend/                   # Vue 3 前端应用
│   ├── src/
│   │   ├── main.ts             # 应用入口
│   │   ├── App.vue             # 根组件
│   │   ├── router/
│   │   │   └── index.ts        # 路由配置
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── auth.ts         # 认证状态
│   │   │   ├── plan.ts         # 教案状态
│   │   │   ├── planTemplate.ts # 模板状态
│   │   │   └── analytics.ts    # 分析数据状态
│   │   ├── api/                # API 客户端
│   │   │   └── analytics.ts
│   │   ├── views/              # 页面视图
│   │   │   ├── LoginView.vue   # 登录页
│   │   │   ├── HomeView.vue    # 首页/教案列表
│   │   │   ├── EditorView.vue  # 教案编辑器
│   │   │   └── AnalyticsView.vue  # 数据分析
│   │   └── components/         # 可复用组件
│   │       ├── TipTapEditor.vue    # 富文本编辑器
│   │       ├── editor-slash/       # Slash 菜单
│   │       ├── editor-nodes/       # 自定义节点
│   │       └── analytics/          # 图表组件
│   ├── package.json            # 依赖配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── vite.config.ts          # Vite 构建配置
│   ├── vitest.config.ts        # 测试配置
│   └── Dockerfile              # 容器构建配置
├── export-service/             # Python 导出服务
│   ├── main.py                 # FastAPI 应用
│   ├── requirements.txt        # Python 依赖
│   └── Dockerfile              # 容器构建配置
├── docs/                       # 项目文档
│   ├── design/                 # 设计文档
│   ├── plans/                  # 实施计划
│   └── review/                 # 代码审查记录
├── memory/                     # 开发记忆/日志
├── openspec/                   # OpenSpec 配置
│   └── config.yaml
├── docker-compose.yml          # 本地开发编排
├── PROJECT_SUMMARY.md          # 项目总结
├── README.md                   # 项目说明
└── AGENTS.md                   # 本文档
```

## 快速开始

### 环境要求
- [Docker](https://www.docker.com/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/) 2.0+

### 启动开发环境

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 初始化数据库（首次运行）
docker-compose exec backend bun run db:migrate
docker-compose exec backend bun run db:seed

# 3. 访问服务
# 前端界面: http://localhost:5173
# 后端 API: http://localhost:3000
# 导出服务: http://localhost:8001
# 数据库:   localhost:5433
```

### 默认账号
- **管理员**: `admin` / `admin123`
- **教师**: `teacher1` / `teacher123`

## 常用命令

### 后端命令 (在 backend/ 目录执行)

```bash
# 开发模式（热重载）
bun dev

# 运行测试
bun test
bun test:watch

# 数据库操作
bun run db:generate    # 生成 Prisma Client
bun run db:migrate     # 执行数据库迁移
bun run db:push        # 推送模型变更
bun run db:studio      # 打开 Prisma Studio
bun run db:seed        # 导入种子数据
```

### 前端命令 (在 frontend/ 目录执行)

```bash
# 开发模式
bun dev

# 生产构建
bun run build

# 预览生产构建
bun run preview

# 运行测试
bun test
bun run test:watch
bun run test:coverage
```

### Docker 命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service]

# 重启服务
docker-compose restart [service]

# 停止所有服务
docker-compose down

# 完全重置（包括数据卷）
docker-compose down -v
```

## 开发规范

### 开发流程

本项目遵循 **Superpowers + Coding Agent** 方法论，核心原则：

1. **测试先行 (TDD)**: RED → GREEN → REFACTOR
2. **系统调试**: 根因调查 → 模式分析 → 假设验证 → 实施修复
3. **验证前置**: 任何声明必须有证据支撑
4. **代码审查**: 强制代码审查流程

详细流程参见 `.ai/INSTRUCTIONS.md`

### Git 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(editor): add timeline block node

- Implement lessonTimeline node type
- Add slash menu integration
- Include serialization support

Closes #123
```

### TypeScript 代码规范

- **严格模式**: 启用所有严格类型检查选项
- **显式类型**: 函数参数和返回值必须显式声明类型
- **避免 any**: 禁止使用 `any` 类型，使用 `unknown` 配合类型守卫
- **命名规范**:
  - 组件名: PascalCase (如 `TipTapEditor.vue`)
  - 工具函数: camelCase (如 `calculateQuality()`)
  - 类型/接口: PascalCase (如 `TeachingPlanData`)
  - 常量: SCREAMING_SNAKE_CASE

### Vue 3 代码规范

- **组合式 API**: 使用 `<script setup>` 语法
- **Props 定义**: 使用显式类型定义
- **事件命名**: 使用 kebab-case (如 `@update:model`)
- **样式**: 优先使用 Tailwind CSS，复杂样式使用 scoped CSS

### 测试规范

- **测试文件命名**: `[filename].test.ts` 或 `[filename].spec.ts`
- **测试位置**: 与源文件同目录或 `__tests__/` 子目录
- **覆盖率要求**: 核心逻辑必须达到 80%+ 覆盖率

**后端测试示例**:
```typescript
import { describe, expect, test } from 'bun:test'

describe('calculatePlanQuality', () => {
  test('should return perfect score for complete plan', () => {
    const plan = createCompletePlan()
    const score = calculatePlanQuality(plan)
    expect(score).toBe(100)
  })
})
```

**前端测试示例**:
```typescript
import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('QualityChart', () => {
  test('renders chart with correct data', () => {
    const wrapper = mount(QualityChart, {
      props: { data: mockQualityData }
    })
    expect(wrapper.find('.chart-container').exists()).toBe(true)
  })
})
```

## 数据模型

### 核心实体 (Prisma Schema)

```prisma
// 用户
model User {
  id            String   @id @default(uuid())
  username      String   @unique
  email         String   @unique
  password      String   // bcrypt 哈希
  role          UserRole @default(TEACHER)  // ADMIN | TEACHER
  department    String?
  teachingPlans TeachingPlan[]
  planTemplates PlanTemplate[]
}

// 教案
model TeachingPlan {
  id            String             @id @default(uuid())
  title         String
  courseName    String
  className     String
  duration      Int                @default(45)
  objectives    String             @db.Text  // HTML 内容
  keyPoints     String             @db.Text
  process       String             @db.Text
  blackboard    String?            @db.Text
  reflection    String?            @db.Text
  methods       String?            @db.Text
  resources     String?            @db.Text
  htmlContent   String             @db.Text  // 完整 HTML
  contentJson   Json?                        // TipTap JSON
  status        TeachingPlanStatus @default(DRAFT)
  teacherId     String
  teacher       User               @relation(fields: [teacherId], references: [id])
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
}

// 教案模板
model PlanTemplate {
  id            String   @id @default(uuid())
  title         String
  courseName    String
  className     String
  duration      Int      @default(45)
  objectives    String   @db.Text
  keyPoints     String   @db.Text
  process       String   @db.Text
  blackboard    String?  @db.Text
  reflection    String?  @db.Text
  methods       String?  @db.Text
  resources     String?  @db.Text
  htmlContent   String   @db.Text
  contentJson   Json?
  tags          String[] @default([])
  teacherId     String
  teacher       User     @relation(fields: [teacherId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## API 设计

### 认证接口
```
POST   /auth/register       # 用户注册
POST   /auth/login          # 用户登录
GET    /auth/me             # 获取当前用户信息
```

### 教案接口
```
GET    /teaching-plans              # 获取教案列表（支持分页、搜索）
POST   /teaching-plans              # 创建教案
GET    /teaching-plans/:id          # 获取教案详情
PUT    /teaching-plans/:id          # 更新教案
DELETE /teaching-plans/:id          # 删除教案
POST   /teaching-plans/:id/duplicate # 复制教案
```

### 模板接口
```
GET    /plan-templates        # 获取模板列表
POST   /plan-templates        # 创建模板
GET    /plan-templates/:id    # 获取模板详情
PUT    /plan-templates/:id    # 更新模板
DELETE /plan-templates/:id    # 删除模板
```

### 导出接口
```
POST   /export/preview       # 获取导出预览
POST   /export/word          # 导出为 Word
POST   /export/excel         # 导出为 Excel
POST   /export/pdf           # 导出为 PDF
```

### 分析接口
```
GET    /analytics/workload   # 工作量统计
GET    /analytics/execution  # 执行分析
GET    /analytics/quality    # 质量评分
GET    /analytics/trends     # 趋势分析
```

## 安全注意事项

### 认证与授权
- 所有 API 路由（除登录/注册外）需要 JWT 认证
- JWT Token 在响应头 `Authorization: Bearer <token>` 中传递
- Token 有效期和密钥通过环境变量配置
- 密码使用 bcrypt 哈希存储

### 环境变量
```bash
# 后端 (.env)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/teaching_plan_system
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
EXPORT_SERVICE_URL=http://export-service:8000

# 前端 (.env)
VITE_API_BASE=/api
```

### 数据库安全
- 生产环境使用强密码
- 数据库端口不暴露到公网（仅内部容器访问）
- 定期备份数据卷

### 输入验证
- 所有用户输入使用 Zod 进行运行时验证
- 防止 SQL 注入（使用 Prisma ORM 参数化查询）
- 防止 XSS（TipTap 内容自动转义）

## 性能优化

### 已实施的优化
- **Code Splitting**: AnalyticsView 从 1.1MB → 3.65kB (99.7%↓)
- **LRU 缓存**: 5分钟 TTL 减少数据库查询，API 响应提升 80%
- **懒加载**: ECharts 按需加载
- **首屏优化**: ~1.2MB → ~135kB (88%↓)

### 性能监控
- 后端 API 响应时间监控
- 前端首屏加载时间追踪
- 内存使用情况监控

## 故障排查

### 常见问题

**数据库连接失败**:
```bash
# 检查 PostgreSQL 健康状态
docker-compose logs postgres
# 确认数据库已初始化
docker-compose exec backend bun run db:migrate
```

**前端热重载失效**:
```bash
# 重启前端容器
docker-compose restart frontend
```

**类型错误**:
```bash
# 重新生成 Prisma Client
cd backend && bun run db:generate
# 检查 TypeScript 类型
cd frontend && npx vue-tsc --noEmit
```

## 参考资料

- [项目 README](./README.md)
- [开发流程文档](./.ai/INSTRUCTIONS.md)
- [项目总结](./PROJECT_SUMMARY.md)
- [设计文档](./docs/design/)
- [实施计划](./docs/plans/)

---

*文档版本: v1.0*  
*最后更新: 2026-02-16*  
*语言: 中文 (项目主要使用中文注释和文档)*
