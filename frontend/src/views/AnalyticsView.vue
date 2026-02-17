<template>
  <div class="min-h-screen bg-[#fffbf0]">
    <NavBar
      :username="authStore.user?.username || ''"
      @new="router.push('/editor')"
      @logout="handleLogout"
    />

    <main class="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <PageHeader title="数据分析" subtitle="查看您的教案数据趋势和统计信息" />

      <div v-if="isLoading" class="flex items-center justify-center py-24">
        <div class="flex items-center gap-3 text-amber-700">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm">加载中...</span>
        </div>
      </div>

      <template v-else>
        <BaseCard padding="lg" class="mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold font-serif text-amber-900">教案创建趋势</h2>
            <select
              v-model="daysFilter"
              @change="refreshData"
              class="w-full sm:w-auto min-h-[44px] px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option :value="7">近7天</option>
              <option :value="30">近30天</option>
              <option :value="90">近90天</option>
            </select>
          </div>

          <div class="h-52 sm:h-64">
            <div v-if="hasTrendData" ref="chartRef" class="w-full h-full"></div>
            <div v-else class="h-full rounded-lg border border-dashed border-amber-200 bg-amber-50/50 flex items-center justify-center text-sm text-amber-700/65">
              暂无趋势数据
            </div>
          </div>
        </BaseCard>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            v-for="card in statCards"
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :color="card.color"
          >
            <template #icon>
              <svg class="h-5 w-5" :class="card.iconClass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
              </svg>
            </template>
          </StatCard>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BaseCard padding="lg">
            <h2 class="text-lg font-semibold font-serif text-amber-900 mb-4">状态分布</h2>
            <div v-if="summary" class="space-y-4">
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-amber-800/80">已发布</span>
                  <span class="font-medium text-amber-950">
                    {{ summary.totalPublished }} <span class="text-amber-700/70">({{ summary.publishedRate }}%)</span>
                  </span>
                </div>
                <div class="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: summary.publishedRate + '%' }"></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-amber-800/80">草稿</span>
                  <span class="font-medium text-amber-950">
                    {{ summary.totalDrafts }} <span class="text-amber-700/70">({{ 100 - summary.publishedRate }}%)</span>
                  </span>
                </div>
                <div class="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500 rounded-full transition-all" :style="{ width: 100 - summary.publishedRate + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-amber-700/70 py-8">暂无数据</div>
          </BaseCard>

          <BaseCard padding="lg">
            <h2 class="text-lg font-semibold font-serif text-amber-900 mb-4">近期活动</h2>
            <div v-if="summary?.periodStats" class="space-y-0">
              <div class="flex items-center justify-between py-3 border-b border-amber-100">
                <span class="text-sm text-amber-800/80">期间发布</span>
                <span class="font-medium text-amber-950">{{ summary.periodStats.published || 0 }} 个</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-amber-100">
                <span class="text-sm text-amber-800/80">期间修改</span>
                <span class="font-medium text-amber-950">{{ summary.periodStats.updated || 0 }} 个</span>
              </div>
              <div class="flex items-center justify-between py-3">
                <span class="text-sm text-amber-800/80">平均每日</span>
                <span class="font-medium text-amber-950">{{ ((summary.periodStats.newPlans || 0) / daysFilter).toFixed(1) }} 个</span>
              </div>
            </div>
            <div v-else class="text-center text-amber-700/70 py-8">暂无数据</div>
          </BaseCard>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { type ECharts, graphic, init, use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useAuthStore } from '../stores/auth'
import { getAnalytics } from '../api/analytics'
import NavBar from '../components/layout/NavBar.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import StatCard from '../components/ui/StatCard.vue'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const router = useRouter()
const authStore = useAuthStore()

const chartRef = ref<HTMLElement | null>(null)
let chart: ECharts | null = null

const daysFilter = ref(7)
const isLoading = ref(false)
const summary = ref<any>(null)

const trendData = ref({
  dates: [] as string[],
  counts: [] as number[],
})

const hasTrendData = computed(() => trendData.value.dates.length > 0)

const statCards = computed(() => [
  {
    label: '总教案数',
    value: summary.value?.totalPlans || 0,
    color: 'slate' as const,
    iconClass: 'text-slate-500',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: '本周新增',
    value: summary.value?.periodStats?.newPlans || 0,
    color: 'emerald' as const,
    iconClass: 'text-emerald-600',
    icon: 'M12 4v16m8-8H4',
  },
  {
    label: '平均时长',
    value: `${summary.value?.avgDuration || 0} 分钟`,
    color: 'amber' as const,
    iconClass: 'text-amber-600',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: '发布率',
    value: `${summary.value?.publishRate || 0}%`,
    color: 'orange' as const,
    iconClass: 'text-orange-600',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
])

onMounted(async () => {
  await refreshData()
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})

const refreshData = async () => {
  isLoading.value = true
  try {
    const data = await getAnalytics()
    const trend = Array.isArray(data.trend) ? data.trend : []

    trendData.value = {
      dates: trend.map((t: any) => t.date || ''),
      counts: trend.map((t: any) => t.count || 0),
    }

    summary.value = {
      totalPlans: data.workload?.length || 0,
      totalPublished: data.execution?.filter((e: any) => e.status === 'completed').length || 0,
      totalDrafts: data.execution?.filter((e: any) => e.status === 'draft').length || 0,
      publishedRate: data.execution?.length
        ? Math.round((data.execution.filter((e: any) => e.status === 'completed').length / data.execution.length) * 100)
        : 0,
      avgDuration: 45,
      publishRate: data.execution?.length
        ? Math.round((data.execution.filter((e: any) => e.status === 'completed').length / data.execution.length) * 100)
        : 0,
      periodStats: {
        newPlans: data.trend?.[data.trend.length - 1]?.count || 0,
        published: data.execution?.filter((e: any) => e.status === 'completed').length || 0,
        updated: data.execution?.filter((e: any) => e.status === 'draft').length || 0,
      },
    }
  } catch (error) {
    console.error('加载分析数据失败:', error)
  } finally {
    isLoading.value = false
  }

  await nextTick()
  if (hasTrendData.value) {
    initChart()
    return
  }

  if (chart) {
    chart.dispose()
    chart = null
  }
}

const initChart = () => {
  if (!chartRef.value) {
    return
  }

  if (chart) {
    chart.dispose()
  }

  chart = init(chartRef.value)

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#fde68a',
      borderWidth: 1,
      textStyle: { color: '#78350f', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: trendData.value.dates,
      axisLine: { lineStyle: { color: '#fcd34d' } },
      axisLabel: { color: '#b45309', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#fef3c7' } },
      axisLabel: { color: '#b45309', fontSize: 11 },
    },
    series: [
      {
        name: '教案数',
        type: 'line',
        data: trendData.value.counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#f59e0b', width: 2.5 },
        itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.28)' },
            { offset: 0.6, color: 'rgba(249, 115, 22, 0.1)' },
            { offset: 1, color: 'rgba(249, 115, 22, 0.02)' },
          ]),
        },
      },
    ],
  })
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
