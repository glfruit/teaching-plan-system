<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
             <button @click="$router.back()" class="text-slate-500 hover:text-slate-800">
                &larr; 返回
             </button>
             <h1 class="text-lg font-bold text-slate-800">
                {{ isEdit ? '编辑学期计划' : '新建学期计划' }}
             </h1>
          </div>
          <button @click="savePlan" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
             保存
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
          <!-- Basic Info -->
          <div>
             <label class="block text-sm font-medium text-slate-700">课程名称</label>
             <input v-model="form.courseName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
          </div>

          <div class="grid grid-cols-2 gap-6">
             <div>
                <label class="block text-sm font-medium text-slate-700">学期</label>
                <input v-model="form.semester" type="text" placeholder="2025-2026-1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
             </div>
             <div>
                <label class="block text-sm font-medium text-slate-700">开始日期</label>
                <input v-model="form.startDate" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
             </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
             <div>
                <label class="block text-sm font-medium text-slate-700">总周数</label>
                <input v-model.number="form.totalWeeks" type="number" min="1" max="52" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
             </div>
             <div>
                <label class="block text-sm font-medium text-slate-700">每周课时</label>
                <input v-model.number="form.weeklyHours" type="number" min="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
             </div>
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700">描述</label>
             <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
          </div>
       </div>

       <!-- Weekly Plans List (Only in Edit Mode) -->
       <div v-if="isEdit && store.currentPlan?.weeklyPlans" class="mt-8">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">周计划列表</h2>
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
             <div 
                v-for="week in store.currentPlan.weeklyPlans" 
                :key="week.id" 
                class="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                @click="editWeek(week.id)"
             >
                <div>
                   <span class="font-medium text-slate-700">第 {{ week.weekNumber }} 周</span>
                   <span class="ml-2 text-slate-500 text-sm">
                      {{ formatDate(week.startDate) }} - {{ formatDate(week.endDate) }}
                   </span>
                   <p class="text-sm text-slate-600 mt-1 truncate max-w-md">
                      {{ week.plannedContent || '未设置内容' }}
                   </p>
                </div>
                <div class="flex items-center gap-2">
                   <span class="px-2 py-0.5 text-xs rounded-full" :class="getWeekStatusClass(week.status)">
                      {{ week.status }}
                   </span>
                   <span v-if="week.teachingPlan" class="text-xs text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded">
                      已关联教案
                   </span>
                   <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                   </svg>
                </div>
             </div>
          </div>
       </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSemesterPlanStore } from '../stores/semester-plan'

const route = useRoute()
const router = useRouter()
const store = useSemesterPlanStore()

const isEdit = computed(() => route.params.id !== undefined)

const form = ref({
    courseName: '',
    semester: '',
    startDate: new Date().toISOString().split('T')[0],
    totalWeeks: 18,
    weeklyHours: 4,
    description: ''
})

onMounted(async () => {
    if (isEdit.value) {
        const id = route.params.id as string
        await store.fetchPlan(id)
        if (store.currentPlan) {
            form.value = {
                courseName: store.currentPlan.courseName,
                semester: store.currentPlan.semester,
                startDate: store.currentPlan.startDate ? new Date(store.currentPlan.startDate).toISOString().split('T')[0] : '',
                totalWeeks: store.currentPlan.totalWeeks,
                weeklyHours: store.currentPlan.weeklyHours,
                description: store.currentPlan.description || ''
            }
        }
    }
})

const savePlan = async () => {
    try {
        if (isEdit.value) {
            await store.updatePlan(route.params.id as string, form.value)
        } else {
            await store.createPlan(form.value)
            router.push('/semester-plans')
        }
    } catch (e) {
        alert('Save failed: ' + e)
    }
}

const editWeek = (weekId: string) => {
    router.push(`/weekly-plans/${weekId}`)
}

const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString()
}

const getWeekStatusClass = (status: string) => {
    switch(status) {
        case 'PLANNED': return 'bg-gray-100 text-gray-600'
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-600'
        case 'COMPLETED': return 'bg-green-100 text-green-600'
        case 'ADJUSTED': return 'bg-yellow-100 text-yellow-600'
        default: return 'bg-gray-100'
    }
}
</script>
