## Why

当前标签快捷键映射在多个位置重复定义（键盘处理、帮助文案、组件提示），存在未来不一致风险。需要建立单一来源，确保行为与文案始终一致。

## What Changes

- 在编辑页建立统一的标签快捷键映射常量。
- 键盘处理逻辑和快捷键帮助文案均改为读取该映射。
- 补充测试，保证提示文案与快捷键映射同源。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `page-redesign`: 标签快捷键行为与可见文案改为单一来源驱动。
- `component-library`: 标签提示文案与快捷键语义保持一致。

## Impact

- Affected code:
  - `frontend/src/views/EditorView.vue`
  - `frontend/src/components/editor/EditorLayoutTabs.vue`
  - `frontend/src/views/__tests__/EditorView-form-and-editor-style.spec.ts`
  - `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`
- APIs: None.
