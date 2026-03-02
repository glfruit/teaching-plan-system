## Why

虽然已显示标签快捷键总提示，但用户仍需在脑中记忆 1~4 对应哪个标签。将数字索引直接贴到每个标签上可以进一步降低记忆负担。

## What Changes

- 在主编辑标签按钮上展示快捷键索引徽标（1~4）。
- 在模板编辑弹窗标签上展示对应索引，保持心智一致。
- 同步更新快捷键说明测试断言。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `page-redesign`: 增强标签式编辑的快捷键可见性。
- `component-library`: 标签组件支持统一的快捷键索引展示。

## Impact

- Affected code:
  - `frontend/src/components/editor/EditorLayoutTabs.vue`
  - `frontend/src/components/editor/TemplateEditTabs.vue`
  - `frontend/src/views/__tests__/EditorView-form-and-editor-style.spec.ts`
- APIs: None.
