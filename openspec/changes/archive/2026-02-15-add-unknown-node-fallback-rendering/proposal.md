## Why

当前编辑器在遇到未知节点类型时虽不会崩溃，但会退化为普通文本语义，可能造成结构信息丢失。随着教案节点持续扩展，需要一套稳定的未知节点兼容策略，保障教师内容可见、可重开、可继续维护。

## What Changes

- 为未知节点引入“只读占位块”渲染策略，在编辑器内明确提示该块为未识别类型。
- 保存链路保留未知节点原始数据（节点类型与原始 attrs/content），避免静默抹平。
- 在保存-重开流程中，未知节点保持占位呈现并可稳定存在于文档中。
- 增加对应自动化测试，覆盖解析、渲染与重开持久化场景。

## Capabilities

### New Capabilities
- `unknown-node-readonly-fallback`: 未知节点以只读占位块展示，并保留原始结构用于后续兼容升级。

### Modified Capabilities
- `editor-save-reopen-integrity`: 扩展保存重开一致性要求，覆盖未知节点场景下的结构保真。

## Impact

- 前端编辑器节点归一化与渲染逻辑：`frontend/src/stores/plan.ts`、`frontend/src/components/TipTapEditor.vue`。
- 可能新增占位节点扩展：`frontend/src/components/editor-nodes/`。
- 前端测试：`frontend/src/stores/plan.test.ts`、`frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`（以及必要的新测试文件）。
- 不涉及后端 API 变更。
