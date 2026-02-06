# 教案管理系统开发流程

> **版本**: v2.0  
> **技术栈**: Vue 3 + TipTap/ProseMirror + TypeScript + Elysia.js + PostgreSQL + Docker Compose  
> **目标**: 高职院校教案编写管理 Web 应用  
> **方法论**: Superpowers + Coding Agent

---

## 核心原则

### 铁律 (Iron Laws)

```
1. 有技能必须用技能 (Using Superpowers)
   └── 即使1%的可能性也要检查技能
   
2. 测试先行 (TDD)
   └── NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
   
3. 系统调试 (Systematic Debugging)
   └── NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
   
4. 验证前置 (Verification Before Completion)
   └── NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

---

## 完整开发流程

```
开始
  ↓
[1] brainstorming 
  └── 探索需求、确定方案、约束条件
  └── 输出: docs/design/requirements.md
  ↓
[2] writing-plans
  └── 编写详细实施计划（每个任务2-5分钟）
  └── 输出: docs/plans/YYYY-MM-DD-implementation.md
  ↓
[3] using-git-worktrees
  └── 创建隔离工作区 .worktrees/feature/xxx
  └── 验证: 目录在 .gitignore 中
  ↓
[4] test-driven-development
  └── RED: 写失败测试
  └── GREEN: 最小实现
  └── REFACTOR: 重构优化
  ↓
[5] subagent-driven-development 或 executing-plans
  └── 使用 coding-agent 执行 (pty:true + workdir)
  └── 每个任务后：规范审查 + 代码质量审查
  ↓
[6] systematic-debugging (如需要)
  └── Phase 1: 根因调查
  └── Phase 2: 模式分析
  └── Phase 3: 假设验证
  └── Phase 4: 实施修复
  ↓
[7] verification-before-completion
  └── 运行验证命令
  └── 确认输出结果
  └── 证据先于声明
  ↓
[8] requesting-code-review
  └── 派遣 code-reviewer 子代理
  └── 处理反馈 (Critical/Important/Minor)
  ↓
[9] finishing-a-development-branch
  └── 合并到 main
  └── 清理 worktree
  └── Docker 构建与部署
  ↓
结束
```

---

## 技术栈详情

### 前端
| 技术 | 用途 | 版本 |
|------|------|------|
| Vue 3 | 前端框架 | ^3.4 |
| Vite | 构建工具 | ^5.0 |
| TipTap | 富文本编辑器封装 | ^2.0 |
| ProseMirror | 底层编辑引擎 | - |
| Pinia | 状态管理 | ^2.0 |
| Vue Router | 路由管理 | ^4.0 |
| Tailwind CSS | 样式框架 | ^3.4 |
| Axios | HTTP 客户端 | ^1.6 |

### 后端
| 技术 | 用途 | 版本 |
|------|------|------|
| TypeScript | 类型安全 | ^5.3 |
| Elysia.js | Web 框架 (Bun) | ^1.0 |
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

## Phase 详解

### Phase [1]: brainstorming

**触发条件**: 任何创意工作、新功能、行为修改

**目标**: 与用户充分沟通，明确需求边界

**关键问题清单**:
1. 用户认证方式 (账号密码/学校SSO/其他)
2. 教案数据结构 (基础版/标准版/完整版)
3. 协作需求 (个人/组内共享/完全开放)
4. 版本管理 (需要/不需要)
5. 部署环境 (内网/云端/Docker Compose)

**输出**:
- `docs/design/YYYY-MM-DD-requirements.md`
- 用户故事列表
- 功能边界定义

---

### Phase [2]: writing-plans

**触发条件**: 有明确需求后，编写实施计划

**原则**:
- 每个任务 **2-5分钟** 可完成
- 包含完整代码和测试
- 明确的验证步骤
- 频繁的 git commit

**计划模板**:
```markdown
# [Feature] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal**: [一句话描述]
**Architecture**: [2-3句话]
**Tech Stack**: [关键技术]

---

### Task N: [Task Name]

**Files:**
- Create: `path/to/file.ts`
- Modify: `path/to/file.ts:10-20`
- Test: `tests/path/test.ts`

**Step 1: Write failing test**
```typescript
test('should do X', () => {
  expect(function(input)).toBe(expected)
})
```

**Step 2: Run test to verify fails**
Run: `bun test tests/path/test.ts`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**
```typescript
function function(input) {
  return expected
}
```

**Step 4: Run test to verify passes**
Run: `bun test tests/path/test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add .
git commit -m "feat: add specific feature"
```
```

**输出**: `docs/plans/YYYY-MM-DD-implementation.md`

---

### Phase [3]: using-git-worktrees

**触发条件**: 开始执行计划前

**步骤**:
```bash
# 1. 检查目录优先级
ls -d .worktrees worktrees 2>/dev/null
# 或检查 CLAUDE.md

# 2. 确保目录被 gitignore
git check-ignore -q .worktrees || echo ".worktrees/" >> .gitignore

# 3. 创建 worktree
git worktree add .worktrees/feature/xxx -b feature/xxx

# 4. 进入工作区
cd .worktrees/feature/xxx

# 5. 运行项目设置
bun install  # 或 npm install

# 6. 验证干净基线
bun test     # 或 npm test
```

**验证清单**:
- [ ] 目录在 .gitignore 中
- [ ] Worktree 创建成功
- [ ] 依赖安装完成
- [ ] 测试通过 (0 failures)

---

### Phase [4]: test-driven-development

**触发条件**: 实现任何功能或修复 bug 前

**循环**: RED → GREEN → REFACTOR

**RED - 写失败测试**:
```typescript
test('retries failed operations 3 times', async () => {
  let attempts = 0
  const operation = () => {
    attempts++
    if (attempts < 3) throw new Error('fail')
    return 'success'
  }

  const result = await retryOperation(operation)

  expect(result).toBe('success')
  expect(attempts).toBe(3)
})
```

**验证 RED - 确认失败**:
```bash
bun test path/to/test.ts
# 必须看到: FAIL (feature missing, not typo)
```

**GREEN - 最小实现**:
```typescript
async function retryOperation(fn) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === 2) throw e
    }
  }
}
```

**验证 GREEN - 确认通过**:
```bash
bun test path/to/test.ts
# 必须看到: PASS
# 其他测试: 全部通过
```

**REFACTOR - 清理** (保持绿色):
- 移除重复
- 改善命名
- 提取辅助函数

---

### Phase [5]: subagent-driven-development / executing-plans

**选择策略**:
| 场景 | 推荐方式 |
|------|----------|
| 任务独立、可并行 | `executing-plans` |
| 任务依赖、需协调 | `subagent-driven-development` |

#### subagent-driven-development 流程

```
读取计划 → 提取所有任务 → 创建 TodoWrite
    ↓
任务 N:
    ├── 派遣实现子代理 (Coding Agent)
    │   └── 使用 pty:true + workdir
    ├── 实现、测试、提交
    ├── 派遣规范审查子代理
    │   └── 确认符合计划要求
    ├── 派遣代码质量审查子代理
    │   └── 检查代码风格、测试覆盖
    └── 标记完成
    ↓
所有任务完成
    ↓
派遣最终代码审查
    ↓
finishing-a-development-branch
```

#### Coding Agent 使用规范

**启动命令** (必须使用 pty:true):
```bash
# Codex (快速执行)
bash pty:true \
  workdir:~/Projects/teaching-plan-system/.worktrees/feature/xxx \
  background:true \
  command:"codex exec --full-auto 'Implement user authentication with JWT'"

# Claude Code (复杂任务)
bash pty:true \
  workdir:~/Projects/teaching-plan-system/.worktrees/feature/xxx \
  background:true \
  command:"claude 'Build teaching plan API endpoints with Elysia.js'"
```

**监控进度**:
```bash
process action:list
process action:log sessionId:XXX
process action:poll sessionId:XXX
```

**与 Agent 交互** (如需要输入):
```bash
process action:write sessionId:XXX data:"y"
process action:submit sessionId:XXX data:"yes"
```

**完成后自动通知**:
```bash
bash pty:true workdir:~/project background:true command:"codex --yolo '...

When finished, run: openclaw gateway wake --text \"Done: [summary]\" --mode now'"
```

---

### Phase [6]: systematic-debugging

**触发条件**: 任何 bug、测试失败、意外行为

**四阶段流程**:

#### Phase 1: 根因调查
1. **仔细阅读错误信息** - 不跳过任何错误
2. **稳定复现** - 确定复现步骤
3. **检查近期变更** - git diff, 最近提交
4. **收集证据** - 添加日志，追踪数据流

#### Phase 2: 模式分析
1. **找到工作示例** - 类似的成功代码
2. **对比参考实现** - 完整阅读，不跳过
3. **识别差异** - 列出所有不同点
4. **理解依赖** - 组件、配置、环境

#### Phase 3: 假设验证
1. **形成单一假设** - "X 是根因，因为 Y"
2. **最小化测试** - 一次只改一个变量
3. **验证后再继续** - 有效→Phase 4, 无效→新假设

#### Phase 4: 实施修复
1. **创建失败测试** - 复现 bug
2. **单一修复** - 解决根因，非症状
3. **验证修复** - 测试通过，无回归
4. **3+次修复失败** → 质疑架构

---

### Phase [7]: verification-before-completion

**触发条件**: 声称工作完成、修复成功、测试通过前

**门控函数**:
```
1. IDENTIFY: 什么命令证明这个声明？
2. RUN: 执行完整命令 (fresh, complete)
3. READ: 完整输出，检查退出码，统计失败
4. VERIFY: 输出是否确认声明？
   - NO: 说明实际状态和证据
   - YES: 带着证据声明
5. ONLY THEN: 做出声明
```

**验证示例**:
```bash
# 声明: "测试通过"
# 命令: bun test
# 必须看到: 34/34 pass, exit 0

# 声明: "构建成功"
# 命令: bun run build
# 必须看到: exit 0

# 声明: "Bug 已修复"
# 命令: 复现步骤 + 验证
# 必须看到: 原症状消失
```

**禁止用语**:
- ❌ "应该可以了"
- ❌ "看起来正确"
- ❌ "我觉得完成了"
- ❌ "Agent 说成功了"

**必须使用**:
- ✅ "运行了 X，看到 Y，所以 Z"

---

### Phase [8]: requesting-code-review

**触发条件**:
- 每个任务后 (subagent-driven-development)
- 完成功能后
- 合并到 main 前

**请求审查**:
```bash
# 获取 git SHA
BASE_SHA=$(git rev-parse HEAD~1)
HEAD_SHA=$(git rev-parse HEAD)
```

**派遣审查子代理**:
```
WHAT_WAS_IMPLEMENTED: [描述]
PLAN_OR_REQUIREMENTS: [计划引用]
BASE_SHA: [起始提交]
HEAD_SHA: [结束提交]
DESCRIPTION: [简要总结]
```

**处理反馈**:
- **Critical**: 立即修复
- **Important**: 修复后再继续
- **Minor**: 记录，稍后处理
- 如有异议，提供技术理由

---

### Phase [9]: finishing-a-development-branch

**触发条件**: 所有任务完成，测试通过，审查通过

**步骤**:
```bash
# 1. 最终审查
codex review --base main

# 2. 合并到 main
git checkout main
git merge feature/xxx

# 3. 清理 worktree
git worktree remove .worktrees/feature/xxx

# 4. Docker 构建
docker-compose -f docker-compose.prod.yml build

# 5. 部署
docker-compose up -d
```

---

## 项目架构

### 系统架构

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

### 数据模型 (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String
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
  duration     String?
  objectives   Json?    // TipTap JSON
  keyPoints    Json?    // TipTap JSON
  methods      String[]
  process      Json     // TipTap JSON
  blackboard   Json?    // TipTap JSON
  reflection   Json?    // TipTap JSON
  resources    String[]
  htmlContent  String?  @db.Text
  status       PlanStatus @default(DRAFT)
  teacherId    String
  teacher      User     @relation(fields: [teacherId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role { TEACHER ADMIN }
enum PlanStatus { DRAFT PUBLISHED ARCHIVED }
```

### API 设计

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/plans
POST   /api/v1/plans
GET    /api/v1/plans/:id
PUT    /api/v1/plans/:id
DELETE /api/v1/plans/:id
POST   /api/v1/plans/:id/duplicate

POST   /api/v1/export/preview
POST   /api/v1/export/word
POST   /api/v1/export/pdf
```

---

## 开发规范

### Git 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**: feat, fix, docs, style, refactor, test, chore

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
- `<script setup>`
- Props 显式类型

### 目录结构

```
teaching-plan-system/
├── docs/
│   ├── design/              # 设计文档
│   └── plans/               # 实施计划
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   └── services/
│   └── Dockerfile
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

---

## 快速命令

```bash
# 开发环境启动
docker-compose up -d

# 后端开发
cd backend && bun dev

# 前端开发
cd frontend && npm run dev

# 数据库迁移
cd backend && bunx prisma migrate dev

# 生成 Prisma 客户端
cd backend && bunx prisma generate

# 运行测试
bun test

# 构建生产
bun run build
```

---

*文档版本: v2.0*  
*更新时间: 2026-02-06*  
*遵循 Superpowers + Coding Agent 方法论*
