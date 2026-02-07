<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 class="text-lg sm:text-xl font-bold text-slate-800">学期计划</h1>
          </div>
          
          <div class="flex items-center gap-4">
             <router-link to="/" class="text-slate-600 hover:text-blue-600 font-medium">教案管理</router-link>
             <router-link to="/semester-plans" class="text-blue-600 font-bold">学期计划</router-link>

             <router-link
                to="/semester-plans/create"
                class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>新建计划</span>
              </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="store.isLoading" class="flex justify-center py-20">
        <span class="text-slate-500">加载中...</span>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div v-if="!store.hasPlans" class="py-20 text-center">
            <p class="text-slate-500">还没有学期计划</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
             <div v-for="plan in store.plans" :key="plan.id" class="p-6 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex-1 cursor-pointer" @click="viewPlan(plan.id!)">
                        <h3 class="text-lg font-semibold text-slate-800">{{ plan.courseName }}</h3>
                        <p class="text-slate-500 text-sm mt-1">
                            {{ plan.semester }} · {{ plan.totalWeeks }}周 · 每周{{ plan.weeklyHours }}课时
                        </p>
                        <p class="text-slate-400 text-xs mt-2">{{ plan.description || '无描述' }}</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="px-2.5 py-1 text-xs font-medium rounded-full" :class="getStatusClass(plan.status)">
                            {{ plan.status }}
                        </span>
                        <button @click="deletePlan(plan.id!)" class="text-red-500 hover:bg-red-50 p-2 rounded">
                             删除
                        </button>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSemesterPlanStore } from '../stores/semester-plan'

const router = useRouter()
const store = useSemesterPlanStore()

onMounted(() => {
    store.fetchPlans()
})

const viewPlan = (id: string) => {
    router.push(`/semester-plans/${id}`)
}

const deletePlan = async (id: string) => {
    if(confirm('Confirm delete?')) {
        await store.deletePlan(id)
        store.fetchPlans()
    }
}

const getStatusClass = (status?: string) => {
    switch(status) {
        case 'DRAFT': return 'bg-gray-100 text-gray-600'
        case 'ACTIVE': return 'bg-green-100 text-green-600'
        case 'COMPLETED': return 'bg-blue-100 text-blue-600'
        case 'ARCHIVED': return 'bg-yellow-100 text-yellow-600'
        default: return 'bg-gray-100'
    }
}
</script>
