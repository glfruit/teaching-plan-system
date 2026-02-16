<template>
  <div class="min-h-screen bg-warm-50">
    <NavBar
      :username="store.user?.username || ''"
      :show-new-button="false"
      @logout="handleLogout"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <PageHeader
        super-title="Analytics"
        title="数据分析"
        subtitle="查看教案工作量、执行状态、质量评分和趋势分析"
      />

      <div v-if="store.loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 text-warm-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载数据中...
        </div>
      </div>

      <div v-else-if="store.error" class="py-16 text-center">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-red-600">加载失败: {{ store.error }}</p>
        <BaseButton variant="primary" size="md" class="mt-4" @click="store.fetchAnalyticsData()">
          重试
        </BaseButton>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseCard class="p-6">
          <h2 class="font-display text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            教师工作量统计
          </h2>
          <div class="h-72">
            <WorkloadChart :data="store.data.workload" />
          </div>
        </BaseCard>

        <BaseCard class="p-6">
          <h2 class="font-display text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            执行状态分布
          </h2>
          <div class="h-72">
            <ExecutionChart :data="store.data.execution" />
          </div>
        </BaseCard>

        <BaseCard class="p-6">
          <h2 class="font-display text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            教案质量评分
          </h2>
          <div class="h-72">
            <QualityChart :data="store.data.quality" />
          </div>
        </BaseCard>

        <BaseCard class="p-6">
          <h2 class="font-display text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <svg class="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            教案趋势分析
          </h2>
          <div class="h-72">
            <TrendChart :data="store.data.trend" />
          </div>
        </BaseCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAnalyticsStore } from '../stores/analytics'
import NavBar from '../components/layout/NavBar.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import {
  WorkloadChart,
  ExecutionChart,
  QualityChart,
  TrendChart
} from '../components/analytics'

const router = useRouter()
const store = useAnalyticsStore()
const authStore = useAuthStore()

onMounted(() => {
  store.fetchAnalyticsData()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
