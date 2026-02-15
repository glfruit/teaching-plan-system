## Context

当前编辑器已经具备 JSON-first 的教案结构编辑能力，但教师缺少“可复用、可持久化”的个人模板机制。用户明确要求 V1 仅覆盖教师私有模板，不引入院系/全校共享，也不做分栏模板；模板应用策略为“整份覆盖当前教案”。现有系统具备鉴权、教案 CRUD、富文本与 `contentJson` 双轨保存能力，因此模板可复用现有教案字段模型，以较小增量形成闭环。

## Goals / Non-Goals

**Goals:**
- 支持教师创建、查询、更新、删除个人模板（仅本人可见、可操作）。
- 支持从当前编辑表单“另存为模板”，完整保存标题元信息与五个富文本栏位的 `html + contentJson`。
- 支持在编辑页选择模板并一键覆盖当前教案内容，覆盖后仍可按现有流程保存并重开。
- 保证模板套用后的 `contentJson` 继续满足现有保存/重开完整性要求。

**Non-Goals:**
- 不实现模板共享、审核、权限分级。
- 不实现模板市场、推荐排序、智能生成。
- 不实现“分栏位局部套用”与“字段级差异合并”。

## Decisions

### 1) 数据模型复用教案核心字段，新增 `PlanTemplate` 表
- 决策：后端新增模板实体，字段与 `TeachingPlan` 的核心编辑字段保持同构（`title/courseName/className/duration/methods/resources/objectives/keyPoints/process/blackboard/reflection/contentJson/htmlContent`），并关联 `teacherId`。
- 理由：避免字段映射损耗，降低“模板套用 -> 教案保存”的转换复杂度。
- 备选：
  - 仅存 `contentJson`：会丢失现有表单字段一致性，前端适配成本更高。
  - 存模板片段数组：不符合当前“整份覆盖”范围。

### 2) API 采用独立资源 `/plan-templates`
- 决策：提供 REST 接口：`GET /plan-templates`、`POST /plan-templates`、`GET /plan-templates/:id`、`PATCH /plan-templates/:id`、`DELETE /plan-templates/:id`。
- 理由：语义清晰，便于后续扩展共享模板时保持兼容。
- 备选：
  - 挂载到 `/teaching-plans` 子路由：会耦合计划与模板生命周期，降低可维护性。

### 3) 覆盖式套用采用前端显式确认 + 原子替换表单
- 决策：编辑页点击“套用模板”后先二次确认，确认后一次性替换 `form` 与 `contentJson`，并触发编辑器刷新。
- 理由：覆盖行为不可逆风险较高，必须以确认降低误操作；原子替换避免半更新状态。
- 备选：
  - 直接覆盖不确认：风险过高。
  - 逐栏合并：超出 V1 范围。

### 4) 与现有 JSON-first 链路保持一致
- 决策：模板保存与套用后仍走 `buildPlanPayload` 统一路径，不新增旁路保存逻辑。
- 理由：减少行为分叉，保证未知节点占位与兼容策略继续生效。

## Risks / Trade-offs

- [覆盖误操作风险] -> 套用前强制确认弹窗，并在成功后给出明确“已覆盖”反馈。
- [模板内容过旧] -> 在列表展示 `updatedAt`，默认按最近更新排序，便于识别。
- [字段演进带来的模板兼容问题] -> 模板载入时复用现有 `normalizeTeachingPlanContent`，确保未知节点降级策略一致。
- [数据量增长] -> V1 先不做复杂分页优化，仅支持基础分页/关键字过滤。

