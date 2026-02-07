# 模板系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现教案模板系统，支持系统预设模板和教师自定义模板，缩短教案创建时间。

**Architecture:** 基于现有 TipTap 编辑器，扩展模板存储和应用机制。模板以 JSON 格式存储结构，应用时填充到编辑器。

**Tech Stack:** Vue 3 + TypeScript + TipTap + Elysia.js + PostgreSQL + Prisma

---

## 前置准备

### 创建 Worktree
```bash
cd ~/Projects/teaching-plan-system
git worktree add .worktrees/feature/template-system -b feature/template-system
cd .worktrees/feature/template-system
```

### 验证环境
```bash
cd backend && bun install && bun prisma generate
cd ../frontend && bun install
```

---

## 任务列表

---

### Task 1: 数据库模型设计

**Files:**
- Create: `backend/prisma/migrations/20260207000000_add_templates/migration.sql`
- Modify: `backend/prisma/schema.prisma`

**Step 1: 编写 Prisma Schema**

在 `schema.prisma` 末尾添加：

```prisma
model TeachingTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?
  category    String   // THEORY, EXPERIMENT, PRACTICE
  structure   Json     // TipTap JSON content
  isSystem    Boolean  @default(false)
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category])
  @@index([creatorId])
}

enum TemplateCategory {
  THEORY     // 理论课
  EXPERIMENT // 实验课
  PRACTICE   // 实训课
}
```

**Step 2: 生成迁移文件**

```bash
cd backend
bunx prisma migrate dev --name add_templates
```

Expected: Migration created successfully

**Step 3: 生成 Prisma Client**

```bash
bunx prisma generate
```

Expected: Prisma client generated

**Step 4: 创建种子数据**

Create `backend/prisma/seed-templates.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const systemTemplates = [
  {
    name: '理论课模板',
    description: '适用于理论讲授类课程',
    category: 'THEORY',
    isSystem: true,
    structure: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '一、教学目标' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写教学目标】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '二、教学重点与难点' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写重点难点】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '三、教学过程' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写教学过程】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '四、板书设计' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写板书设计】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '五、教学反思' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写教学反思】' }] },
      ],
    },
  },
  // 更多模板...
]

async function main() {
  for (const template of systemTemplates) {
    await prisma.teachingTemplate.create({
      data: {
        ...template,
        creatorId: 'system',
      },
    })
  }
  console.log('System templates seeded')
}

main()
```

**Step 5: 运行种子**

```bash
bun prisma/seed-templates.ts
```

Expected: "System templates seeded"

**Step 6: Commit**

```bash
git add backend/prisma/
git commit -m "feat: add TeachingTemplate model with seed data"
```

---

### Task 2: 后端 API - 模板 CRUD

**Files:**
- Create: `backend/src/routes/templates.ts`
- Modify: `backend/src/index.ts` (添加路由)

**Step 1: 编写模板路由**

Create `backend/src/routes/templates.ts`:

```typescript
import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { authMiddleware, requireAuth } from '../middleware/auth'

export const templateRoutes = new Elysia({ prefix: '/templates' })
  .use(authMiddleware)
  .use(requireAuth)
  
  // 获取模板列表
  .get('/', async ({ user, query }) => {
    const where: any = {}
    
    // 系统模板 + 用户自己的模板
    where.OR = [
      { isSystem: true },
      { creatorId: user!.userId },
    ]
    
    if (query?.category) {
      where.category = query.category
    }
    
    const templates = await prisma.teachingTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' },
        { updatedAt: 'desc' },
      ],
    })
    
    return {
      success: true,
      data: templates,
    }
  }, {
    query: t.Object({
      category: t.Optional(t.String()),
    }),
  })
  
  // 获取单个模板
  .get('/:id', async ({ params, user }) => {
    const template = await prisma.teachingTemplate.findFirst({
      where: {
        id: params.id,
        OR: [
          { isSystem: true },
          { creatorId: user!.userId },
        ],
      },
    })
    
    if (!template) {
      return { success: false, message: '模板不存在' }
    }
    
    return {
      success: true,
      data: template,
    }
  })
  
  // 创建模板
  .post('/', async ({ body, user }) => {
    const template = await prisma.teachingTemplate.create({
      data: {
        ...body,
        creatorId: user!.userId,
        isSystem: false,
      },
    })
    
    return {
      success: true,
      data: template,
    }
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      category: t.String(),
      structure: t.Any(),
    }),
  })
  
  // 更新模板
  .put('/:id', async ({ params, body, user }) => {
    const template = await prisma.teachingTemplate.updateMany({
      where: {
        id: params.id,
        creatorId: user!.userId,
        isSystem: false,
      },
      data: body,
    })
    
    if (template.count === 0) {
      return { success: false, message: '模板不存在或无权限' }
    }
    
    return {
      success: true,
      message: '更新成功',
    }
  })
  
  // 删除模板
  .delete('/:id', async ({ params, user }) => {
    const template = await prisma.teachingTemplate.deleteMany({
      where: {
        id: params.id,
        creatorId: user!.userId,
        isSystem: false,
      },
    })
    
    if (template.count === 0) {
      return { success: false, message: '模板不存在或无权限' }
    }
    
    return {
      success: true,
      message: '删除成功',
    }
  })
```

**Step 2: 注册路由**

Modify `backend/src/index.ts`:

```typescript
import { templateRoutes } from './routes/templates'

// 添加路由
app.use(templateRoutes)
```

**Step 3: 测试 API**

```bash
cd backend
bun dev
```

Test with curl:
```bash
curl http://localhost:3000/templates \
  -H "Authorization: Bearer $TOKEN"
```

Expected: 返回模板列表

**Step 4: Commit**

```bash
git add backend/src/routes/templates.ts backend/src/index.ts
git commit -m "feat: add template CRUD API endpoints"
```

---

### Task 3: 前端 - 模板 Store

**Files:**
- Create: `frontend/src/stores/template.ts`

**Step 1: 编写 Template Store**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface TeachingTemplate {
  id: string
  name: string
  description?: string
  category: string
  structure: any
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<TeachingTemplate[]>([])
  const currentTemplate = ref<TeachingTemplate | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const systemTemplates = computed(() => 
    templates.value.filter(t => t.isSystem)
  )
  
  const myTemplates = computed(() => 
    templates.value.filter(t => !t.isSystem)
  )
  
  const templatesByCategory = computed(() => {
    const grouped: Record<string, TeachingTemplate[]> = {}
    templates.value.forEach(t => {
      if (!grouped[t.category]) {
        grouped[t.category] = []
      }
      grouped[t.category].push(t)
    })
    return grouped
  })
  
  // Actions
  const fetchTemplates = async (category?: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const params = category ? `?category=${category}` : ''
      const response = await axios.get(`/api/templates${params}`)
      
      if (response.data.success) {
        templates.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取模板失败'
    } finally {
      isLoading.value = false
    }
  }
  
  const fetchTemplate = async (id: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`/api/templates/${id}`)
      
      if (response.data.success) {
        currentTemplate.value = response.data.data
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取模板失败'
    } finally {
      isLoading.value = false
    }
  }
  
  const createTemplate = async (data: Partial<TeachingTemplate>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.post('/api/templates', data)
      
      if (response.data.success) {
        templates.value.unshift(response.data.data)
        return response.data.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建模板失败'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    templates,
    currentTemplate,
    isLoading,
    error,
    systemTemplates,
    myTemplates,
    templatesByCategory,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
  }
})
```

**Step 2: Commit**

```bash
git add frontend/src/stores/template.ts
git commit -m "feat: add template store with Pinia"
```

---

### Task 4: 前端 - 模板列表页面

**Files:**
- Create: `frontend/src/views/TemplatesView.vue`
- Modify: `frontend/src/router/index.ts`

**Step 1: 创建模板列表页面**

[完整 Vue 组件代码，包含模板卡片列表、分类筛选]

**Step 2: 添加路由**

```typescript
{
  path: '/templates',
  name: 'templates',
  component: () => import('../views/TemplatesView.vue'),
  meta: { requiresAuth: true },
}
```

**Step 3: Commit**

```bash
git add frontend/src/views/TemplatesView.vue frontend/src/router/index.ts
git commit -m "feat: add templates list view with category filter"
```

---

### Task 5: 前端 - 新建教案时选择模板

**Files:**
- Modify: `frontend/src/views/HomeView.vue` (添加"从模板创建"按钮)
- Create: `frontend/src/components/TemplateSelector.vue`

**Step 1: 创建模板选择组件**

[完整组件代码，包含模态框、模板预览、选择确认]

**Step 2: 修改新建流程**

在 HomeView 中添加：
- "从模板新建"按钮
- 点击打开 TemplateSelector
- 选择后跳转到 EditorView 并传入模板内容

**Step 3: 修改 EditorView 接收模板**

```typescript
// 在 EditorView 中处理模板初始化
if (route.query.templateId) {
  const template = await templateStore.fetchTemplate(route.query.templateId)
  // 使用模板内容初始化编辑器
  editor.value?.commands.setContent(template.structure)
}
```

**Step 4: Commit**

```bash
git add frontend/src/components/TemplateSelector.vue \
        frontend/src/views/HomeView.vue \
        frontend/src/views/EditorView.vue
git commit -m "feat: integrate template selection in new plan creation"
```

---

### Task 6: 前端 - 保存教案为模板

**Files:**
- Modify: `frontend/src/views/EditorView.vue`

**Step 1: 添加"保存为模板"按钮**

在 EditorView toolbar 添加：
```html
<button @click="showSaveTemplateDialog = true">
  保存为模板
</button>
```

**Step 2: 创建保存模板对话框**

[对话框组件，包含模板名称、描述、分类输入]

**Step 3: 实现保存逻辑**

```typescript
const saveAsTemplate = async () => {
  await templateStore.createTemplate({
    name: templateName.value,
    description: templateDescription.value,
    category: templateCategory.value,
    structure: editor.value?.getJSON(),
  })
  showSaveTemplateDialog = false
}
```

**Step 4: Commit**

```bash
git add frontend/src/views/EditorView.vue
git commit -m "feat: add save-as-template functionality"
```

---

## 测试验证

### 运行测试
```bash
cd frontend
bun test
```

Expected: All tests pass

### 构建检查
```bash
bun run build
```

Expected: Build successful

### 功能验证
1. ✅ 访问 /templates 看到模板列表
2. ✅ 可以按分类筛选模板
3. ✅ 新建教案时可以选择模板
4. ✅ 选择模板后编辑器自动填充
5. ✅ 可以保存当前教案为个人模板
6. ✅ 可以看到系统模板和个人模板

---

## 合并到 Main

```bash
git checkout main
git merge feature/template-system
git worktree remove .worktrees/feature/template-system
```

---

*Phase 1 完成，准备 Phase 2: 教学计划模块*
