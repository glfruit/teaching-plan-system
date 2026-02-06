# 教案管理系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建基于 TipTap/ProseMirror + Elysia.js 的高职院校教案管理系统

**Architecture:** 前后端分离，Vue 3 + TipTap 编辑器，Elysia.js 后端，PostgreSQL 存储，Docker Compose 部署

**Tech Stack:** Vue 3, TipTap/ProseMirror, TypeScript, Elysia.js, Prisma, PostgreSQL, Docker

---

## 里程碑规划

- **Milestone 1**: 基础架构（后端 + 数据库 + 基础 API）
- **Milestone 2**: 前端编辑器核心（TipTap + ProseMirror）
- **Milestone 3**: WPS 导出集成
- **Milestone 4**: 管理与完善（认证、列表、部署）

---

## Milestone 1: 基础架构

### Task 1.1: 初始化 Bun + Elysia 后端项目

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/.env.example`

**Step 1: 创建项目目录**
```bash
mkdir -p backend/src
cd backend
```

**Step 2: 初始化 Bun 项目**
```bash
bun init -y
```
Expected: 生成 package.json, tsconfig.json, index.ts

**Step 3: 安装依赖**
```bash
bun add elysia @elysiajs/cors @elysiajs/jwt
bun add @prisma/client zod
bun add -d prisma @types/bun
```

**Step 4: 配置 tsconfig.json**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

**Step 5: 创建基础服务器**
```typescript
// src/index.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }))
  .listen(3000)

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`)
```

**Step 6: 配置环境变量**
```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/teaching_plan_db
JWT_SECRET=your_jwt_secret_here
WPS_APP_ID=your_wps_app_id
WPS_APP_SECRET=your_wps_app_secret
```

**Step 7: 添加启动脚本**
```json
// package.json
"scripts": {
  "dev": "bun run --watch src/index.ts",
  "build": "bun build src/index.ts --outdir dist --target bun",
  "start": "bun run dist/index.js",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:deploy": "prisma migrate deploy"
}
```

**Step 8: 验证服务器启动**
```bash
bun run dev
```
Expected: 🦊 Server is running at localhost:3000
Test: curl http://localhost:3000/health → {"status":"ok",...}

**Step 9: Commit**
```bash
git add .
git commit -m "feat: init backend with Bun + Elysia.js"
```

---

### Task 1.2: 配置 Prisma + 数据库模型

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/`
- Modify: `backend/src/lib/prisma.ts`

**Step 1: 初始化 Prisma**
```bash
bunx prisma init
```

**Step 2: 配置 schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String
  role      Role     @default(TEACHER)
  department String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teachingPlans TeachingPlan[]

  @@map("users")
}

model TeachingPlan {
  id          String     @id @default(uuid())
  title       String
  courseName  String
  className   String?
  duration    String?
  
  // 富文本内容 (TipTap/ProseMirror JSON)
  objectives  Json?
  keyPoints   Json?
  process     Json
  blackboard  Json?
  reflection  Json?
  
  methods     String[]
  resources   String[]
  htmlContent String?    @db.Text
  
  status      PlanStatus @default(DRAFT)
  teacherId   String
  teacher     User       @relation(fields: [teacherId], references: [id])
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("teaching_plans")
  @@index([teacherId])
  @@index([status])
}

enum Role {
  TEACHER
  ADMIN
}

enum PlanStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Step 3: 创建 Prisma 客户端**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 4: 生成客户端**
```bash
bun run db:generate
```
Expected: Generated Prisma Client

**Step 5: Commit**
```bash
git add .
git commit -m "feat: add Prisma schema with User and TeachingPlan models"
```

---

### Task 1.3: 实现认证 API

**Files:**
- Create: `backend/src/routes/auth.ts`
- Create: `backend/src/lib/auth.ts`
- Modify: `backend/src/index.ts`

**Step 1: 创建密码工具**
```typescript
// src/lib/auth.ts
import { hash, verify } from 'bcrypt'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return verify(password, hashed)
}
```

**Step 2: 创建认证路由**
```typescript
// src/routes/auth.ts
import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { prisma } from '../lib/prisma'
import { hashPassword, verifyPassword } from '../lib/auth'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwt({
    secret: process.env.JWT_SECRET!,
    exp: '24h'
  }))
  
  // 注册
  .post('/register', async ({ body, jwt }) => {
    const hashedPassword = await hashPassword(body.password)
    
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        department: body.department
      }
    })
    
    const token = await jwt.sign({ userId: user.id })
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 20 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8, maxLength: 32 }),
      department: t.Optional(t.String())
    })
  })
  
  // 登录
  .post('/login', async ({ body, jwt }) => {
    const user = await prisma.user.findUnique({
      where: { username: body.username }
    })
    
    if (!user || !await verifyPassword(body.password, user.password)) {
      throw new Error('Invalid credentials')
    }
    
    const token = await jwt.sign({ userId: user.id })
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String()
    })
  })
```

**Step 3: 注册路由**
```typescript
// src/index.ts
import { authRoutes } from './routes/auth'

app.use(authRoutes)
```

**Step 4: 添加 bcrypt 依赖**
```bash
bun add bcryptjs
bun add -d @types/bcryptjs
```

**Step 5: Commit**
```bash
git add .
git commit -m "feat: add authentication API with JWT"
```

---

### Task 1.4: 实现教案 CRUD API

**Files:**
- Create: `backend/src/routes/plans.ts`
- Create: `backend/src/middleware/auth.ts`
- Modify: `backend/src/index.ts`

**Step 1: 创建认证中间件**
```typescript
// src/middleware/auth.ts
import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export const authMiddleware = new Elysia()
  .use(jwt({
    secret: process.env.JWT_SECRET!,
    exp: '24h'
  }))
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      throw new Error('Unauthorized')
    }
    
    const token = auth.slice(7)
    const payload = await jwt.verify(token)
    
    if (!payload) {
      throw new Error('Invalid token')
    }
    
    return {
      userId: payload.userId as string
    }
  })
```

**Step 2: 创建教案路由**
```typescript
// src/routes/plans.ts
import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const TipTapJSONSchema = t.Object({
  type: t.String(),
  content: t.Optional(t.Array(t.Any()))
})

export const planRoutes = new Elysia({ prefix: '/plans' })
  .use(authMiddleware)
  
  // 获取列表
  .get('/', async ({ userId, query }) => {
    const page = Number(query.page) || 1
    const pageSize = Number(query.pageSize) || 10
    
    const where = {
      teacherId: userId,
      ...(query.status && { status: query.status }),
      ...(query.courseName && { courseName: { contains: query.courseName } }),
      ...(query.keyword && { title: { contains: query.keyword } })
    }
    
    const [items, total] = await Promise.all([
      prisma.teachingPlan.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          courseName: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.teachingPlan.count({ where })
    ])
    
    return { items, total, page, pageSize }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      pageSize: t.Optional(t.String()),
      status: t.Optional(t.String()),
      courseName: t.Optional(t.String()),
      keyword: t.Optional(t.String())
    })
  })
  
  // 获取详情
  .get('/:id', async ({ params, userId }) => {
    const plan = await prisma.teachingPlan.findFirst({
      where: { id: params.id, teacherId: userId }
    })
    
    if (!plan) throw new Error('Plan not found')
    
    return plan
  })
  
  // 创建
  .post('/', async ({ body, userId }) => {
    const plan = await prisma.teachingPlan.create({
      data: {
        ...body,
        teacherId: userId,
        process: body.process || { type: 'doc', content: [] }
      }
    })
    
    return plan
  }, {
    body: t.Object({
      title: t.String(),
      courseName: t.String(),
      className: t.Optional(t.String()),
      duration: t.Optional(t.String()),
      objectives: t.Optional(TipTapJSONSchema),
      keyPoints: t.Optional(TipTapJSONSchema),
      process: t.Optional(TipTapJSONSchema),
      blackboard: t.Optional(TipTapJSONSchema),
      reflection: t.Optional(TipTapJSONSchema),
      methods: t.Optional(t.Array(t.String())),
      resources: t.Optional(t.Array(t.String()))
    })
  })
  
  // 更新
  .put('/:id', async ({ params, body, userId }) => {
    const existing = await prisma.teachingPlan.findFirst({
      where: { id: params.id, teacherId: userId }
    })
    
    if (!existing) throw new Error('Plan not found')
    
    const plan = await prisma.teachingPlan.update({
      where: { id: params.id },
      data: body
    })
    
    return plan
  })
  
  // 删除
  .delete('/:id', async ({ params, userId }) => {
    await prisma.teachingPlan.deleteMany({
      where: { id: params.id, teacherId: userId }
    })
    
    return { success: true }
  })
```

**Step 3: 注册路由**
```typescript
// src/index.ts
import { planRoutes } from './routes/plans'

app.use(planRoutes)
```

**Step 4: Commit**
```bash
git add .
git commit -m "feat: add teaching plan CRUD API with auth middleware"
```

---

### Task 1.5: 编写 API 测试

**Files:**
- Create: `backend/src/routes/auth.test.ts`
- Create: `backend/src/routes/plans.test.ts`
- Modify: `backend/package.json`

**Step 1: 安装测试工具**
```bash
bun add -d bun:test
```

**Step 2: 编写认证测试**
```typescript
// src/routes/auth.test.ts
import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { authRoutes } from './auth'

describe('Auth API', () => {
  const app = new Elysia().use(authRoutes)
  
  it('should register new user', async () => {
    const response = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
      })
    )
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.token).toBeDefined()
    expect(data.user.username).toBe('testuser')
  })
})
```

**Step 3: 添加测试脚本**
```json
// package.json
"scripts": {
  "test": "bun test",
  "test:watch": "bun test --watch"
}
```

**Step 4: 运行测试**
```bash
bun test
```
Expected: 测试通过

**Step 5: Commit**
```bash
git add .
git commit -m "test: add API tests for auth and plans"
```

---

## Milestone 2: 前端编辑器核心

### Task 2.1: 初始化 Vue 3 + TipTap 项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`

**Step 1: 创建项目**
```bash
mkdir frontend
cd frontend
npm create vite@latest . -- --template vue-ts
```

**Step 2: 安装依赖**
```bash
npm install
npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-image
npm install pinia vue-router@4 axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: 配置 Tailwind**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: 配置路径别名**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**Step 5: 验证启动**
```bash
npm run dev
```
Expected: Vite dev server on http://localhost:5173

**Step 6: Commit**
```bash
git add .
git commit -m "feat: init frontend with Vue 3 + TypeScript + TipTap + Tailwind"
```

---

### Task 2.2: 创建 TipTap 编辑器组件

**Files:**
- Create: `frontend/src/components/TipTapEditor.vue`
- Create: `frontend/src/components/EditorToolbar.vue`

**Step 1: 创建工具栏组件**
```vue
<!-- components/EditorToolbar.vue -->
<template>
  <div class="flex items-center gap-1 p-2 border-b bg-gray-50">
    <button
      @click="editor.chain().focus().toggleBold().run()"
      :class="{ 'bg-gray-200': editor.isActive('bold') }"
      class="p-2 rounded hover:bg-gray-200 transition"
      title="粗体"
    >
      <strong>B</strong>
    </button>
    
    <button
      @click="editor.chain().focus().toggleItalic().run()"
      :class="{ 'bg-gray-200': editor.isActive('italic') }"
      class="p-2 rounded hover:bg-gray-200 transition"
      title="斜体"
    >
      <em>I</em>
    </button>
    
    <button
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      :class="{ 'bg-gray-200': editor.isActive('heading', { level: 2 }) }"
      class="p-2 rounded hover:bg-gray-200 transition"
      title="标题"
    >
      H2
    </button>
    
    <div class="w-px h-6 bg-gray-300 mx-1" />
    
    <button
      @click="editor.chain().focus().toggleBulletList().run()"
      :class="{ 'bg-gray-200': editor.isActive('bulletList') }"
      class="p-2 rounded hover:bg-gray-200 transition"
      title="无序列表"
    >
      • List
    </button>
    
    <button
      @click="editor.chain().focus().toggleOrderedList().run()"
      :class="{ 'bg-gray-200': editor.isActive('orderedList') }"
      class="p-2 rounded hover:bg-gray-200 transition"
      title="有序列表"
    >
      1. List
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  editor: any
}>()
</script>
```

**Step 2: 创建编辑器组件**
```vue
<!-- components/TipTapEditor.vue -->
<template>
  <div class="border rounded-lg overflow-hidden bg-white">
    <EditorToolbar :editor="editor" v-if="editor" />
    
    <EditorContent
      :editor="editor"
      class="prose max-w-none p-4 min-h-[200px] focus:outline-none"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import EditorToolbar from './EditorToolbar.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: object): void
  (e: 'update:html', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getJSON())
    emit('update:html', editor.getHTML())
  },
})
</script>
```

**Step 3: 安装 prose 样式**
```bash
npm install -D @tailwindcss/typography
```

```javascript
// tailwind.config.js
plugins: [
  require('@tailwindcss/typography'),
],
```

**Step 4: Commit**
```bash
git add .
git commit -m "feat: add TipTap editor component with toolbar"
```

---

### Task 2.3: 创建教案编辑页面

**Files:**
- Create: `frontend/src/views/PlanEdit.vue`
- Create: `frontend/src/router/index.ts`
- Create: `frontend/src/stores/plan.ts`

**Step 1: 创建 Pinia Store**
```typescript
// src/stores/plan.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const usePlanStore = defineStore('plan', () => {
  const currentPlan = ref(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  
  const fetchPlan = async (id: string) => {
    isLoading.value = true
    const response = await axios.get(`${API_BASE}/plans/${id}`)
    currentPlan.value = response.data
    isLoading.value = false
    return response.data
  }
  
  const createPlan = async (data: any) => {
    const response = await axios.post(`${API_BASE}/plans`, data)
    return response.data
  }
  
  const updatePlan = async (id: string, data: any) => {
    isSaving.value = true
    const response = await axios.put(`${API_BASE}/plans/${id}`, data)
    currentPlan.value = response.data
    isSaving.value = false
    return response.data
  }
  
  return {
    currentPlan,
    isLoading,
    isSaving,
    fetchPlan,
    createPlan,
    updatePlan
  }
})
```

**Step 2: 创建编辑页面**
```vue
<!-- src/views/PlanEdit.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-6">
      <router-link to="/plans" class="text-blue-600 hover:underline">
        ← 返回列表
      </router-link>
      
      <div class="flex gap-3">
        <button
          @click="savePlan"
          :disabled="planStore.isSaving"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ planStore.isSaving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
    
    <!-- 基本信息 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">教案标题</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="输入教案标题"
        />
      </div>
      
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">课程名称</label>
          <input
            v-model="form.courseName"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="课程名称"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">授课班级</label>
          <input
            v-model="form.className"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="班级"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">课时安排</label>
          <input
            v-model="form.duration"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="如：2课时"
          />
        </div>
      </div>
    </div>
    
    <!-- 教学过程（核心） -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-medium mb-4">教学过程 *</h3>
      <TipTapEditor
        v-model="form.process"
        @update:html="form.htmlContent = $event"
      />
    </div>
    
    <!-- 其他章节（可展开） -->
    <div class="space-y-4">
      <CollapsibleSection title="教学目标" v-model="form.objectives" />
      <CollapsibleSection title="教学重难点" v-model="form.keyPoints" />
      <CollapsibleSection title="板书设计" v-model="form.blackboard" />
      <CollapsibleSection title="课后反思" v-model="form.reflection" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlanStore } from '../stores/plan'
import TipTapEditor from '../components/TipTapEditor.vue'
import CollapsibleSection from '../components/CollapsibleSection.vue'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()

const isNew = route.params.id === 'new'

const form = ref({
  title: '',
  courseName: '',
  className: '',
  duration: '',
  process: { type: 'doc', content: [{ type: 'paragraph' }] },
  objectives: null,
  keyPoints: null,
  blackboard: null,
  reflection: null,
  htmlContent: ''
})

onMounted(async () => {
  if (!isNew) {
    const plan = await planStore.fetchPlan(route.params.id as string)
    Object.assign(form.value, plan)
  }
})

const savePlan = async () => {
  if (isNew) {
    const newPlan = await planStore.createPlan(form.value)
    router.replace(`/plans/${newPlan.id}/edit`)
  } else {
    await planStore.updatePlan(route.params.id as string, form.value)
  }
}
</script>
```

**Step 3: 配置路由**
```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import PlanEdit from '../views/PlanEdit.vue'

const routes = [
  {
    path: '/plans/new',
    name: 'NewPlan',
    component: PlanEdit
  },
  {
    path: '/plans/:id/edit',
    name: 'EditPlan',
    component: PlanEdit
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

**Step 4: Commit**
```bash
git add .
git commit -m "feat: add plan edit page with TipTap integration"
```

---

## Milestone 3: WPS 导出集成

### Task 3.1: 实现 WPS 导出服务

**Files:**
- Create: `backend/src/services/wps.ts`
- Create: `backend/src/routes/export.ts`

**Step 1: 创建 WPS 服务**
```typescript
// src/services/wps.ts
import axios from 'axios'

const WPS_BASE_URL = 'https://solution.wps.cn'

export class WPSService {
  private appId: string
  private appSecret: string

  constructor() {
    this.appId = process.env.WPS_APP_ID!
    this.appSecret = process.env.WPS_APP_SECRET!
  }

  async createDocument(title: string, htmlContent: string) {
    // TODO: 实现 WPS API 调用
    // 1. 获取 access token
    // 2. 创建文档
    // 3. 填充 HTML 内容
    return { id: 'mock-id', previewUrl: 'mock-url' }
  }

  async exportToWord(documentId: string) {
    // TODO: 导出 Word 文件
    return Buffer.from('mock-docx')
  }
}

export const wpsService = new WPSService()
```

**Step 2: 创建导出路由**
```typescript
// src/routes/export.ts
import { Elysia } from 'elysia'
import { wpsService } from '../services/wps'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

export const exportRoutes = new Elysia({ prefix: '/export' })
  .use(authMiddleware)
  
  .post('/word', async ({ body, userId }) => {
    const plan = await prisma.teachingPlan.findFirst({
      where: { id: body.planId, teacherId: userId }
    })
    
    if (!plan) throw new Error('Plan not found')
    if (!plan.htmlContent) throw new Error('No content to export')
    
    // 转换为完整 HTML 文档
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${plan.title}</title>
        <style>
          body { font-family: "SimSun", serif; }
          h1 { text-align: center; }
        </style>
      </head>
      <body>
        <h1>${plan.title}</h1>
        <p>课程名称：${plan.courseName}</p>
        <hr/>
        ${plan.htmlContent}
      </body>
      </html>
    `
    
    const doc = await wpsService.createDocument(plan.title, fullHtml)
    const buffer = await wpsService.exportToWord(doc.id)
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${plan.title}.docx"`
      }
    })
  }, {
    body: t.Object({
      planId: t.String()
    })
  })
```

**Step 3: Commit**
```bash
git add .
git commit -m "feat: add WPS export service and routes (mock implementation)"
```

---

## Milestone 4: 管理与部署

### Task 4.1: 创建教案列表页面

**Files:**
- Create: `frontend/src/views/PlanList.vue`
- Modify: `frontend/src/router/index.ts`

**Step 1: 实现列表页面**
```vue
<!-- src/views/PlanList.vue -->
<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">我的教案</h1>
      <router-link
        to="/plans/new"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + 新建教案
      </router-link>
    </div>
    
    <!-- 筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
      <input
        v-model="filters.keyword"
        @input="handleSearch"
        type="text"
        placeholder="搜索教案标题..."
        class="flex-1 px-3 py-2 border rounded"
      />
      
      <select v-model="filters.status" @change="fetchPlans" class="px-3 py-2 border rounded">
        <option value="">所有状态</option>
        <option value="draft">草稿</option>
        <option value="published">已发布</option>
        <option value="archived">已归档</option>
      </select>
    </div>
    
    <!-- 列表 -->
    <div class="bg-white rounded-lg shadow">
      <div v-if="planStore.isLoading" class="p-8 text-center text-gray-500">
        加载中...
      </div>
      
      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">标题</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">课程</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">状态</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-500">更新时间</th>
            <th class="px-6 py-3 text-right text-sm font-medium text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="plan in planStore.plans" :key="plan.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">{{ plan.title }}</td>
            <td class="px-6 py-4">{{ plan.courseName }}</td>
            <td class="px-6 py-4">
              <span :class="statusClass(plan.status)">
                {{ statusText(plan.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(plan.updatedAt) }}</td>
            <td class="px-6 py-4 text-right">
              <router-link
                :to="`/plans/${plan.id}/edit`"
                class="text-blue-600 hover:underline mr-3"
              >
                编辑
              </router-link>
              <button @click="deletePlan(plan.id)" class="text-red-600 hover:underline">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlanStore } from '../stores/plan'

const planStore = usePlanStore()

const filters = ref({
  keyword: '',
  status: ''
})

onMounted(() => {
  fetchPlans()
})

const fetchPlans = () => {
  planStore.fetchPlans(filters.value)
}

const handleSearch = debounce(fetchPlans, 300)

const statusClass = (status: string) => ({
  'px-2 py-1 text-xs rounded': true,
  'bg-gray-100 text-gray-700': status === 'draft',
  'bg-green-100 text-green-700': status === 'published',
  'bg-yellow-100 text-yellow-700': status === 'archived'
})

const statusText = (status: string) => ({
  draft: '草稿',
  published: '已发布',
  archived: '已归档'
})[status] || status

const formatDate = (date: string) => new Date(date).toLocaleDateString('zh-CN')

const deletePlan = async (id: string) => {
  if (!confirm('确定删除此教案？')) return
  await planStore.deletePlan(id)
  fetchPlans()
}

function debounce(fn: Function, delay: number) {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
</script>
```

**Step 2: Commit**
```bash
git add .
git commit -m "feat: add plan list page with search and filter"
```

---

### Task 4.2: 创建 Docker 配置

**Files:**
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docker-compose.yml`
- Create: `nginx/nginx.conf`

**Step 1: 后端 Dockerfile**
```dockerfile
# backend/Dockerfile
FROM oven/bun:1 as builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
```

**Step 2: 前端 Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Step 3: Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/teaching_plan
      - JWT_SECRET=dev-secret-key
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=teaching_plan
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Step 4: Commit**
```bash
git add .
git commit -m "feat: add Docker configuration for development"
```

---

## 完成清单

### 测试验证
- [ ] 后端 API 测试通过
- [ ] 前端组件测试通过
- [ ] 集成测试：完整创建-编辑-导出流程
- [ ] Docker 构建成功
- [ ] 部署验证

### 文档
- [ ] API 文档
- [ ] 部署文档
- [ ] 用户手册

---

*计划创建完成 - 准备进入执行阶段*
