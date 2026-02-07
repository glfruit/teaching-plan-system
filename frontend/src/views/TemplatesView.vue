<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 class="text-lg sm:text-xl font-bold text-slate-800">教案模板库</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <button
              @click="router.push('/')"
              class="text-slate-600 hover:text-slate-900 font-medium"
            >
              返回首页
            </button>
            
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ authStore.user?.username }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="handleCategoryChange(cat.value)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
          :class="currentCategory === cat.value 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="templateStore.isLoading" class="flex justify-center py-20">
        <div class="flex items-center gap-3 text-slate-500">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>加载中...</span>
        </div>
      </div>

      <template v-else>
        <!-- System Templates -->
        <section class="mb-10">
          <div class="flex items-center gap-2 mb-4">
            <h2 class="text-lg font-bold text-slate-800">系统模板</h2>
            <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
              {{ filteredSystemTemplates.length }}
            </span>
          </div>
          
          <div v-if="filteredSystemTemplates.length === 0" class="text-slate-500 text-sm py-4">
            暂无系统模板
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="template in filteredSystemTemplates"
              :key="template.id"
              class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div class="p-5">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    {{ getCategoryLabel(template.category) }}
                  </span>
                </div>
                
                <h3 class="text-lg font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {{ template.name }}
                </h3>
                <p class="text-sm text-slate-500 line-clamp-2 h-10">
                  {{ template.description || '暂无描述' }}
                </p>
              </div>
              
              <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-400">系统预设</span>
                <button
                  @click="useTemplate(template.id)"
                  class="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  使用此模板
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- My Templates -->
        <section>
          <div class="flex items-center gap-2 mb-4">
            <h2 class="text-lg font-bold text-slate-800">我的模板</h2>
            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
              {{ filteredMyTemplates.length }}
            </span>
          </div>
          
          <div v-if="filteredMyTemplates.length === 0" class="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p class="text-slate-500 mb-2">还没有创建个人模板</p>
            <p class="text-sm text-slate-400">在编辑教案时点击"保存为模板"即可创建</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="template in filteredMyTemplates"
              :key="template.id"
              class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div class="p-5">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    {{ getCategoryLabel(template.category) }}
                  </span>
                </div>
                
                <h3 class="text-lg font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {{ template.name }}
                </h3>
                <p class="text-sm text-slate-500 line-clamp-2 h-10">
                  {{ template.description || '暂无描述' }}
                </p>
              </div>
              
              <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div class="flex gap-3">
                  <button
                    @click="deleteTemplate(template.id)"
                    class="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
                <button
                  @click="useTemplate(template.id)"
                  class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  使用此模板
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTemplateStore } from '../stores/template'

const router = useRouter()
const authStore = useAuthStore()
const templateStore = useTemplateStore()

const currentCategory = ref('ALL')

const categories = [
  { label: '全部', value: 'ALL' },
  { label: '理论课', value: 'THEORY' },
  { label: '实验课', value: 'EXPERIMENT' },
  { label: '实训课', value: 'PRACTICE' },
]

onMounted(() => {
  loadTemplates()
})

const loadTemplates = async () => {
  await templateStore.fetchTemplates()
}

const handleCategoryChange = (category: string) => {
  currentCategory.value = category
}

const filteredSystemTemplates = computed(() => {
  let templates = templateStore.systemTemplates
  if (currentCategory.value !== 'ALL') {
    templates = templates.filter(t => t.category === currentCategory.value)
  }
  return templates
})

const filteredMyTemplates = computed(() => {
  let templates = templateStore.myTemplates
  if (currentCategory.value !== 'ALL') {
    templates = templates.filter(t => t.category === currentCategory.value)
  }
  return templates
})

const getCategoryLabel = (value: string) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}

const useTemplate = (id: string) => {
  router.push({
    path: '/editor',
    query: { templateId: id }
  })
}

const deleteTemplate = async (id: string) => {
  if (!confirm('确定要删除这个模板吗？')) {
    return
  }
  
  try {
    await templateStore.deleteTemplate(id)
  } catch (error) {
    alert('删除失败: ' + error)
  }
}
</script>
