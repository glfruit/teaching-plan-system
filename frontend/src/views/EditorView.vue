<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <router-link
              to="/"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            
            <div>
              <h1 class="text-lg font-semibold text-slate-800">{{ isEditing ? '编辑教案' : '新建教案' }}</h1>
              <p class="text-sm text-slate-500">{{ isEditing ? '最后保存: 刚刚' : '开始创建新教案' }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <button
              @click="saveDraft"
              :disabled="isSaving"
              class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
            >
              {{ isSaving ? '保存中...' : '保存草稿' }}
            </button>
            
            <button
              @click="publishPlan"
              :disabled="isPublishing"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
            >
              {{ isPublishing ? '发布中...' : '发布教案' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Basic Info -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          基本信息
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">教案标题 *</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="例如：Vue 3 基础入门"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">课程名称 *</label>
            <input
              v-model="form.courseName"
              type="text"
              placeholder="例如：前端开发技术"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">授课班级 *</label>
            <input
              v-model="form.className"
              type="text"
              placeholder="例如：计算机2301班"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">课时长度（分钟）*</label>
            <input
              v-model.number="form.duration"
              type="number"
              min="1"
              max="300"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">教学方法</label>
            <input
              v-model="form.methods"
              type="text"
              placeholder="例如：讲授法、案例教学"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
        
        <TipTapEditor v-model="form.objectives" />
      </section>

      <!-- Key Points -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          重点难点
        </h2>
        
        <TipTapEditor v-model="form.keyPoints" />
      </section>

      <!-- Teaching Process -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          教学过程
        </h2>
        
        <TipTapEditor v-model="form.process" />
      </section>

      <!-- Blackboard Design -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          板书设计
        </h2>
        
        <TipTapEditor v-model="form.blackboard" />
      </section>

      <!-- Teaching Reflection -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          教学反思
        </h2>
        
        <TipTapEditor v-model="form.reflection" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TipTapEditor from '../components/TipTapEditor.vue'

const route = useRoute()
const router = useRouter()

const planId = computed(() => route.params.id as string)
const isEditing = computed(() => !!planId.value)

const isSaving = ref(false)
const isPublishing = ref(false)

const form = reactive({
  title: '',
  courseName: '',
  className: '',
  duration: 90,
  methods: '',
  objectives: '<p></p>',
  keyPoints: '<p></p>',
  process: '<p></p>',
  blackboard: '<p></p>',
  reflection: '<p></p>',
})

const saveDraft = async () => {
  isSaving.value = true
  try {
    // TODO: 调用 API 保存草稿
    console.log('保存草稿:', form)
    await new Promise(resolve => setTimeout(resolve, 500))
    alert('草稿保存成功！')
  } catch (error) {
    alert('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const publishPlan = async () => {
  isPublishing.value = true
  try {
    // TODO: 调用 API 发布教案
    console.log('发布教案:', form)
    await new Promise(resolve => setTimeout(resolve, 500))
    alert('教案发布成功！')
    router.push('/')
  } catch (error) {
    alert('发布失败，请重试')
  } finally {
    isPublishing.value = false
  }
}
</script>
