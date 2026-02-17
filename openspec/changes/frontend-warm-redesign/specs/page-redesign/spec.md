# Page Redesign Spec

## Overview

四大核心页面的重设计规范。

## Page: LoginView

### REQ-L001: 布局结构

**必须**采用分屏布局：
- 左侧：品牌展示区（占 55%）
- 右侧：登录表单区（占 45%）
- 移动端：垂直堆叠，品牌区在上

### REQ-L002: 品牌展示区

**必须**包含：
- 温暖的渐变背景（amber-100 到 orange-100）
- Logo 图标（带阴影效果）
- 系统名称（使用衬线字体）
- 系统描述
- 装饰性有机形状（模糊圆形）
- 演示账号信息卡片

**样式:**
```
背景: bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50
装饰: 绝对定位的模糊圆形，opacity-30
```

### REQ-L003: 登录表单

**必须**包含：
- 标题"欢迎回来"
- 用户名输入框
- 密码输入框
- 登录按钮（Primary，全宽）
- 错误提示区域
- 表单验证

**样式:**
```
卡片: bg-white rounded-2xl shadow-warm-lg p-8
输入框: 使用 BaseInput 组件
按钮: BaseButton variant="primary" size="lg" 全宽
```

## Page: HomeView (Dashboard)

### REQ-H001: 导航栏

**必须**使用 NavBar 组件：
- Logo + 系统名称
- 当前用户信息（Badge 样式）
- "新建教案" 按钮
- 退出按钮
- 移动端汉堡菜单

### REQ-H002: 欢迎区域

**必须**包含：
- 欢迎语 "欢迎，{用户名}"
- 简短描述
- 使用 PageHeader 组件

### REQ-H003: 统计面板

**必须**显示：
- 总教案数
- 草稿数（琥珀色强调）
- 已发布数（翠绿色）

**布局:** 3 列网格，gap-4

### REQ-H004: 教案列表

**必须**包含：
- 搜索框
- 列表/卡片视图（默认列表）
- 每行显示：标题、课程名、班级、时长、更新时间、状态
- 操作按钮：编辑、导出、删除
- 分页控件

**样式:**
```
列表容器: BaseCard
列表项: hover:bg-warm-50 transition
状态 Badge: 使用 BaseBadge
操作按钮: BaseButton variant="ghost" size="sm"
```

## Page: EditorView

### REQ-E001: 编辑器头部

**必须**包含：
- 返回按钮
- 页面标题（新建/编辑教案）
- 保存状态提示
- 操作按钮：模板、导出、发布、保存

### REQ-E002: 表单布局

**必须**采用：
- 左侧：主表单区域（基本信息 + 编辑器）
- 右侧：模板面板（可折叠）
- 两栏布局：grid-cols-[1fr_320px]

### REQ-E003: 基本信息卡片

**必须**包含字段：
- 教案标题（输入框）
- 课程名称（输入框）
- 班级（输入框）
- 时长（数字输入，分钟）

### REQ-E004: TipTap 编辑器样式

**必须**重新设计编辑器：
- 工具栏：温暖色调图标按钮
- 编辑区：奶油色背景，白色内容区
- 选中效果：amber-100 背景
- 占位符：温暖的灰色

**样式:**
```css
.editor-container {
  @apply bg-warm-50 rounded-xl border border-amber-200 p-4;
}
.editor-content {
  @apply bg-white rounded-lg min-h-[400px] p-6;
}
```

### REQ-E005: 模板面板

**必须**包含：
- 面板标题
- 模板列表
- 应用模板按钮
- 关闭按钮

## Page: AnalyticsView

### REQ-A001: 页面布局

**必须**采用：
- 2x2 网格布局（桌面端）
- 单列堆叠（移动端）
- 每个图表一个卡片

### REQ-A002: 图表配色

**必须**使用温暖色系：
- 主色：amber-500
- 辅助色：orange-500, rose-500
- 成功色：emerald-500
- 背景：transparent

### REQ-A003: 图表卡片

**必须**包含：
- 图表标题
- ECharts 图表
- 数据加载状态
- 错误处理

**样式:**
```
卡片: BaseCard p-6
标题: font-display text-lg font-semibold text-warm-900 mb-4
图表: h-64
```

### REQ-A004: 图表类型

**必须**重新设计以下图表：
1. **WorkloadChart**: 教师工作量统计（柱状图）
2. **ExecutionChart**: 教案执行状态（饼图/环形图）
3. **QualityChart**: 教案质量评分（雷达图）
4. **TrendChart**: 教案趋势（折线图）

## Responsive Breakpoints

```
Mobile: < 640px (sm)
Tablet: 640px - 1024px (md/lg)
Desktop: > 1024px (xl)
```

**通用响应式规则:**
- 移动端单列布局
- 触摸目标最小 44px
- 字体大小适当调整
- 间距适当缩减
