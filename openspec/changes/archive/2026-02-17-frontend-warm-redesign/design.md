## Context

教案管理系统采用 Vue 3 + Tailwind CSS 技术栈，当前界面已使用部分橙色元素但缺乏系统性的设计规范。本次重构的目标是建立一套完整的**温暖色系设计系统**，使界面呈现现代简洁、专业大方的视觉效果，同时保持教育行业特有的人文温度。

**当前状态:**
- 技术栈: Vue 3 + Vite + Tailwind CSS + Pinia
- 已有橙色元素但未形成体系
- 使用系统默认字体，缺乏个性
- 组件样式分散，缺乏一致性

**约束条件:**
- 保持现有功能不变（向后兼容）
- 不引入重量级 UI 框架
- 保持构建体积合理
- 支持中文显示

## Goals / Non-Goals

**Goals:**
1. 建立完整的温暖色系设计系统（CSS 变量 + Tailwind 配置）
2. 实现衬线与无衬线字体的层次搭配
3. 重新设计四大核心页面（登录、首页、编辑器、分析）
4. 统一组件库风格（按钮、卡片、表单、导航）
5. 添加优雅的动效与微交互
6. 确保响应式设计质量

**Non-Goals:**
- 不修改后端 API
- 不添加新功能，仅视觉重构
- 不做深色模式（后续迭代考虑）
- 不引入第三方 UI 组件库

## Decisions

### Decision 1: 温暖色系定义

**选择:** 以琥珀色(Amber)为主色，橙色/玫瑰色为辅助，奶油色为背景

```css
/* 主色调 */
--warm-primary: #D97706;        /* Amber 600 */
--warm-secondary: #F97316;      /* Orange 500 */
--warm-tertiary: #F43F5E;       /* Rose 500 */

/* 背景 */
--bg-cream: #FFFBF0;            /* 温暖奶油色 */
--bg-card: #FFFFFF;             /* 纯白卡片 */

/* 文字 */
--text-primary: #451A03;        /* 暖棕色主文字 */
--text-secondary: #78350F;      /* Amber 900 */
```

**理由:**
- 琥珀色传达温暖、活力、友好，符合教育行业气质
- 避免冷色调（蓝/灰）的疏离感
- 暖棕色文字比纯黑更柔和，阅读更舒适

**替代方案:** 使用橙色(Orange)为主色 → 琥珀色更温和，更适合大面积使用

### Decision 2: 字体方案

**选择:** Noto Serif SC (标题) + Inter/Noto Sans SC (正文)

**实施方案:**
- 通过 Google Fonts CDN 加载
- Tailwind 配置扩展 font-family
- 标题使用 font-display，正文使用 font-body

**理由:**
- 衬线字体提升文化气质和教育行业专业感
- Noto 系列对中文支持优秀
- 层次分明：Display 醒目，Body 易读

**替代方案:** 
- 使用系统字体 → 缺乏个性
- 使用商业字体 → 增加成本和法律风险

### Decision 3: 组件实现策略

**选择:** 基于 Tailwind CSS 的工具类组件 + 可复用 Vue 组件

**结构:**
```
components/
├── ui/                    # 基础 UI 组件
│   ├── Button.vue
│   ├── Card.vue
│   ├── Input.vue
│   └── Badge.vue
├── layout/                # 布局组件
│   ├── NavBar.vue
│   └── PageHeader.vue
└── [existing]/            # 现有组件保留
```

**理由:**
- 保持轻量，无需引入 Element Plus 等重型库
- Tailwind 工具类快速实现设计意图
- Vue 组件封装复杂逻辑和复用模板

### Decision 4: 动效策略

**选择:** CSS 动画为主，GSAP 为辅（仅复杂场景）

**实施:**
- Tailwind transition/animation 工具类
- 自定义 CSS keyframes 用于特殊效果
- Vue Transition 组件处理页面/组件切换

**动效原则:**
- 悬停: 0.2-0.3s ease
- 页面切换: 0.3-0.4s ease-out
- 仅用于增强体验，不影响功能

**理由:**
- CSS 动画性能更好，无需额外依赖
- 简单动效用 Tailwind 足够

### Decision 5: 样式架构

**选择:** CSS 变量 + Tailwind 配置扩展

**结构:**
```css
/* styles/variables.css */
:root {
  /* 颜色 */
  --color-primary: 217 119 6;
  --color-primary-light: 252 211 77;
  /* ... */
}
```

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFFBF0',
          100: '#FEF3C7',
          /* ... */
        }
      }
    }
  }
}
```

**理由:**
- CSS 变量支持运行时主题切换（为未来深色模式预留）
- Tailwind 扩展保持开发效率
- 两者结合，既有灵活性又有一致性

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 字体加载延迟导致 FOUT | 中 | 使用 font-display: swap；预加载关键字体 |
| 老用户不适应新界面 | 低 | 保留核心布局结构；提供足够的视觉提示 |
| 构建体积增加 | 低 | 按需加载字体字重；Tree-shaking 移除未用样式 |
| 跨浏览器兼容性 | 低 | 使用 Tailwind 的 autoprefixer；测试主流浏览器 |
| 移动端性能 | 低 | 优化动画使用 prefers-reduced-motion；图片懒加载 |

**Trade-offs:**
- 使用 Google Fonts CDN vs 本地字体: 选择 CDN 简化部署，但依赖外网（学校内网需考虑）
- 大量自定义 CSS vs Tailwind 工具类: 选择混合方案，核心变量用 CSS，快速开发用 Tailwind

## Migration Plan

**Phase 1: 基础设置** (独立提交)
1. 更新 tailwind.config.ts - 扩展颜色和字体
2. 创建 styles/variables.css - CSS 变量系统
3. 更新 index.html - 加载 Google Fonts
4. 验证构建无错误

**Phase 2: UI 组件开发** (独立提交)
1. 创建基础 UI 组件 (Button, Card, Input, Badge)
2. 创建布局组件 (NavBar, PageHeader)
3. 组件测试和文档

**Phase 3: 页面重构** (每个页面独立提交)
1. LoginView.vue - 登录页重设计
2. HomeView.vue - 首页/仪表盘重设计
3. EditorView.vue - 编辑器重设计
4. AnalyticsView.vue - 数据分析页重设计

**Phase 4: 优化与验证** (独立提交)
1. 响应式测试与修复
2. 动效性能优化
3. 跨浏览器测试
4. 最终审查

**Rollback Strategy:**
- 每个 Phase 独立分支
- 保留原始样式备份
- 如有问题可快速回滚到上一版本

## Open Questions

1. 学校内网是否能访问 Google Fonts CDN？（需用户提供信息）
   - 备选方案：使用本地字体文件或中国镜像

2. 是否需要保留现有用户个性化设置？（如布局偏好）
   - 当前方案：本次不涉及，后续迭代考虑

3. 对 IE11 的支持要求？
   - 当前方案：Vue 3 已不支持 IE11，无需考虑
