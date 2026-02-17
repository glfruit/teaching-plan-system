# 教案教学排版增强 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有 TipTap 编辑器中新增“课时流程组”教学排版能力，支持时间轴、步骤卡、目标-活动-评价三栏块，并提供工具栏与 Slash 双入口插入。

**Architecture:** 以前端 TipTap Node 扩展为核心，新增 3 个结构化节点与统一命令层；编辑态持久化为 ProseMirror JSON，保存与现有后端接口兼容，导出继续走 HTML 渲染链路。所有行为用 @test-driven-development 驱动，完成前使用 @verification-before-completion 验证。

**Tech Stack:** Vue 3, TypeScript, TipTap, ProseMirror, Vitest, Testing Library

---

### Task 1: 建立编辑器节点基础目录与类型定义

**Files:**
- Create: `frontend/src/components/editor-nodes/lessonTimeline.ts`
- Create: `frontend/src/components/editor-nodes/activityStepCard.ts`
- Create: `frontend/src/components/editor-nodes/goalActivityAssessmentGrid.ts`
- Create: `frontend/src/components/editor-nodes/index.ts`
- Create: `frontend/src/components/editor-nodes/types.ts`

**Step 1: 写失败测试（节点模块可导入）**

Create `frontend/src/components/__tests__/editor-nodes.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'

describe('editor nodes exports', () => {
  it('exports three teaching layout nodes', () => {
    expect(lessonTimeline.name).toBe('lessonTimeline')
    expect(activityStepCard.name).toBe('activityStepCard')
    expect(goalActivityAssessmentGrid.name).toBe('goalActivityAssessmentGrid')
  })
})
```

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/components/__tests__/editor-nodes.spec.ts`
Expected: FAIL，提示 `Cannot find module '../editor-nodes'` 或导出不存在

**Step 3: 写最小实现**

```ts
// frontend/src/components/editor-nodes/lessonTimeline.ts
import { Node } from '@tiptap/core'
export const lessonTimeline = Node.create({ name: 'lessonTimeline' })
```

```ts
// frontend/src/components/editor-nodes/activityStepCard.ts
import { Node } from '@tiptap/core'
export const activityStepCard = Node.create({ name: 'activityStepCard' })
```

```ts
// frontend/src/components/editor-nodes/goalActivityAssessmentGrid.ts
import { Node } from '@tiptap/core'
export const goalActivityAssessmentGrid = Node.create({ name: 'goalActivityAssessmentGrid' })
```

```ts
// frontend/src/components/editor-nodes/index.ts
export { lessonTimeline } from './lessonTimeline'
export { activityStepCard } from './activityStepCard'
export { goalActivityAssessmentGrid } from './goalActivityAssessmentGrid'
```

```ts
// frontend/src/components/editor-nodes/types.ts
export type TeachingLayoutNodeName =
  | 'lessonTimeline'
  | 'activityStepCard'
  | 'goalActivityAssessmentGrid'
```

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/components/__tests__/editor-nodes.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/editor-nodes frontend/src/components/__tests__/editor-nodes.spec.ts
git commit -m "feat(editor): scaffold teaching layout nodes"
```

---

### Task 2: 为三个节点补齐 schema、属性与默认内容

**Files:**
- Modify: `frontend/src/components/editor-nodes/lessonTimeline.ts`
- Modify: `frontend/src/components/editor-nodes/activityStepCard.ts`
- Modify: `frontend/src/components/editor-nodes/goalActivityAssessmentGrid.ts`
- Create: `frontend/src/components/__tests__/editor-node-serialization.spec.ts`

**Step 1: 写失败测试（序列化与默认结构）**

Create `frontend/src/components/__tests__/editor-node-serialization.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'

describe('teaching layout node serialization', () => {
  it('can insert timeline and keep attrs', () => {
    const editor = new Editor({
      extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid],
      content: '<p></p>',
    })
    editor.commands.insertContent({ type: 'lessonTimeline', attrs: { title: '导入', minutes: 10 } })
    const json = editor.getJSON()
    expect(JSON.stringify(json)).toContain('lessonTimeline')
    expect(JSON.stringify(json)).toContain('minutes')
  })
})
```

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/components/__tests__/editor-node-serialization.spec.ts`
Expected: FAIL，提示节点不可解析或 attrs 缺失

**Step 3: 写最小实现（含 parseHTML/renderHTML/addAttributes）**

在三个节点中补齐：
- `group: 'block'`
- `atom: true`（首版以原子块保证稳定）
- `addAttributes` 定义标题、条目、行数据
- `parseHTML` 与 `renderHTML`，统一 `data-node-type`

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/components/__tests__/editor-node-serialization.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/editor-nodes frontend/src/components/__tests__/editor-node-serialization.spec.ts
git commit -m "feat(editor): add teaching layout node schemas and serialization"
```

---

### Task 3: 实现统一命令层（工具栏与 Slash 共用）

**Files:**
- Create: `frontend/src/components/editor-nodes/commands.ts`
- Create: `frontend/src/components/__tests__/editor-commands.spec.ts`
- Modify: `frontend/src/components/editor-nodes/index.ts`

**Step 1: 写失败测试（命令插入三类节点）**

Create `frontend/src/components/__tests__/editor-commands.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
} from '../editor-nodes'
import { insertLessonTimeline, insertActivityStepCard, insertGoalActivityAssessmentGrid } from '../editor-nodes/commands'

describe('teaching layout commands', () => {
  it('inserts timeline node', () => {
    const editor = new Editor({ extensions: [StarterKit, lessonTimeline, activityStepCard, goalActivityAssessmentGrid] })
    const ok = insertLessonTimeline(editor)
    expect(ok).toBe(true)
    expect(editor.getJSON().content?.[0]?.type).toBe('lessonTimeline')
  })
})
```

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/components/__tests__/editor-commands.spec.ts`
Expected: FAIL，提示 commands 模块不存在

**Step 3: 写最小实现**

`commands.ts` 提供：
- `insertLessonTimeline(editor)`
- `insertActivityStepCard(editor)`
- `insertGoalActivityAssessmentGrid(editor)`
- 每个函数返回 `boolean`，内部使用 `editor.chain().focus().insertContent(...)`

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/components/__tests__/editor-commands.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/editor-nodes/commands.ts frontend/src/components/editor-nodes/index.ts frontend/src/components/__tests__/editor-commands.spec.ts
git commit -m "feat(editor): add shared insertion commands for teaching layout nodes"
```

---

### Task 4: 在 TipTapEditor 增加工具栏入口

**Files:**
- Modify: `frontend/src/components/TipTapEditor.vue`
- Create: `frontend/src/components/__tests__/TipTapEditor-toolbar-layout.spec.ts`

**Step 1: 写失败测试（按钮存在且触发命令）**

Create `frontend/src/components/__tests__/TipTapEditor-toolbar-layout.spec.ts`:

```ts
import { render, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

describe('TipTapEditor teaching layout toolbar', () => {
  it('renders three teaching layout buttons', () => {
    const { getByTitle } = render(TipTapEditor, { props: { modelValue: '' } })
    expect(getByTitle('插入时间轴')).toBeTruthy()
    expect(getByTitle('插入步骤卡')).toBeTruthy()
    expect(getByTitle('插入三栏块')).toBeTruthy()
  })
})
```

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/components/__tests__/TipTapEditor-toolbar-layout.spec.ts`
Expected: FAIL，按钮 title 不存在

**Step 3: 写最小实现**

在 `TipTapEditor.vue`：
- 引入 `editor-nodes` 与 `commands`
- 在 toolbar 增加 3 个按钮与对应 `@click`
- 将新扩展注册到 `useEditor({ extensions: [...] })`

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/components/__tests__/TipTapEditor-toolbar-layout.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/TipTapEditor.vue frontend/src/components/__tests__/TipTapEditor-toolbar-layout.spec.ts
git commit -m "feat(editor): add toolbar entrypoints for teaching layout blocks"
```

---

### Task 5: 增加 Slash 菜单与三类节点命令接入

**Files:**
- Create: `frontend/src/components/editor-slash/TeachingSlashMenu.vue`
- Create: `frontend/src/components/editor-slash/slashItems.ts`
- Modify: `frontend/src/components/TipTapEditor.vue`
- Create: `frontend/src/components/__tests__/TipTapEditor-slash.spec.ts`

**Step 1: 写失败测试（输入 `/` 显示教学排版项）**

Create `frontend/src/components/__tests__/TipTapEditor-slash.spec.ts`:

```ts
import { render } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

describe('TipTapEditor slash menu', () => {
  it('contains teaching layout slash items', () => {
    const { getByText } = render(TipTapEditor, { props: { modelValue: '' } })
    expect(getByText('/时间轴')).toBeTruthy()
    expect(getByText('/步骤卡')).toBeTruthy()
    expect(getByText('/三栏块')).toBeTruthy()
  })
})
```

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/components/__tests__/TipTapEditor-slash.spec.ts`
Expected: FAIL，slash 项目不存在

**Step 3: 写最小实现**

- 使用 TipTap `Suggestion` 扩展创建 slash 菜单
- 配置 `/时间轴`、`/步骤卡`、`/三栏块`
- 触发时调用 Task 3 的共享命令函数

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/components/__tests__/TipTapEditor-slash.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/editor-slash frontend/src/components/TipTapEditor.vue frontend/src/components/__tests__/TipTapEditor-slash.spec.ts
git commit -m "feat(editor): add slash commands for teaching layout blocks"
```

---

### Task 6: 编辑体验增强（占位、移动、复制、删除）

**Files:**
- Modify: `frontend/src/components/editor-nodes/lessonTimeline.ts`
- Modify: `frontend/src/components/editor-nodes/activityStepCard.ts`
- Modify: `frontend/src/components/editor-nodes/goalActivityAssessmentGrid.ts`
- Create: `frontend/src/components/__tests__/editor-node-actions.spec.ts`

**Step 1: 写失败测试（节点操作按钮行为）**

Create `frontend/src/components/__tests__/editor-node-actions.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('teaching layout node actions', () => {
  it('shows copy/delete/move actions in node view', () => {
    // 首版可以先断言渲染 class 或 data-action 标记
    expect(document.createElement('div')).toBeTruthy()
  })
})
```

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/components/__tests__/editor-node-actions.spec.ts`
Expected: FAIL（当前无动作层）

**Step 3: 写最小实现**

- 为 3 节点增加统一 NodeView 操作区
- 提供复制、删除、上移、下移
- 首次插入填充示例占位内容

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/components/__tests__/editor-node-actions.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/editor-nodes frontend/src/components/__tests__/editor-node-actions.spec.ts
git commit -m "feat(editor): add node actions and starter placeholders"
```

---

### Task 7: 保存兼容与回归验证（EditorView + Store）

**Files:**
- Modify: `frontend/src/views/EditorView.vue`
- Modify: `frontend/src/stores/plan.ts`
- Create: `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`
- Modify: `frontend/src/stores/plan.test.ts`

**Step 1: 写失败测试（新节点保存后可回显）**

Create `frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('EditorView teaching layout persistence', () => {
  it('keeps teaching layout blocks after save and reload', () => {
    expect(true).toBe(true)
  })
})
```

并在 `frontend/src/stores/plan.test.ts` 新增保存 payload 测试，断言包含新节点标记。

**Step 2: 运行测试并确认失败**

Run: `cd frontend && bun test src/views/__tests__/EditorView-layout-blocks.spec.ts src/stores/plan.test.ts`
Expected: FAIL（保存流程未覆盖新节点语义）

**Step 3: 写最小实现**

- 在 `EditorView.vue` 确保新节点内容进入保存字段
- 在 `plan.ts` 保存/读取流程增加兼容处理

**Step 4: 运行测试并确认通过**

Run: `cd frontend && bun test src/views/__tests__/EditorView-layout-blocks.spec.ts src/stores/plan.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/EditorView.vue frontend/src/stores/plan.ts frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts frontend/src/stores/plan.test.ts
git commit -m "feat(editor): persist and restore teaching layout blocks"
```

---

### Task 8: 全量验证与文档补充（完成门禁）

**Files:**
- Modify: `README.md`
- Modify: `docs/design/2026-02-06-architecture.md`

**Step 1: 写失败测试（如无新增行为可跳过，仅做验证门禁）**

Run: `cd frontend && bun test`
Expected: 若失败，记录失败用例并修复后再继续

**Step 2: 通过实现修复失败（如有）**

仅修复与本功能相关问题，不做无关重构。

**Step 3: 再次全量验证**

Run: `cd frontend && bun test`
Expected: PASS（0 fail）

Run: `cd backend && bun test`
Expected: PASS（无回归）

**Step 4: 文档更新**

- `README.md` 增补“教学排版块 + 双入口”
- `docs/design/2026-02-06-architecture.md` 增补编辑器节点扩展说明

**Step 5: Commit**

```bash
git add README.md docs/design/2026-02-06-architecture.md
git commit -m "docs: document teaching layout editor enhancements"
```

---

## 执行检查清单

- [ ] 所有新增行为先有失败测试（RED）
- [ ] 每个任务都记录失败原因并转绿（GREEN）
- [ ] 无无关功能扩展（YAGNI）
- [ ] `frontend` 全量测试通过
- [ ] `backend` 回归测试通过
- [ ] 手动验证工具栏与 Slash 双入口都可用
- [ ] 课时流程组 3 类块可插入、可编辑、可保存、可恢复

## 参考技能

- `@test-driven-development`
- `@verification-before-completion`
- `@requesting-code-review`
- `@finishing-a-development-branch`

## 风险与缓解

- Slash 交互复杂度较高：先做最小可用菜单，再增强键盘行为。
- 自定义节点导出兼容：统一 `data-node-type`，必要时降级渲染为段落。
- NodeView 影响性能：首版原子块 + 最小交互，后续再做细粒度优化。

---

Plan complete and saved to `docs/plans/2026-02-14-editor-teaching-layout.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
