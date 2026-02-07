<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
             <button @click="goBack" class="text-slate-500 hover:text-slate-800">
                &larr; 返回
             </button>
             <h1 class="text-lg font-bold text-slate-800">
                周计划详情
             </h1>
          </div>
          <button @click="save" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
             保存
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-if="weeklyPlan">
       <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div class="flex items-center justify-between border-b pb-4">
              <div>
                  <h2 class="text-xl font-semibold">第 {{ weeklyPlan.weekNumber }} 周</h2>
                  <p class="text-slate-500 text-sm mt-1">
                      {{ formatDate(weeklyPlan.startDate) }} - {{ formatDate(weeklyPlan.endDate) }}
                  </p>
              </div>
              <select v-model="form.status" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                  <option value="PLANNED">计划中</option>
                  <option value="IN_PROGRESS">进行中</option>
                  <option value="COMPLETED">已完成</option>
                  <option value="ADJUSTED">已调整</option>
              </select>
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700">计划内容</label>
             <textarea v-model="form.plannedContent" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700">实际内容 / 教学反思</label>
             <textarea v-model="form.actualContent" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700">关联教案</label>
             <select v-model="form.teachingPlanId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                 <option value="">未关联</option>
                 <option v-for="plan in planStore.plans" :key="plan.id" :value="plan.id">
                     {{ plan.title }}
                 </option>
             </select>
             <p class="text-xs text-slate-500 mt-1" v-if="weeklyPlan.teachingPlan">
                 当前关联: {{ weeklyPlan.teachingPlan.title }}
             </p>
          </div>
          
          <div>
             <label class="block text-sm font-medium text-slate-700">备注</label>
             <textarea v-model="form.notes" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
          </div>
       </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSemesterPlanStore } from '../stores/semester-plan'
import { usePlanStore } from '../stores/plan'

const route = useRoute()
const router = useRouter()
const store = useSemesterPlanStore()
const planStore = usePlanStore()

const weeklyPlan = computed(() => store.currentWeeklyPlan)

const form = ref({
    plannedContent: '',
    actualContent: '',
    status: 'PLANNED',
    teachingPlanId: '',
    notes: ''
})

onMounted(async () => {
    const id = route.params.id as string
    await store.fetchWeeklyPlan(id)
    if (store.currentWeeklyPlan) {
        form.value = {
            plannedContent: store.currentWeeklyPlan.plannedContent || '',
            actualContent: store.currentWeeklyPlan.actualContent || '',
            status: store.currentWeeklyPlan.status,
            teachingPlanId: store.currentWeeklyPlan.teachingPlanId || '',
            notes: store.currentWeeklyPlan.notes || ''
        }
    }
    
    // Fetch teaching plans for dropdown
    await planStore.fetchPlans({ limit: 100 })
})

const save = async () => {
    try {
        await store.updateWeeklyPlan(route.params.id as string, form.value)
        goBack()
    } catch (e) {
        alert('Update failed: ' + e)
    }
}

const goBack = () => {
    if (store.currentWeeklyPlan?.semesterPlanId) {
        router.push(`/semester-plans/${store.currentWeeklyPlan.semesterPlanId}`)
    } else {
        router.back()
    }
}

const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString()
}
</script>
