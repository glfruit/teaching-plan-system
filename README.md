# 📚 教案管理系统

> 面向高职院校教师的教案编写与管理平台

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Vue.js](https://img.shields.io/badge/vue.js-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## ✨ 功能特性

### 📖 教案编辑
- **富文本编辑器**：基于 TipTap/ProseMirror 的所见即所得编辑器
- **多媒体支持**：图片插入、表格编辑、下划线标记
- **模板系统**：可复用的教案模板库
- **Word 导出**：一键生成标准格式教案文档

### 📅 教学计划管理
- **学期计划**：整学期的教学目标与进度规划
- **周计划**：每周详细教学安排
- **课程表**：可视化的课程时间分配

### 📊 数据分析
- **工作量统计**：教师工作量可视化分析
- **执行分析**：教学计划完成情况追踪
- **质量评分**：多维度教案质量评估
- **趋势分析**：历史数据对比与趋势预测
- **报表导出**：Excel/PDF 格式数据导出

### 🔐 用户管理
- **角色区分**：管理员/教师双角色
- **JWT 认证**：安全的身份验证机制

## 🛠️ 技术栈

### 后端
| 技术 | 用途 |
|------|------|
| [Bun](https://bun.sh/) + [Elysia.js](https://elysiajs.com/) | 高性能 HTTP 服务端 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全开发 |
| [Prisma ORM](https://www.prisma.io/) | 数据库访问层 |
| [PostgreSQL](https://www.postgresql.org/) | 关系型数据库 |
| [Zod](https://zod.dev/) | 运行时类型校验 |
| [python-docx](https://python-docx.readthedocs.io/) | Word 文档生成 |

### 前端
| 技术 | 用途 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式前端框架 |
| [TipTap](https://tiptap.dev/) | 无头富文本编辑器 |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [ECharts](https://echarts.apache.org/) | 数据可视化 |
| [Tailwind CSS](https://tailwindcss.com/) | 原子化 CSS |
| [Vitest](https://vitest.dev/) | 单元测试 |

## 🚀 快速开始

### 环境要求
- [Docker](https://www.docker.com/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/) 2.0+

### 一键启动

```bash
# 克隆仓库
git clone https://github.com/glfruit/teaching-plan-system.git
cd teaching-plan-system

# 启动所有服务
docker-compose up -d

# 初始化数据库（首次运行）
docker-compose exec backend bun run db:migrate
docker-compose exec backend bun run db:seed
```

### 访问服务

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端界面 | http://localhost:5173 | 主要用户界面 |
| 后端 API | http://localhost:3000 | RESTful API |
| 导出服务 | http://localhost:8001 | Word/Excel/PDF 导出 |
| 数据库 | localhost:5433 | PostgreSQL |

### 默认账号
- **管理员**: `admin` / `admin123`
- **教师**: `teacher1` / `teacher123`

## 🧪 测试

```bash
# 后端测试
cd backend
bun test

# 前端测试
cd frontend
bun test
```

## 📁 项目结构

```
teaching-plan-system/
├── backend/                 # Elysia.js 后端
│   ├── src/
│   │   ├── index.ts        # 入口
│   │   ├── routes/         # API 路由
│   │   ├── utils/          # 工具函数
│   │   └── ...
│   ├── prisma/             # 数据库模型
│   └── tests/              # 测试文件
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── views/          # 页面视图
│   │   ├── components/     # 组件
│   │   ├── stores/         # Pinia 状态
│   │   └── api/            # API 客户端
│   └── ...
├── export-service/         # Python 导出服务
│   └── ...
├── docker-compose.yml      # Docker 编排
└── PROJECT_SUMMARY.md      # 项目总结
```

## 📈 性能优化

| 优化项 | 效果 |
|--------|------|
| Code Splitting | AnalyticsView 从 1.1MB → 3.65kB (99.7%↓) |
| LRU 缓存 | API 响应提升 80% |
| 懒加载 | ECharts 按需加载 |

## 📝 开发规范

本项目遵循严格的开发流程：

1. **测试先行 (TDD)** - RED → GREEN → REFACTOR
2. **Code Review** - 强制代码审查
3. **Superpowers 工作流** - 使用 AI Agent 协作开发
4. **Docker 优先** - 容器化部署

详见 [WORKFLOW.md](./WORKFLOW.md)

## 🐳 生产部署

```bash
# 生产环境构建
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📄 许可证

MIT License © 2026

---

**开发者**: OpenClaw AI Agent Team (Jarvis, Friday, Loki)
**项目地址**: https://github.com/glfruit/teaching-plan-system
