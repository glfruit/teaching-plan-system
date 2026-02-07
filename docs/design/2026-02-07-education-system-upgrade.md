# 教育管理系统升级设计文档

> **文档版本**: v1.0  
> **创建日期**: 2026-02-07  
> **目标**: 教案管理系统功能升级（教学计划 + 数据统计 + 模板系统）

---

## 1. 项目概述

### 1.1 目标
在现有教案管理系统基础上，增加教学计划管理、教案模板系统和数据统计分析功能，形成完整的**教育管理解决方案**。

### 1.2 背景
现有系统已支持教案编写、管理和导出，但缺乏：
- 宏观教学规划能力（学期/周计划）
- 教案复用机制（模板系统）
- 教学数据洞察（统计分析）

### 1.3 成功标准
- 教师可在 5 分钟内完成学期教学规划
- 教案创建时间缩短 50%（通过模板）
- 提供至少 3 种维度的教学数据报表

---

## 2. 功能模块

### 2.1 模块一：模板系统（基础）

#### 功能清单
| 功能 | 优先级 | 描述 |
|------|--------|------|
| 系统预设模板 | P0 | 理论课、实验课、实训课模板 |
| 自定义模板 | P0 | 教师创建个人模板 |
| 模板应用 | P0 | 新建教案时选择模板 |
| 模板分类 | P1 | 按课程类型/专业分类 |
| 从教案提取 | P1 | 优秀教案保存为模板 |

#### 用户价值
- **缩短备课时间**: 从空白开始 → 基于模板快速填充
- **保证规范性**: 统一教案结构，符合学校要求
- **经验复用**: 优秀教师经验通过模板传承

---

### 2.2 模块二：教学计划（核心）

#### 功能清单
| 功能 | 优先级 | 描述 |
|------|--------|------|
| 学期计划 | P0 | 创建学期/学年教学规划 |
| 周计划 | P0 | 每周教学安排，关联教案 |
| 课程表 | P0 | 管理所教班级课程安排 |
| 进度追踪 | P0 | 计划 vs 实际对比 |
| 计划调整 | P1 | 记录调整历史 |

#### 用户价值
- **宏观把控**: 清晰掌握整个学期教学节奏
- **有据可依**: 周计划指导备课，避免临时抱佛脚
- **及时纠偏**: 进度偏差自动提醒，支持动态调整

---

### 2.3 模块三：数据统计（增值）

#### 功能清单
| 功能 | 优先级 | 描述 |
|------|--------|------|
| 工作量统计 | P0 | 授课课时、教案数量 |
| 计划执行分析 | P0 | 完成率、匹配度 |
| 教案质量分析 | P1 | 完整度、更新频率 |
| 可视化报表 | P1 | 图表展示，导出功能 |
| 趋势分析 | P2 | 多学期对比 |

#### 用户价值
- **工作量证明**: 客观数据支撑教学工作量
- **教学反思**: 数据驱动，发现问题和改进点
- **管理支持**: 为教学管理者提供决策依据

---

## 3. 技术架构

### 3.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (Vue 3 SPA)                        │
├─────────────────────────────────────────────────────────────┤
│  教案管理 │ 教学计划 │ 模板系统 │ 数据统计 │ 用户中心        │
└───────────┴──────────┴──────────┴──────────┴────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     后端 (Elysia.js)                        │
├─────────────────────────────────────────────────────────────┤
│  教案API │ 计划API │ 模板API │ 统计API │ 用户API           │
└──────────┴─────────┴─────────┴─────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据库 (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  teaching_plans │ semester_plans │ templates │ statistics  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 数据模型扩展

```prisma
// 教案模板
model TeachingTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?
  category    String   // 分类：理论课/实验课/实训课
  structure   Json     // 模板结构（TipTap JSON）
  isSystem    Boolean  @default(false)
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 学期教学计划
model SemesterPlan {
  id           String       @id @default(uuid())
  teacherId    String
  courseName   String
  semester     String       // 如：2025-2026-1
  totalWeeks   Int
  weeklyHours  Int
  description  String?
  status       PlanStatus   @default(DRAFT)
  weeklyPlans  WeeklyPlan[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

// 周计划
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
  semesterPlan    SemesterPlan  @relation(fields: [semesterPlanId], references: [id])
}

// 课程表
model CourseSchedule {
  id            String   @id @default(uuid())
  teacherId     String
  className     String
  courseName    String
  dayOfWeek     Int      // 1-7
  period        Int      // 第几节
  classroom     String?
  semester      String
  createdAt     DateTime @default(now())
}

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
```

---

## 4. 界面设计

### 4.1 新增页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 模板市场 | `/templates` | 浏览和使用模板 |
| 我的模板 | `/templates/my` | 管理个人模板 |
| 学期计划 | `/plans/semester` | 创建和管理学期计划 |
| 周计划 | `/plans/weekly` | 查看和编辑周计划 |
| 课程表 | `/schedule` | 课程表管理 |
| 数据统计 | `/analytics` | 报表和分析 |

### 4.2 关键交互

**模板应用流程**:
```
新建教案 → 选择模板 → 预览模板 → 应用/取消 → 进入编辑器
```

**教学计划创建流程**:
```
创建学期计划 → 设置基本信息 → 划分单元 → 生成周计划框架
              → 完善每周内容 → 关联教案 → 启动执行
```

---

## 5. 实施规划

### 5.1 开发阶段

| 阶段 | 模块 | 工期 | 依赖 |
|------|------|------|------|
| Phase 1 | 模板系统 | 2周 | 无 |
| Phase 2 | 教学计划 | 3-4周 | 模板系统 |
| Phase 3 | 数据统计 | 2-3周 | 前两阶段 |

**总工期**: 7-9周

### 5.2 里程碑

- **M1** (2周): 模板系统上线，支持基础模板功能
- **M2** (4周): 教学计划上线，支持学期/周计划管理
- **M3** (6周): 数据统计上线，基础报表功能
- **Final** (7-9周): 完整测试、优化、文档

---

## 6. 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 计划与教案关联复杂 | 中 | 高 | 简化关联逻辑，支持手动和自动两种模式 |
| 统计数据量大性能问题 | 中 | 中 | 分页查询、缓存机制、异步统计 |
| 用户学习成本 | 中 | 中 | 提供引导教程、保留旧版功能过渡 |

---

## 7. 附录

### 7.1 术语表
| 术语 | 定义 |
|------|------|
| 学期计划 | 一个学期的整体教学规划 |
| 周计划 | 每周具体的教学安排 |
| 教案模板 | 可复用的教案结构框架 |
| 课程表 | 教师所教班级的时间安排 |

### 7.2 参考资源
- 现有教案系统: `~/Projects/teaching-plan-system`
- 设计文档: `docs/design/2026-02-06-architecture.md`

---

*设计完成，等待实施计划*
