## Context

当前标签式编辑已解决“输入区拥挤”问题，但编写效率优化仍可继续：用户在标签间切换主要依赖鼠标，刷新后无法回到上次标签，模板弹窗在多标签场景下缺少“下一步”引导。该问题属于交互层增强，不涉及数据结构与后端接口。

## Goals

1. 降低标签切换成本（键盘快捷切换）。
2. 降低中断恢复成本（记忆并恢复上次主编辑标签）。
3. 降低模板弹窗补齐成本（快速跳转到下一待完善标签）。
4. 保持现有保存、发布、定位逻辑不变。

## Non-Goals

- 不修改教案字段定义与保存 payload。
- 不新增 API。
- 不引入新的状态管理方案。

## Design

### 1) 主编辑标签快捷切换

- 在 `EditorView` 键盘处理逻辑中增加 `Alt+1/2/3/4`（或 `Option+1/2/3/4`）映射到四个主标签。
- 复用 `handleSelectEditorLayoutTab`，确保键盘与点击路径一致。
- 当输入法组合键或冲突快捷键触发时，不抢占已有保存/导出快捷键。

### 2) 主编辑标签持久化

- 在现有 `EDITOR_VIEW_PREFERENCE_STORAGE_KEY` 结构中新增 `activeLayoutTab`。
- 读取偏好时恢复 `activeEditorLayoutTab`；无值则默认 `basic`。
- 写入偏好时在 `focusMode/collapsedSections` 基础上同步写入标签。

### 3) 模板弹窗“下一待完善标签”

- 基于 `templateEditTabs` 已有 `filledCount/totalCount` 统计，新增计算“下一待完善标签”。
- 在弹窗标签区域加入按钮，点击后跳转到下一标签。
- 若全部完善，给出轻提示（不阻断）。

### 4) 可访问性与测试

- 为标签按钮补充 `aria-current`（当前项）。
- 在测试中补充：
  - 主标签组件语义与快捷切换存在性
  - 偏好序列化/反序列化兼容 `activeLayoutTab`
  - 模板弹窗“下一待完善标签”逻辑

## Validation

1. `npm run test -- src/views/__tests__/EditorView-layout-blocks.spec.ts src/views/__tests__/EditorView-form-and-editor-style.spec.ts`
2. `npm run build`
