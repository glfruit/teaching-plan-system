## Why

教师在编写教案时会反复复用相似结构与栏目内容，当前系统缺少可持久化的个人模板能力，导致重复劳动高、编写效率不稳定。现在引入“我的模板”可直接缩短首稿时间，并形成可演进的个人教研资产。

## What Changes

- 新增“个人教案模板”持久化能力：教师可创建、查看、更新、删除自己的整份教案模板。
- 新增“从当前教案另存为模板”能力：将当前编辑表单（含各富文本栏目与 `contentJson`）保存为模板。
- 新增“套用模板（覆盖当前教案）”能力：在编辑页选择模板后，一次性覆盖目标教案字段。
- 新增模板列表基础检索（按模板名称关键字）与时间排序（最近更新优先）。
- 增加模板相关后端 API、数据模型与前端交互入口（编辑页模板面板/弹窗）。

## Capabilities

### New Capabilities
- `personal-plan-templates`: 教师私有的整份教案模板管理与覆盖式套用能力。

### Modified Capabilities
- `editor-save-reopen-integrity`: 增补“模板套用后保存/重开仍保持 JSON-first 一致性”的行为要求。

## Impact

- Affected code:
  - `backend`: 新增模板数据表与路由（`/plan-templates`），并接入鉴权与归属校验。
  - `frontend`: 编辑页新增模板入口与套用流程，计划 store 增加模板 API 调用。
- APIs:
  - 新增模板 CRUD 与套用所需查询接口（REST）。
- Dependencies:
  - 复用现有认证体系与数据库迁移机制（Prisma）。
- Risks:
  - 覆盖式套用可能误操作，需要二次确认与可预期提示文案。
