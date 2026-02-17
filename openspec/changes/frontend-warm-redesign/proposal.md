## Why

教案管理系统的前端界面目前采用了基础的橙色调设计，但整体视觉风格缺乏一致性和设计深度。为了提升教师用户的使用体验，需要对整个前端进行全面重构，采用**温暖色系、现代简洁、专业大方**的设计语言，使系统既体现教育行业的人文关怀，又展现专业的技术品质。

## What Changes

- **全局样式系统重构**: 建立完整的温暖色系 CSS 变量系统，包含琥珀色/橙色的主色调、奶油色背景、暖棕色文字
- **排版系统升级**: 引入衬线字体（Noto Serif SC）用于标题，无衬线字体（Inter/Noto Sans SC）用于正文，提升文化气质
- **页面级重设计**: 
  - 登录页: 分屏布局 + 温暖渐变背景 + 优雅动画
  - 首页/仪表盘: 卡片式布局 + 统计面板 + 精致的教案列表
  - 编辑器: 沉浸式编辑体验 + 温暖色调的工具栏
  - 数据分析页: 温暖色系图表 + 专业数据展示
- **组件库统一**: 按钮、卡片、表单、导航等组件全面重新设计
- **动效与交互**: 添加微交互、页面过渡动画、悬停效果
- **响应式优化**: 确保移动端体验一致且优雅

## Capabilities

### New Capabilities
- `warm-design-system`: 温暖色系设计系统规范与 CSS 变量
- `component-library`: 重新设计的 Vue 组件库（Button, Card, Input, Modal 等）
- `page-redesign`: 四大核心页面的全面重设计
- `animation-effects`: 动效与交互系统

### Modified Capabilities
- (none - 本次变更仅涉及视觉重构，不改变业务逻辑)

## Impact

**Affected Code:**
- `frontend/src/views/*.vue` - 全部页面视图组件
- `frontend/src/components/**/*.vue` - 所有 UI 组件
- `frontend/src/App.vue` - 根组件样式
- `frontend/tailwind.config.ts` - Tailwind 配置扩展
- `frontend/src/assets/styles/` - 新增/修改样式文件
- `frontend/index.html` - 字体加载

**Dependencies:**
- 新增字体依赖: `@chinese-fonts/nssjxk` (或 Google Fonts 的 Noto Serif SC)
- 无需新增 npm 包（使用现有 Tailwind CSS）

**API Changes:**
- 无 API 变更

**Breaking Changes:**
- 无破坏性变更，向后兼容

## Success Criteria

- [ ] 所有页面采用统一的温暖色系设计
- [ ] 字体系统使用衬线 + 无衬线组合
- [ ] 所有交互元素具有优雅的悬停/点击效果
- [ ] 移动端响应式表现良好
- [ ] 无视觉回归（所有功能正常可用）
