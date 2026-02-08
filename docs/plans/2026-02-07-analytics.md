# 数据统计模块实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans

**Goal:** 实现数据统计分析模块，提供教学工作量、计划执行、教案质量的可视化报表。

**Architecture:** 基于前两阶段数据，开发统计 API 和可视化图表组件。

**Tech Stack:** Vue 3 + ECharts + Elysia.js + PostgreSQL

**Workdir:** `/Users/gorin/Projects/teaching-plan-system/.worktrees/feature/analytics`

---

## Task 1: 后端统计 API（45分钟）

**Files:**
- Create: `backend/src/routes/analytics.ts`

**统计维度：**
1. **教学工作量统计**
   - 学期授课课时
   - 教案编写数量
   - 覆盖班级数

2. **教学计划执行分析**
   - 计划完成率
   - 教案与计划匹配度
   - 计划调整次数

3. **教案质量分析**
   - 教案完整度评分
   - 更新频率
   - 模板使用率

---

## Task 2: 后端数据聚合（30分钟）

**实现内容：**
- 复杂查询优化
- 数据缓存策略
- 异步统计任务

---

## Task 3: 前端 Analytics Store（30分钟）

**Files：**
- Create: `frontend/src/stores/analytics.ts`

---

## Task 4: 可视化图表组件（45分钟）

**Files：**
- Create: `frontend/src/components/AnalyticsCharts.vue`
- Install: `echarts`

**图表类型：**
- 饼图：教案类型分布
- 柱状图：月度工作量
- 折线图：计划完成趋势
- 仪表盘：整体完成率

---

## Task 5: 报表页面（45分钟）

**Files：**
- Create: `frontend/src/views/AnalyticsView.vue`

---

## Task 6: 导出功能（30分钟）

**导出格式：**
- Excel（数据表格）
- PDF（可视化报表）
- Word（文字报告）

---

## 验证标准

- 所有测试通过
- 图表正常显示
- 导出功能正常
- 响应式设计

---

*Phase 3，预计工期 3.5 小时*
