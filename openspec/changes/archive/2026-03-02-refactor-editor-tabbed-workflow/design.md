## Context

编辑页已具备丰富功能（模板库、进度助手、时间轴、草稿箱、快捷键配置），单文件体量较大。为了在持续迭代中保持可维护性，本次设计采用“UI 抽离优先、行为保持不变”的策略。

## Goals

1. 将标签分区 UI 组件化，降低 `EditorView.vue` 模板复杂度。
2. 增强移动端标签可达性（横向滚动 + 最小宽度按钮）。
3. 保持既有行为：分区切换、滚动定位、保存发布链路不变。

## Non-Goals

- 不调整后端接口与数据结构。
- 不改变编辑器字段含义与保存 payload 结构。
- 不引入新的状态管理库。

## Design Decisions

### 1) 主编辑标签组件化

- 新增 `EditorLayoutTabs.vue` 承载：
  - 吸顶容器
  - 标签按钮
  - 分区完成度与必填缺口提示
  - 进度色阶条
- `EditorView.vue` 仅负责传入 `tabs/activeTab/activeLabel` 与 `select` 回调。

### 2) 模板弹窗标签组件化

- 新增 `TemplateEditTabs.vue` 承载模板弹窗标签条。
- 弹窗正文继续使用 `v-show` 分区，避免切换时销毁 `TipTapEditor` 实例。

### 3) 联动逻辑保持在页面层

- 分区滚动、导航定位、预检定位依然由 `EditorView.vue` 的 section 粒度逻辑驱动。
- 新增/保留的纯函数：
  - section -> tab 映射
  - tab -> focus section 解析
  - tab 汇总统计
- 对上述函数补充测试，防止重构期间行为漂移。

## Validation Plan

1. 运行编辑页相关测试：
   - `EditorView-layout-blocks.spec.ts`
   - `EditorView-form-and-editor-style.spec.ts`
   - `EditorView-template-dialog.spec.ts`
2. 运行 `npm run build` 验证 TS 与打包稳定。
