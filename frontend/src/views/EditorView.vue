<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <div class="flex items-center gap-2 sm:gap-4">
            <router-link
              to="/"
              class="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            
            <div>
              <h1 class="text-base sm:text-lg font-semibold text-slate-800">{{ isEditing ? '编辑教案' : '新建教案' }}</h1>
              <p class="text-xs sm:text-sm text-slate-500 hidden sm:block">
                {{ planStore.isSaving ? '保存中...' : (lastSaved ? `最后保存: ${lastSaved}` : '未保存') }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Mobile Menu Button -->
            <button
              @click="showMobileActions = !showMobileActions"
              class="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            
            <!-- Desktop Buttons -->
            <div class="hidden sm:flex items-center gap-3">
              <button
                v-if="isEditing"
                @click="handleExport"
                class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                导出 Word
              </button>
              
              <button
                v-if="isEditing && planStore.currentPlan?.status === 'DRAFT'"
                @click="handlePublish"
                :disabled="planStore.isSaving"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                发布
              </button>
              
              <button
                @click="handleSave"
                :disabled="planStore.isSaving || !isFormValid"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                {{ planStore.isSaving ? '保存中...' : '保存' }}
              </button>
            </div>
            
            <!-- Mobile Save Button Only -->
            <button
              @click="handleSave"
              :disabled="planStore.isSaving || !isFormValid"
              class="sm:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Mobile Actions Menu -->
        <div v-if="showMobileActions" class="sm:hidden border-t border-slate-200 py-3 space-y-2">
          <button
            v-if="isEditing"
            @click="handleExport"
            class="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出 Word
          </button>
          
          <button
            v-if="isEditing && planStore.currentPlan?.status === 'DRAFT'"
            @click="handlePublish"
            :disabled="planStore.isSaving"
            class="w-full flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            发布教案
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Error Message -->
      <div
        v-if="planStore.error"
        class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm sm:text-base"
      >
        {{ planStore.error }}
      </div>

      <!-- Basic Info -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          基本信息
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">
              教案标题 *
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="例如：Vue 3 基础入门"
              class="w-full px-3 sm:px-4 py-2 border sm:py-2.5 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              课程名称 *
            </label>
            <input
              v-model="form.courseName"
              type="text"
              placeholder="例如：前端开发技术"
              class="w-full px-3 sm:px-4 py-2 border sm:py-2.5 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              授课班级 *
            </label>
            <input
              v-model="form.className"
              type="text"
              placeholder="例如：计算机2301班"
              class="w-full px-3 sm:px-4 py-2 border sm:py-2.5 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              课时长度（分钟）*
            </label>
            <input
              v-model.number="form.duration"
              type="number"
              min="1"
              max="300"
              class="w-full px-3 sm:px-4 py-2 border sm:py-2.5 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              教学方法
            </label>
            <input
              v-model="form.methods"
              type="text"
              placeholder="例如：讲授法、案例教学"
              class="w-full px-3 sm:px-4 py-2 border sm:py-2.5 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              教学资源
            </label>
            <input
              v-model="form.resources"
              type="text"
              placeholder="例如：PPT、视频、实验设备"
              class="w-full px-3 sm:px-4 py-2 border sm:py-2.5 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </section>

      <!-- Teaching Objectives -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          教学目标
        </h2>
        
        <TipTapEditor v-model="form.objectives" v-model:modelJson="form.contentJson.objectives" />
      </section>

      <!-- Key Points -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          重点难点
        </h2>
        
        <TipTapEditor v-model="form.keyPoints" v-model:modelJson="form.contentJson.keyPoints" />
      </section>

      <!-- Teaching Process -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          教学过程
        </h2>
        
        <TipTapEditor v-model="form.process" v-model:modelJson="form.contentJson.process" />
      </section>

      <!-- Blackboard Design -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          板书设计
        </h2>
        
        <TipTapEditor v-model="form.blackboard" v-model:modelJson="form.contentJson.blackboard" />
      </section>

      <!-- Teaching Reflection -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          教学反思
        </h2>
        
        <TipTapEditor v-model="form.reflection" v-model:modelJson="form.contentJson.reflection" />
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import type { TeachingPlan } from '../stores/plan'
import type { JSONContent } from '@tiptap/core'

export type EditorContentJson = Partial<
  Record<'objectives' | 'keyPoints' | 'process' | 'blackboard' | 'reflection', JSONContent>
>
type RichTextField = keyof EditorContentJson

export type EditorPlanForm = {
  title: string
  courseName: string
  className: string
  duration: number
  methods: string
  resources: string
  objectives: string
  keyPoints: string
  process: string
  blackboard: string
  reflection: string
  contentJson: EditorContentJson
}

const fallbackRichText = (value?: string) => value || '<p></p>'
const RICH_TEXT_FIELDS: RichTextField[] = ['objectives', 'keyPoints', 'process', 'blackboard', 'reflection']
const KNOWN_LAYOUT_NODE_TYPES = new Set([
  'lessonTimeline',
  'activityStepCard',
  'goalActivityAssessmentGrid',
])

const createTextParagraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const htmlToText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const buildLayoutNodeFromTag = (type: string, tag: string): JSONContent | null => {
  if (!KNOWN_LAYOUT_NODE_TYPES.has(type)) {
    return null
  }

  const starter = tag.match(/data-starter=\"([^\"]*)\"/i)?.[1]
  const starterText = starter || '示例：请根据本节教学安排补充内容'
  const baseContent = [createTextParagraph(starterText)]

  if (type === 'lessonTimeline') {
    const title = tag.match(/data-title=\"([^\"]*)\"/i)?.[1] || '时间轴'
    const minutesRaw = tag.match(/data-minutes=\"([^\"]*)\"/i)?.[1]
    const minutes = minutesRaw ? Number(minutesRaw) || 0 : 0
    return { type, attrs: { title, minutes, starter: starterText }, content: baseContent }
  }

  if (type === 'activityStepCard') {
    const title = tag.match(/data-title=\"([^\"]*)\"/i)?.[1] || '步骤卡'
    const steps = tag.match(/data-steps=\"([^\"]*)\"/i)?.[1] || '[]'
    return { type, attrs: { title, steps, starter: starterText }, content: baseContent }
  }

  const goal = tag.match(/data-goal=\"([^\"]*)\"/i)?.[1] || ''
  const activity = tag.match(/data-activity=\"([^\"]*)\"/i)?.[1] || ''
  const assessment = tag.match(/data-assessment=\"([^\"]*)\"/i)?.[1] || ''
  return { type, attrs: { goal, activity, assessment, starter: starterText }, content: baseContent }
}

const deriveDocFromHtml = (html?: string): JSONContent => {
  if (!html || !html.trim()) {
    return { type: 'doc', content: [createTextParagraph('')] }
  }

  const content: JSONContent[] = []
  const markerTagRegex = /<[^>]*data-node-type=\"([^\"]+)\"[^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = markerTagRegex.exec(html)) !== null) {
    const type = match[1]
    const tag = match[0]
    const node = buildLayoutNodeFromTag(type, tag)
    if (node) {
      content.push(node)
    }
  }

  if (content.length === 0) {
    const text = htmlToText(html)
    content.push(createTextParagraph(text))
  }

  return { type: 'doc', content }
}

const isValidDoc = (value: unknown): value is JSONContent => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const doc = value as JSONContent
  return doc.type === 'doc' && Array.isArray(doc.content)
}

const ensureCompleteContentJson = (form: EditorPlanForm): EditorContentJson => {
  const result: EditorContentJson = {}
  const source = form.contentJson || {}

  for (const field of RICH_TEXT_FIELDS) {
    const existing = source[field]
    if (isValidDoc(existing)) {
      result[field] = existing
      continue
    }
    result[field] = deriveDocFromHtml(form[field])
  }

  return result
}

export const mapFetchedPlanToForm = (plan: Partial<TeachingPlan>): EditorPlanForm => ({
  title: plan.title || '',
  courseName: plan.courseName || '',
  className: plan.className || '',
  duration: plan.duration || 90,
  methods: plan.methods || '',
  resources: plan.resources || '',
  objectives: fallbackRichText(plan.objectives),
  keyPoints: fallbackRichText(plan.keyPoints),
  process: fallbackRichText(plan.process),
  blackboard: fallbackRichText(plan.blackboard),
  reflection: fallbackRichText(plan.reflection),
  contentJson: plan.contentJson || {},
})

export const buildPlanPayload = (form: EditorPlanForm) => ({
  ...form,
  contentJson: ensureCompleteContentJson(form),
  htmlContent: form.process,
})
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlanStore } from '../stores/plan'
import TipTapEditor from '../components/TipTapEditor.vue'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()

const planId = computed(() => route.params.id as string)
const isEditing = computed(() => !!planId.value)
const lastSaved = ref('')
const showMobileActions = ref(false)

const isFormValid = computed(() => {
  return form.title.trim() && 
         form.courseName.trim() && 
         form.className.trim() && 
         form.duration > 0
})

const form = reactive({
  title: '',
  courseName: '',
  className: '',
  duration: 90,
  methods: '',
  resources: '',
  objectives: '<p></p>',
  keyPoints: '<p></p>',
  process: '<p></p>',
  blackboard: '<p></p>',
  reflection: '<p></p>',
  contentJson: {},
})

onMounted(async () => {
  if (isEditing.value) {
    await loadPlan()
  }
})

const loadPlan = async () => {
  try {
    const plan = await planStore.fetchPlan(planId.value)
    const mapped = mapFetchedPlanToForm(plan)
    Object.assign(form, mapped)
    
    if (plan.updatedAt) {
      lastSaved.value = new Date(plan.updatedAt).toLocaleString('zh-CN')
    }
  } catch (error) {
    console.error('加载教案失败:', error)
    alert('加载教案失败')
    router.push('/')
  }
}

const handleSave = async () => {
  if (!isFormValid.value) {
    alert('请填写所有必填字段')
    return
  }
  
  try {
    const data = buildPlanPayload(form)
    
    if (isEditing.value) {
      await planStore.updatePlan(planId.value, data)
    } else {
      const result = await planStore.createPlan(data)
      if (result?.id) {
        // Redirect to edit page after creation
        router.replace(`/editor/${result.id}`)
      }
    }
    
    lastSaved.value = new Date().toLocaleString('zh-CN')
  } catch (error: any) {
    alert('保存失败: ' + (error.message || '未知错误'))
  }
}

const handlePublish = async () => {
  if (!confirm('确定要发布这个教案吗？发布后所有人都可以查看。')) {
    return
  }
  
  try {
    await planStore.publishPlan(planId.value)
    alert('教案已发布！')
  } catch (error: any) {
    alert('发布失败: ' + (error.message || '未知错误'))
  }
}

const handleExport = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/export/word/${planId.value}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('导出失败')
    }
    
    // 下载文件
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.title}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    alert('导出失败: ' + (error.message || '未知错误'))
  }
}
</script>
