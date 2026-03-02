## Why

编辑页已完成标签化重构，但在长时间编写场景中仍存在切换成本：教师无法快速用键盘切换标签，刷新后会丢失当前标签上下文，且模板编辑弹窗缺少一致的“下一待完善”引导。需要在保持现有布局的基础上提升连续编写效率。

## What Changes

- 为主编辑标签增加键盘切换能力（数字键快捷切换）。
- 将主编辑标签选择状态持久化到本地，刷新后恢复上次编辑上下文。
- 为模板编辑弹窗增加“下一待完善标签”跳转动作，减少来回查找字段。
- 为标签组件补充可访问性语义与测试（aria-current、键盘触发）。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `page-redesign`: 增强编辑页标签式工作流在连续编辑场景下的可用性与可恢复性。
- `component-library`: 增强编辑标签组件的交互语义与键盘可访问性要求。

## Impact

- Affected code:
  - `frontend/src/views/EditorView.vue`
  - `frontend/src/components/editor/EditorLayoutTabs.vue`
  - `frontend/src/components/editor/TemplateEditTabs.vue`
  - `frontend/src/views/__tests__/EditorView-form-and-editor-style.spec.ts`
  - `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`
- APIs: None.
- Dependencies: None.
