## 1. 测试先行（未知节点兼容场景）

- [x] 1.1 在 `frontend/src/stores/plan.test.ts` 新增用例：未知节点不再直接降级为普通段落，而是转换为未知占位节点结构。
- [x] 1.2 在 `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts` 新增用例：未知节点 payload 在保存-重开链路中可 round-trip 保留。
- [x] 1.3 在编辑器组件测试中新增用例：未知占位块可见为只读态，且支持删除操作。

## 2. 未知占位节点与归一化实现

- [x] 2.1 在 `frontend/src/components/editor-nodes/` 增加未知占位节点定义（例如 `unknownNodePlaceholder`），支持展示原始类型与只读标识。
- [x] 2.2 修改 `frontend/src/components/editor-nodes/index.ts` 与编辑器扩展注册，使占位节点可被 TipTap 渲染。
- [x] 2.3 调整 `frontend/src/stores/plan.ts` 的未知节点归一化逻辑：保留原始 payload 到占位节点 attrs，而非直接文本化。

## 3. 保存回写与删除能力接入

- [x] 3.1 在 `frontend/src/views/EditorView.vue` 的 payload 构建链路中，确保占位节点可回写为原未知节点 payload。
- [x] 3.2 在 `frontend/src/components/TipTapEditor.vue`（及相关命令）接入占位块删除能力，保持只读但可删除。
- [x] 3.3 确认未知节点存在时保存与重开不会触发崩溃或结构丢失。

## 4. 验证与收口

- [x] 4.1 运行定向测试：`frontend` 内新增/相关测试文件全部通过。
- [x] 4.2 运行前端全量测试，确认无回归。
- [x] 4.3 更新当前 change 的任务勾选状态与验收说明，准备进入 verify/archive。
