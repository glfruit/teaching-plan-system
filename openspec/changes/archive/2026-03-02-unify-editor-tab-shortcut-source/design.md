## Design

1. 在 `EditorView.vue` 定义统一常量：`EDITOR_LAYOUT_SHORTCUT_HINTS`（按 1~4 映射到 tab id 和 label）。
2. 键盘事件处理改为从该常量构建映射，替代内联字面量。
3. 快捷键帮助弹窗的“标签切换（固定）”列表改为 `v-for` 渲染该常量。
4. `EditorLayoutTabs` 保留通用提示文案，不再手写具体映射列表。

## Validation

- 更新测试覆盖：检查存在统一常量与 `v-for` 渲染路径。
- 运行编辑页相关测试与构建。
