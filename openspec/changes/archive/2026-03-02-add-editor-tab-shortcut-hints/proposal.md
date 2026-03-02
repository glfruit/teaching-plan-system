## Why

主编辑标签已经支持快捷键切换，但缺少可见提示，导致多数教师并不知道这项能力。需要在界面内提供明确引导，降低学习成本并提升连续编辑效率。

## What Changes

- 在主编辑标签区增加快捷键提示文案（Alt/Option + 1~4）。
- 在快捷键帮助弹窗中增加“标签切换”固定说明分组。
- 保持现有快捷键配置能力不变，仅新增可见提示与文案结构。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `page-redesign`: 增加标签切换快捷键的可见引导。
- `component-library`: 标签组件支持展示快捷键提示插槽/文案区域。

## Impact

- Affected code:
  - `frontend/src/components/editor/EditorLayoutTabs.vue`
  - `frontend/src/views/EditorView.vue`
  - `frontend/src/views/__tests__/EditorView-form-and-editor-style.spec.ts`
- APIs: None.
- Dependencies: None.
