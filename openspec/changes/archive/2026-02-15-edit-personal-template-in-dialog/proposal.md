## Why

当前模板库已支持创建、删除、套用，但教师无法就地修改已保存模板，导致模板迭代成本高。补齐“弹窗编辑模板”可形成模板管理闭环，提升教案沉淀效率。

## What Changes

- 在编辑页模板面板中新增“编辑模板”入口。
- 支持从选中模板加载原始内容到弹窗，并修改模板标题与正文内容。
- 保存编辑后调用现有模板更新接口（PATCH），回写模板数据并刷新列表。
- 取消编辑时不修改模板数据。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `personal-plan-templates`: 增加“编辑模板（标题+正文）”与“取消不变更”的行为要求。

## Impact

- Affected code:
  - `frontend/src/views/EditorView.vue`
  - `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`
- APIs:
  - 复用现有 `PATCH /plan-templates/:id`，无需新增后端接口。
