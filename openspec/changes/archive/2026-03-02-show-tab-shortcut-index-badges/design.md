## Design

1. `EditorLayoutTabs` 为每个 tab 按顺序渲染索引徽标（`1`~`4`），并保持现有 warm 样式。
2. `TemplateEditTabs` 使用同一顺序渲染索引，保证主编辑与弹窗一致。
3. 仅做视觉增强，不改变点击和键盘行为逻辑。

## Validation

- 更新样式测试：检查两个组件包含索引徽标文案。
- 运行编辑页相关测试与构建。
