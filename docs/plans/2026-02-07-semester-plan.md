# 教学计划模块实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现教学计划管理模块，支持学期计划、周计划、课程表和进度追踪。

**Architecture:** 扩展现有教案系统，增加 SemesterPlan、WeeklyPlan、CourseSchedule 模型，与 TeachingPlan 关联。

**Tech Stack:** Vue 3 + TypeScript + Elysia.js + PostgreSQL + Prisma

**Workdir:** `/Users/gorin/Projects/teaching-plan-system/.worktrees/feature/semester-plan`

---

## 前置条件

```bash
cd /Users/gorin/Projects/teaching-plan-system/.worktrees/feature/semester-plan
bun install  # 前端依赖
bun install  # 后端依赖（在 backend 目录）
bun prisma generate
```

---

## Task 1: 数据库模型设计（30分钟）

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260207000000_add_semester_plans/migration.sql`

**Step 1: 添加模型**

在 `schema.prisma` 中添加：

```prisma
enum PlanStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum WeekStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  ADJUSTED
}

model SemesterPlan {
  id           String       @id @default(uuid())
  teacherId    String
  courseName   String
  semester     String       // 如：2025-2026-1
  totalWeeks   Int
  weeklyHours  Int
  description  String?
  status       PlanStatus   @default(DRAFT)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  weeklyPlans  WeeklyPlan[]
  
  @@index([teacherId])
  @@index([semester])
  @@map("semester_plans")
}

model WeeklyPlan {
  id              String        @id @default(uuid())
  semesterPlanId  String
  weekNumber      Int
  startDate       DateTime
  endDate         DateTime
  plannedContent  String        // 计划内容
  actualContent   String?       // 实际内容
  status          WeekStatus    @default(PLANNED)
  teachingPlanId  String?       // 关联的教案
  notes           String?
  
  semesterPlan    SemesterPlan  @relation(fields: [semesterPlanId], references: [id], onDelete: Cascade)
  
  @@index([semesterPlanId])
  @@index([weekNumber])
  @@map("weekly_plans")
}

model CourseSchedule {
  id         String   @id @default(uuid())
  teacherId  String
  className  String
  courseName String
  dayOfWeek  Int      // 1-7
  period     Int      // 第几节
  classroom  String?
  semester   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([teacherId])
  @@index([semester])
  @@map("course_schedules")
}
```

**Step 2: 生成迁移**

```bash
cd backend
bunx prisma migrate dev --name add_semester_plans
bunx prisma generate
```

**Step 3: Commit**

```bash
git add backend/prisma/
git commit -m "feat: add semester plan models with migrations"
```

---

## Task 2: 后端 API - 学期计划（45分钟）

**Files:**
- Create: `backend/src/routes/semester-plans.ts`
- Modify: `backend/src/index.ts`

**实现内容：**
- CRUD API for SemesterPlan
- 自动生成周计划框架
- 与现有教案系统关联

**测试：**
```bash
bun test  # 必须全部通过
```

**Commit：**
```bash
git add backend/src/routes/semester-plans.ts backend/src/index.ts
git commit -m "feat: add semester plan API endpoints"
```

---

## Task 3: 后端 API - 周计划（45分钟）

**Files：**
- Modify: `backend/src/routes/semester-plans.ts`（添加周计划相关路由）

**实现内容：**
- 更新周计划内容
- 标记完成状态
- 关联教案

**测试：**
```bash
bun test  # 必须全部通过
```

**Commit：**
```bash
git commit -m "feat: add weekly plan API with teaching plan association"
```

---

## Task 4: 前端 Store - 教学计划（45分钟）

**Files：**
- Create: `frontend/src/stores/semester-plan.ts`
- Create: `frontend/src/stores/__tests__/semester-plan.test.ts`

**实现内容：**
- SemesterPlan store（Pinia）
- WeeklyPlan store
- 关联现有 plan store

**测试：**
```bash
bun test src/stores/__tests__/semester-plan.test.ts  # 必须通过
```

**Commit：**
```bash
git add frontend/src/stores/semester-plan.ts frontend/src/stores/__tests__/
git commit -m "feat: add semester plan store with tests"
```

---

## Task 5: 学期计划列表页面（45分钟）

**Files：**
- Create: `frontend/src/views/SemesterPlansView.vue`
- Modify: `frontend/src/router/index.ts`

**实现内容：**
- 学期计划列表
- 创建/编辑学期计划
- 状态管理（草稿/进行中/已完成）

**Commit：**
```bash
git add frontend/src/views/SemesterPlansView.vue frontend/src/router/index.ts
git commit -m "feat: add semester plans list view"
```

---

## Task 6: 周计划页面（45分钟）

**Files：**
- Create: `frontend/src/views/WeeklyPlanView.vue`

**实现内容：**
- 周计划详情
- 编辑每周内容
- 关联教案
- 标记完成状态

**Commit：**
```bash
git add frontend/src/views/WeeklyPlanView.vue
git commit -m "feat: add weekly plan view with teaching plan association"
```

---

## Task 7: 课程表管理（45分钟）

**Files：**
- Create: `frontend/src/views/CourseScheduleView.vue`
- Create: `backend/src/routes/course-schedule.ts`

**实现内容：**
- 课程表展示
- 添加/编辑课程
- 冲突检测

**测试：**
```bash
bun test  # 必须全部通过
```

**Commit：**
```bash
git add frontend/src/views/CourseScheduleView.vue backend/src/routes/course-schedule.ts
git commit -m "feat: add course schedule management"
```

---

## Task 8: 进度追踪（30分钟）

**Files：**
- Modify: `frontend/src/views/SemesterPlansView.vue`（添加进度显示）

**实现内容：**
- 计划进度可视化
- 完成率统计
- 延期提醒

**Commit：**
```bash
git commit -m "feat: add semester plan progress tracking"
```

---

## 验证清单

所有 Task 完成后必须验证：

```bash
# Backend tests
cd backend && bun test
# Expected: 40+ tests pass

# Frontend tests
cd frontend && bun test
# Expected: 30+ tests pass

# Build
cd frontend && bun run build
# Expected: Build successful

# TypeScript
cd frontend && npx tsc --noEmit
# Expected: No errors
```

---

## 完成标准

- [ ] 所有 Task 完成
- [ ] 所有测试通过（Backend + Frontend）
- [ ] 构建成功
- [ ] 功能完整（学期计划/周计划/课程表/进度追踪）
- [ ] 与现有教案系统关联正常

---

*Phase 2 实施计划，预计工期 4-5 小时*
