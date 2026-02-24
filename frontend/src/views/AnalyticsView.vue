<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar
      :username="authStore.user?.username || ''"
      :is-admin="authStore.isAdmin"
      @new="router.push('/editor')"
      @logout="handleLogout"
    />

    <main class="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <PageHeader title="数据分析" subtitle="查看您的教案数据趋势和统计信息" />

      <div v-if="isLoading" class="flex items-center justify-center py-24">
        <div class="flex items-center gap-3 text-slate-600">
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
            <h2 class="text-lg font-semibold font-serif text-slate-800">教案创建趋势</h2>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <select
                v-model="daysFilter"
                @change="refreshData"
                class="w-full sm:w-auto min-h-[44px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
              >
                <option :value="7">近7天</option>
                <option :value="30">近30天</option>
                <option :value="90">近90天</option>
              </select>
              <select
                v-model="exportFormat"
                data-testid="analytics-export-format"
                class="w-full sm:w-auto min-h-[44px] px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <BaseButton
                data-testid="analytics-export-button"
                class="w-full sm:w-auto min-h-[44px]"
                :loading="isExporting"
                @click="handleExport"
              >
                导出数据
              </BaseButton>
            </div>
          </div>

          <div class="h-52 sm:h-64">
            <div v-if="hasTrendData" ref="chartRef" class="w-full h-full"></div>
            <div v-else class="h-full rounded border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-center text-sm text-slate-400">
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

        <BaseCard padding="lg" class="mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold font-serif text-slate-800">教学链路一致性</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
              <select
                v-model="chainFilterSemesterId"
                class="min-h-[40px] px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
                @change="refreshTeachingChainByFilter"
              >
                <option value="">全部学期</option>
                <option v-for="item in teachingChainBySemester" :key="item.semesterId" :value="item.semesterId">
                  {{ item.semesterName }}
                </option>
              </select>
              <select
                v-model="chainFilterCourseId"
                class="min-h-[40px] px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
                @change="refreshTeachingChainByFilter"
              >
                <option value="">全部课程</option>
                <option v-for="item in teachingChainByCourse" :key="item.courseId" :value="item.courseId">
                  {{ item.courseCode }} · {{ item.courseName }}
                </option>
              </select>
              <select
                v-model="chainFilterWeekNo"
                class="min-h-[40px] px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
                @change="refreshTeachingChainByFilter"
              >
                <option value="">全部周次</option>
                <option v-for="item in teachingChainByWeek" :key="item.weekNo" :value="String(item.weekNo)">
                  第 {{ item.weekNo }} 周
                </option>
              </select>
            </div>
          </div>

          <div v-if="teachingChainSummary" class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs text-slate-500">一致性得分</p>
              <p class="text-lg font-semibold text-slate-900">{{ teachingChainSummary.consistencyScore }}</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs text-slate-500">Delivery 映证覆盖</p>
              <p class="text-lg font-semibold text-slate-900">{{ teachingChainSummary.deliveryTraceCoverage }}%</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs text-slate-500">课件映证覆盖</p>
              <p class="text-lg font-semibold text-slate-900">{{ teachingChainSummary.coursewareTraceCoverage }}%</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs text-slate-500">单次课总数</p>
              <p class="text-lg font-semibold text-slate-900">{{ teachingChainSummary.totalLessons }}</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-xs text-slate-500">已发布单次课</p>
              <p class="text-lg font-semibold text-slate-900">{{ teachingChainSummary.publishedLessons }}</p>
            </div>
          </div>

          <div v-if="teachingChainByWeek.length > 0" class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="text-left px-3 py-2">周次</th>
                  <th class="text-left px-3 py-2">单次课数</th>
                  <th class="text-left px-3 py-2">已发布</th>
                  <th class="text-left px-3 py-2">平均时长</th>
                  <th class="text-left px-3 py-2">一致性得分</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in teachingChainByWeek" :key="`week-${item.weekNo}`" class="border-t border-slate-200">
                  <td class="px-3 py-2 text-slate-700">第 {{ item.weekNo }} 周</td>
                  <td class="px-3 py-2 text-slate-700">{{ item.totalLessons }}</td>
                  <td class="px-3 py-2 text-slate-700">{{ item.publishedLessons }}</td>
                  <td class="px-3 py-2 text-slate-700">{{ item.averageDuration }} 分钟</td>
                  <td class="px-3 py-2 text-slate-700">{{ item.consistencyScore }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center text-slate-400 py-6 text-sm">当前筛选范围暂无链路数据</div>
        </BaseCard>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BaseCard padding="lg">
            <h2 class="text-lg font-semibold font-serif text-slate-800 mb-4">状态分布</h2>
            <div v-if="summary" class="space-y-4">
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-slate-500">已发布</span>
                  <span class="font-medium text-slate-900">
                    {{ summary.totalPublished }} <span class="text-slate-400">({{ summary.publishedRate }}%)</span>
                  </span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: summary.publishedRate + '%' }"></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-slate-500">草稿</span>
                  <span class="font-medium text-slate-900">
                    {{ summary.totalDrafts }} <span class="text-slate-400">({{ 100 - summary.publishedRate }}%)</span>
                  </span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-slate-500 rounded-full transition-all" :style="{ width: 100 - summary.publishedRate + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-slate-400 py-8">暂无数据</div>
          </BaseCard>

          <BaseCard padding="lg">
            <h2 class="text-lg font-semibold font-serif text-slate-800 mb-4">近期活动</h2>
            <div v-if="summary?.periodStats" class="space-y-0">
              <div class="flex items-center justify-between py-3 border-b border-slate-200">
                <span class="text-sm text-slate-500">期间发布</span>
                <span class="font-medium text-slate-900">{{ summary.periodStats.published || 0 }} 个</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-slate-200">
                <span class="text-sm text-slate-500">期间修改</span>
                <span class="font-medium text-slate-900">{{ summary.periodStats.updated || 0 }} 个</span>
              </div>
              <div class="flex items-center justify-between py-3">
                <span class="text-sm text-slate-500">平均每日</span>
                <span class="font-medium text-slate-900">{{ ((summary.periodStats.newPlans || 0) / daysFilter).toFixed(1) }} 个</span>
              </div>
            </div>
            <div v-else class="text-center text-slate-400 py-8">暂无数据</div>
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
import {
  getAnalytics,
  exportAnalytics,
  getTeachingChainAnalytics,
  type AnalyticsExportFormat,
  type TeachingChainAnalytics,
} from '../api/analytics'
import { buildAnalyticsSummary, normalizeTrendPoints } from './analytics-view-model'
import NavBar from '../components/layout/NavBar.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import StatCard from '../components/ui/StatCard.vue'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const router = useRouter()
const authStore = useAuthStore()

const chartRef = ref<HTMLElement | null>(null)
let chart: ECharts | null = null

const daysFilter = ref(7)
const exportFormat = ref<AnalyticsExportFormat>('excel')
const isLoading = ref(false)
const isExporting = ref(false)
const summary = ref<any>(null)
const teachingChain = ref<TeachingChainAnalytics | null>(null)
const chainFilterSemesterId = ref('')
const chainFilterCourseId = ref('')
const chainFilterWeekNo = ref('')
const EXPORT_FILE_EXTENSIONS: Record<AnalyticsExportFormat, 'json' | 'csv' | 'xlsx' | 'pdf' | 'docx'> = {
  json: 'json',
  csv: 'csv',
  excel: 'xlsx',
  pdf: 'pdf',
  word: 'docx',
}

const trendData = ref({
  dates: [] as string[],
  counts: [] as number[],
})

const hasTrendData = computed(() => trendData.value.dates.length > 0)
const teachingChainSummary = computed(() => teachingChain.value?.summary || null)
const teachingChainBySemester = computed(() => teachingChain.value?.bySemester || [])
const teachingChainByCourse = computed(() => teachingChain.value?.byCourse || [])
const teachingChainByWeek = computed(() => teachingChain.value?.byWeek || [])

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
    color: 'blue' as const,
    iconClass: 'text-[#435549]',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: '发布率',
    value: `${summary.value?.publishRate || 0}%`,
    color: 'indigo' as const,
    iconClass: 'text-amber-600',
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
    const trend = normalizeTrendPoints(data.trend)

    trendData.value = {
      dates: trend.map((t) => t.date || ''),
      counts: trend.map((t) => t.count || 0),
    }

    summary.value = buildAnalyticsSummary(data)
    teachingChain.value = data.teachingChain || null
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

const refreshTeachingChainByFilter = async () => {
  try {
    teachingChain.value = await getTeachingChainAnalytics({
      semesterId: chainFilterSemesterId.value || undefined,
      courseId: chainFilterCourseId.value || undefined,
      weekNo: chainFilterWeekNo.value ? Number(chainFilterWeekNo.value) : undefined,
    })
  } catch (error) {
    console.error('加载链路分析失败:', error)
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
      borderColor: '#cbd5e1',
      borderWidth: 1,
      textStyle: { color: '#1e293b', fontSize: 12 },
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
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    series: [
      {
        name: '教案数',
        type: 'line',
        data: trendData.value.counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#647269', width: 2.5 },
        itemStyle: { color: '#647269', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(100, 114, 105, 0.28)' },
            { offset: 0.6, color: 'rgba(100, 114, 105, 0.1)' },
            { offset: 1, color: 'rgba(100, 114, 105, 0.02)' },
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

const handleExport = async () => {
  if (isExporting.value) {
    return
  }

  isExporting.value = true
  try {
    const blob = await exportAnalytics(exportFormat.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report.${EXPORT_FILE_EXTENSIONS[exportFormat.value]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    alert('导出失败: ' + error)
  } finally {
    isExporting.value = false
  }
}
</script>
