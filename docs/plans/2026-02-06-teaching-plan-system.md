# 教案管理系统 (Teaching Plan System) 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建基于 TipTap + WPS API 的高职院校教案编写管理 Web 应用

**Architecture:** 
- 前端：Vue 3 + TipTap 富文本编辑器，专注内容编辑
- 后端：Node.js + Express，提供 API 服务
- 存储：PostgreSQL 存储结构化教案数据
- 导出：WPS WebOffice API 实现教案渲染和导出

**Tech Stack:** Vue 3, TipTap/ProseMirror, Node.js, Express, PostgreSQL, WPS WebOffice SDK

---

## 项目里程碑

- **Phase 1**: 基础架构搭建 (MVP)
- **Phase 2**: 教案编辑器核心功能
- **Phase 3**: WPS API 集成
- **Phase 4**: 教案管理与协作功能

---

## Phase 1: 基础架构搭建

### Task 1.1: 初始化前端项目

**Files:**
- Create: `src/frontend/package.json`
- Create: `src/frontend/vite.config.js`
- Create: `src/frontend/index.html`

**Step 1: 创建 Vue 3 + Vite 项目**

```bash
cd ~/Projects/teaching-plan-system/src/frontend
npm create vite@latest . -- --template vue
npm install
```

**Step 2: 安装核心依赖**

```bash
npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-image
npm install pinia vue-router axios
npm install tailwindcss postcss autoprefixer -D
npx tailwindcss init -p
```

**Step 3: 配置 Tailwind CSS**

修改 `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

修改 `src/style.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: 验证项目启动**

```bash
npm run dev
```
Expected: Vite dev server starts on http://localhost:5173

**Step 5: Commit**

```bash
git add .
git commit -m "feat: init frontend project with Vue 3 + Vite + Tailwind"
```

---

### Task 1.2: 初始化后端项目

**Files:**
- Create: `src/backend/package.json`
- Create: `src/backend/server.js`
- Create: `src/backend/.env.example`

**Step 1: 创建 Node.js 项目**

```bash
cd ~/Projects/teaching-plan-system/src/backend
npm init -y
```

**Step 2: 安装依赖**

```bash
npm install express cors dotenv pg sequelize
npm install -D nodemon jest supertest
```

**Step 3: 创建基础服务器**

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 4: 配置环境变量**

```bash
# .env.example
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/teaching_plan_db
WPS_APP_ID=your_wps_app_id
WPS_APP_SECRET=your_wps_app_secret
```

**Step 5: 添加启动脚本**

```json
// package.json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}
```

**Step 6: 验证服务器启动**

```bash
npm run dev
```
Expected: Server starts on port 3000, health check returns OK

**Step 7: Commit**

```bash
git add .
git commit -m "feat: init backend project with Express + PostgreSQL setup"
```

---

### Task 1.3: 数据库模型设计

**Files:**
- Create: `src/backend/models/index.js`
- Create: `src/backend/models/TeachingPlan.js`
- Create: `src/backend/models/User.js`
- Create: `src/backend/config/database.js`

**Step 1: 配置数据库连接**

```javascript
// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
```

**Step 2: 定义教案模型**

```javascript
// models/TeachingPlan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeachingPlan = sequelize.define('TeachingPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  htmlContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'teaching_plans',
  timestamps: true,
});

module.exports = TeachingPlan;
```

**Step 3: 定义用户模型**

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('teacher', 'admin', 'department_head'),
    defaultValue: 'teacher',
  },
  department: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
```

**Step 4: 模型关联**

```javascript
// models/index.js
const sequelize = require('../config/database');
const TeachingPlan = require('./TeachingPlan');
const User = require('./User');

// Associations
TeachingPlan.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
User.hasMany(TeachingPlan, { foreignKey: 'teacherId', as: 'teachingPlans' });

module.exports = {
  sequelize,
  TeachingPlan,
  User,
};
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add database models for TeachingPlan and User"
```

---

## Phase 2: 教案编辑器核心功能

### Task 2.1: TipTap 编辑器组件

**Files:**
- Create: `src/frontend/src/components/TipTapEditor.vue`
- Create: `src/frontend/src/stores/editor.js`

**Step 1: 创建 TipTap 编辑器组件**

```vue
<!-- components/TipTapEditor.vue -->
<template>
  <div class="editor-wrapper border rounded-lg">
    <div class="editor-toolbar border-b p-2 flex gap-2">
      <button 
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'bg-gray-200': editor.isActive('bold') }"
        class="px-2 py-1 rounded hover:bg-gray-100"
      >
        粗体
      </button>
      <button 
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'bg-gray-200': editor.isActive('italic') }"
        class="px-2 py-1 rounded hover:bg-gray-100"
      >
        斜体
      </button>
      <button 
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-gray-200': editor.isActive('heading', { level: 2 }) }"
        class="px-2 py-1 rounded hover:bg-gray-100"
      >
        标题
      </button>
      <button 
        @click="addImage"
        class="px-2 py-1 rounded hover:bg-gray-100"
      >
        图片
      </button>
    </div>
    <editor-content 
      :editor="editor" 
      class="editor-content p-4 min-h-[400px]"
    />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

const props = defineProps({
  modelValue: Object,
})

const emit = defineEmits(['update:modelValue', 'update:html'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getJSON())
    emit('update:html', editor.getHTML())
  },
})

const addImage = () => {
  const url = window.prompt('输入图片URL')
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}
</script>
```

**Step 2: 创建编辑器 Store**

```javascript
// stores/editor.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const content = ref({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  })
  const htmlContent = ref('')
  const isDirty = ref(false)
  
  const setContent = (newContent) => {
    content.value = newContent
    isDirty.value = true
  }
  
  const setHtmlContent = (html) => {
    htmlContent.value = html
  }
  
  const saveContent = async () => {
    // TODO: API call to save
    isDirty.value = false
    return { success: true }
  }
  
  return {
    content,
    htmlContent,
    isDirty,
    setContent,
    setHtmlContent,
    saveContent,
  }
})
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add TipTap editor component with basic toolbar"
```

---

### Task 2.2: 教案编辑页面

**Files:**
- Create: `src/frontend/src/views/TeachingPlanEdit.vue`
- Create: `src/frontend/src/router/index.js`

**Step 1: 创建编辑页面**

```vue
<!-- views/TeachingPlanEdit.vue -->
<template>
  <div class="teaching-plan-edit p-6 max-w-6xl mx-auto">
    <div class="mb-6">
      <input 
        v-model="planForm.title"
        placeholder="教案标题"
        class="w-full text-2xl font-bold border-b-2 border-gray-200 pb-2 focus:border-blue-500 outline-none"
      />
    </div>
    
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label class="block text-sm text-gray-600 mb-1">课程名称</label>
        <input 
          v-model="planForm.courseName"
          placeholder="输入课程名称"
          class="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">授课班级</label>
        <input 
          v-model="planForm.className"
          placeholder="输入班级"
          class="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
    
    <TipTapEditor 
      v-model="planForm.content"
      @update:html="planForm.htmlContent = $event"
    />
    
    <div class="mt-6 flex justify-between items-center">
      <span v-if="isDirty" class="text-orange-500">有未保存的更改</span>
      <div class="flex gap-3">
        <button 
          @click="previewPlan"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          预览
        </button>
        <button 
          @click="exportPlan"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          导出Word
        </button>
        <button 
          @click="savePlan"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          :disabled="saving"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import TipTapEditor from '../components/TipTapEditor.vue'

const route = useRoute()
const planId = route.params.id

const planForm = ref({
  title: '',
  courseName: '',
  className: '',
  content: null,
  htmlContent: '',
})

const isDirty = ref(false)
const saving = ref(false)

const savePlan = async () => {
  saving.value = true
  // TODO: API call
  await new Promise(r => setTimeout(r, 500))
  isDirty.value = false
  saving.value = false
}

const previewPlan = () => {
  // TODO: Open preview modal or page
}

const exportPlan = () => {
  // TODO: Call WPS API
}
</script>
```

**Step 2: 配置路由**

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import TeachingPlanEdit from '../views/TeachingPlanEdit.vue'

const routes = [
  {
    path: '/plan/new',
    name: 'NewPlan',
    component: TeachingPlanEdit,
  },
  {
    path: '/plan/:id/edit',
    name: 'EditPlan',
    component: TeachingPlanEdit,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add teaching plan edit page with form and editor"
```

---

## Phase 3: WPS API 集成

### Task 3.1: WPS 服务封装

**Files:**
- Create: `src/backend/services/wpsService.js`
- Create: `src/backend/routes/export.js`

**Step 1: 创建 WPS 服务**

```javascript
// services/wpsService.js
const axios = require('axios');

class WPSService {
  constructor() {
    this.appId = process.env.WPS_APP_ID;
    this.appSecret = process.env.WPS_APP_SECRET;
    this.baseURL = 'https://solution.wps.cn';
  }

  async getAccessToken() {
    // TODO: Implement WPS OAuth
    return 'token';
  }

  async createDocument(title, htmlContent) {
    // Convert HTML to WPS format and create document
    const response = await axios.post(
      `${this.baseURL}/api/documents`,
      {
        title,
        content: htmlContent,
        format: 'html',
      },
      {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
        },
      }
    );
    return response.data;
  }

  async getPreviewURL(documentId) {
    const response = await axios.get(
      `${this.baseURL}/api/documents/${documentId}/preview`,
      {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
        },
      }
    );
    return response.data.previewUrl;
  }

  async exportToWord(documentId) {
    const response = await axios.post(
      `${this.baseURL}/api/documents/${documentId}/export`,
      { format: 'docx' },
      {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
        },
        responseType: 'stream',
      }
    );
    return response.data;
  }
}

module.exports = new WPSService();
```

**Step 2: 创建导出路由**

```javascript
// routes/export.js
const express = require('express');
const router = express.Router();
const wpsService = require('../services/wpsService');

// POST /api/export/preview - 创建预览
router.post('/preview', async (req, res) => {
  try {
    const { title, htmlContent } = req.body;
    const doc = await wpsService.createDocument(title, htmlContent);
    const previewUrl = await wpsService.getPreviewURL(doc.id);
    res.json({ previewUrl, documentId: doc.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/export/word - 导出Word
router.post('/word', async (req, res) => {
  try {
    const { title, htmlContent } = req.body;
    const doc = await wpsService.createDocument(title, htmlContent);
    const stream = await wpsService.exportToWord(doc.id);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.docx"`);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Step 3: 注册路由**

```javascript
// server.js (add to existing file)
const exportRoutes = require('./routes/export');
app.use('/api/export', exportRoutes);
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add WPS API service and export routes"
```

---

### Task 3.2: 前端导出功能

**Files:**
- Modify: `src/frontend/src/views/TeachingPlanEdit.vue`
- Create: `src/frontend/src/services/exportApi.js`

**Step 1: 创建导出 API 服务**

```javascript
// services/exportApi.js
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const exportApi = {
  async preview(title, htmlContent) {
    const response = await axios.post(`${API_BASE}/api/export/preview`, {
      title,
      htmlContent,
    })
    return response.data
  },

  async exportWord(title, htmlContent) {
    const response = await axios.post(
      `${API_BASE}/api/export/word`,
      { title, htmlContent },
      { responseType: 'blob' }
    )
    
    // Create download link
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}.docx`
    link.click()
    window.URL.revokeObjectURL(url)
  },
}
```

**Step 2: 更新编辑页面**

```javascript
// Add to TeachingPlanEdit.vue script
import { exportApi } from '../services/exportApi.js'

const exportPlan = async () => {
  try {
    await exportApi.exportWord(planForm.value.title, planForm.value.htmlContent)
  } catch (error) {
    alert('导出失败: ' + error.message)
  }
}

const previewPlan = async () => {
  try {
    const { previewUrl } = await exportApi.preview(
      planForm.value.title, 
      planForm.value.htmlContent
    )
    window.open(previewUrl, '_blank')
  } catch (error) {
    alert('预览失败: ' + error.message)
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: integrate WPS export functionality in frontend"
```

---

## Phase 4: 教案管理与协作

### Task 4.1: 教案列表页

**Files:**
- Create: `src/frontend/src/views/TeachingPlanList.vue`
- Create: `src/frontend/src/services/planApi.js`

**Step 1: 创建教案列表页面**

```vue
<!-- views/TeachingPlanList.vue -->
<template>
  <div class="teaching-plan-list p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">我的教案</h1>
      <router-link 
        to="/plan/new"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        + 新建教案
      </router-link>
    </div>
    
    <div class="grid gap-4">
      <div 
        v-for="plan in plans" 
        :key="plan.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold text-lg">{{ plan.title }}</h3>
            <p class="text-gray-600 text-sm mt-1">{{ plan.courseName }}</p>
            <div class="flex gap-2 mt-2 text-xs text-gray-500">
              <span>版本 {{ plan.version }}</span>
              <span>·</span>
              <span>{{ formatDate(plan.updatedAt) }}</span>
            </div>
          </div>
          <span 
            :class="statusClass(plan.status)"
            class="px-2 py-1 rounded text-xs"
          >
            {{ statusText(plan.status) }}
          </span>
        </div>
        
        <div class="mt-4 flex gap-2">
          <router-link 
            :to="`/plan/${plan.id}/edit`"
            class="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            编辑
          </router-link>
          <button 
            @click="duplicatePlan(plan)"
            class="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            复制
          </button>
          <button 
            @click="deletePlan(plan)"
            class="px-3 py-1 text-sm border rounded text-red-500 hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { planApi } from '../services/planApi.js'

const plans = ref([])

const fetchPlans = async () => {
  plans.value = await planApi.getMyPlans()
}

const statusClass = (status) => ({
  'bg-gray-100 text-gray-600': status === 'draft',
  'bg-green-100 text-green-600': status === 'published',
  'bg-yellow-100 text-yellow-600': status === 'archived',
})

const statusText = (status) => ({
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
})[status]

const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const duplicatePlan = async (plan) => {
  await planApi.duplicate(plan.id)
  await fetchPlans()
}

const deletePlan = async (plan) => {
  if (confirm(`确定删除教案 "${plan.title}" 吗？`)) {
    await planApi.delete(plan.id)
    await fetchPlans()
  }
}

onMounted(fetchPlans)
</script>
```

**Step 2: 创建教案 API 服务**

```javascript
// services/planApi.js
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const planApi = {
  async getMyPlans() {
    const response = await axios.get(`${API_BASE}/api/plans`)
    return response.data
  },

  async getPlan(id) {
    const response = await axios.get(`${API_BASE}/api/plans/${id}`)
    return response.data
  },

  async create(plan) {
    const response = await axios.post(`${API_BASE}/api/plans`, plan)
    return response.data
  },

  async update(id, plan) {
    const response = await axios.put(`${API_BASE}/api/plans/${id}`, plan)
    return response.data
  },

  async duplicate(id) {
    const response = await axios.post(`${API_BASE}/api/plans/${id}/duplicate`)
    return response.data
  },

  async delete(id) {
    await axios.delete(`${API_BASE}/api/plans/${id}`)
  },
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add teaching plan list page with CRUD operations"
```

---

## 测试策略

### 单元测试

```bash
# Backend
cd src/backend
npm test

# Frontend
cd src/frontend
npm test
```

### 集成测试清单

- [ ] TipTap 编辑器内容保存正确
- [ ] 教案CRUD操作正常
- [ ] WPS API 导出功能正常
- [ ] 页面路由和导航正常

---

## 部署清单

### 环境变量

```bash
# .env (production)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
WPS_APP_ID=your_wps_app_id
WPS_APP_SECRET=your_wps_app_secret
```

### 构建命令

```bash
# Frontend
cd src/frontend
npm run build

# Backend
cd src/backend
npm install --production
npm start
```

---

*计划创建时间: 2026-02-06*
*版本: v1.0*
