## Why

当前模板列表只有名称检索，教师在模板增多后难以快速定位可复用模板。增加“标签（自由输入 + 预设可选）”与快速筛选，可以显著提升模板检索效率。

## What Changes

- 为个人模板增加 `tags` 字段（字符串数组）。
- 模板创建/编辑支持自由输入标签，并提供预设标签快捷选择。
- 模板列表支持按标签快速筛选（可与关键词并用）。
- 更新后端模板查询接口，支持按标签过滤。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `personal-plan-templates`: 增加模板标签维护与按标签筛选能力。

## Impact

- Backend: `PlanTemplate` 模型与 `/plan-templates` 查询/写入逻辑。
- Frontend: 模板面板与编辑弹窗增加标签输入、预设标签快捷选择、筛选入口。
