## Why

当前教案编辑页已引入标签式分区，但主视图与模板编辑弹窗仍存在结构耦合高、移动端标签可达性不足的问题。需要在不影响现有业务逻辑的前提下，继续推进组件化与交互一致性，确保后续迭代可维护。

## What Changes

- 将编辑页“标签式编辑分区”抽离为独立组件，统一吸顶导航、进度色阶与移动端横向滚动交互。
- 将“模板编辑弹窗”标签导航抽离为独立组件，保持与主编辑页分区心智一致。
- 补充标签切换与分区定位联动的辅助函数测试，防止后续重构引入回归。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `page-redesign`: 强化编辑页标签式分区在移动端与弹窗中的一致性体验。
- `component-library`: 新增编辑页标签导航组件，减少页面内联 UI 重复实现。

## Impact

- Affected code:
  - `frontend/src/views/EditorView.vue`
  - `frontend/src/components/editor/EditorLayoutTabs.vue`
  - `frontend/src/components/editor/TemplateEditTabs.vue`
  - `frontend/src/views/__tests__/EditorView-form-and-editor-style.spec.ts`
  - `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`
- API changes: None.
- Risks:
  - 标签切换与滚动定位逻辑需要确保不影响现有“编辑导航/大纲定位/预检定位”。
