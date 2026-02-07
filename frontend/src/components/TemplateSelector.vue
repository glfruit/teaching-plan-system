<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col m-4">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 class="text-xl font-bold text-slate-800">选择教案模板</h3>
          <p class="text-sm text-slate-500 mt-1">从预设模板开始，让备课更高效</p>
        </div>
        <button 
          @click="$emit('close')"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Tabs & Filters -->
      <div class="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
        <div class="flex bg-slate-200 rounded-lg p-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
            :class="activeTab === tab.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="h-6 w-px bg-slate-300"></div>
        
        <div class="flex items-center gap-2">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="activeCategory = cat.value"
            class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
            :class="activeCategory === cat.value 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div v-if="templateStore.isLoading" class="flex justify-center py-12">
          <div class="flex items-center gap-2 text-slate-500">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            加载中...
          </div>
        </div>

        <div v-else-if="filteredTemplates.length === 0 && !(activeTab === 'SYSTEM' && activeCategory === 'ALL')" class="flex flex-col items-center justify-center py-20 text-slate-500">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p>没有找到相关模板</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Empty Template Option -->
          <div 
            v-if="activeTab === 'SYSTEM' && activeCategory === 'ALL'"
            @click="selectTemplate(null)"
            class="bg-white rounded-xl border-2 border-dashed border-slate-300 p-5 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all flex flex-col items-center justify-center text-center min-h-[180px] group"
          >
            <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <svg class="w-6 h-6 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 class="font-bold text-slate-800 mb-1">空白教案</h4>
            <p class="text-sm text-slate-500">从零开始编写</p>
          </div>

          <!-- Template Cards -->
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            @click="selectTemplate(template)"
            class="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
          >
            <!-- Selection Indicator -->
            <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent -mr-8 -mt-8 rounded-full pointer-events-none group-hover:from-blue-500/20"></div>
            
            <div class="flex items-start justify-between mb-3">
              <span class="px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-500">
                {{ getCategoryLabel(template.category) }}
              </span>
              <span v-if="template.isSystem" class="text-xs text-blue-600 font-medium flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                官方
              </span>
            </div>
            
            <h4 class="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
              {{ template.name }}
            </h4>
            <p class="text-sm text-slate-500 line-clamp-3 mb-4 h-[60px]">
              {{ template.description || '暂无描述' }}
            </p>
            
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-xs text-slate-400">
                {{ new Date(template.updatedAt).toLocaleDateString() }}
              </span>
              <button class="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                选择
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTemplateStore, type TeachingTemplate } from '../stores/template'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', template: TeachingTemplate | null): void
}>()

const templateStore = useTemplateStore()
const activeTab = ref<'SYSTEM' | 'MY'>('SYSTEM')
const activeCategory = ref('ALL')

const tabs = [
  { label: '系统模板', value: 'SYSTEM' },
  { label: '我的模板', value: 'MY' },
]

const categories = [
  { label: '全部', value: 'ALL' },
  { label: '理论课', value: 'THEORY' },
  { label: '实验课', value: 'EXPERIMENT' },
  { label: '实训课', value: 'PRACTICE' },
]

onMounted(() => {
  if (templateStore.templates.length === 0) {
    templateStore.fetchTemplates()
  }
})

const filteredTemplates = computed(() => {
  let templates = activeTab.value === 'SYSTEM' 
    ? templateStore.systemTemplates 
    : templateStore.myTemplates
    
  if (activeCategory.value !== 'ALL') {
    templates = templates.filter(t => t.category === activeCategory.value)
  }
  
  return templates
})

const getCategoryLabel = (value: string) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}

const selectTemplate = (template: TeachingTemplate | null) => {
  emit('select', template)
}
</script>
