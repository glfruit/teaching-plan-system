## Context

已有 Alt/Option + 1~4 标签切换，但入口隐蔽。当前目标是“可发现性增强”，不改动核心逻辑。

## Design Decisions

1. 在 `EditorLayoutTabs` 顶部增加快捷键提示文案：`快捷切换：Alt/Option + 1~4`。
2. 在 `EditorView` 的快捷键弹窗中增加“标签切换”说明块，列出 1~4 对应标签。
3. 不将标签切换加入用户可配置快捷键，避免与可配置项混淆。

## Validation

- 更新 UI 字符串测试，确保提示文案存在。
- 运行编辑页相关测试与构建。
