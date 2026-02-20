<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar
      :username="authStore.user?.username || ''"
      @new="router.push('/editor')"
      @logout="handleLogout"
    />

    <main class="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <div v-if="planStore.isLoading" class="flex items-center justify-center py-24">
        <div class="flex items-center gap-3 text-slate-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm">加载中...</span>
        </div>
      </div>

      <template v-else>
        <PageHeader
          super-title="Dashboard"
          :title="`欢迎回来，${authStore.user?.username || '教师'}`"
          subtitle="管理和追踪您的教学计划"
        />

        <section class="md:hidden mobile-quick-actions grid grid-cols-1 gap-2 mb-8">
          <BaseButton full-width @click="router.push('/editor')" class="min-h-[44px]">新建教案</BaseButton>
          <BaseButton full-width variant="secondary" @click="router.push('/analytics')" class="min-h-[44px]">分析看板</BaseButton>
          <BaseButton full-width variant="danger" @click="handleLogout" class="min-h-[44px]">退出登录</BaseButton>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
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

        <BaseCard padding="none" class="overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 p-6 border-b border-slate-200">
            <div>
              <h2 class="text-xl font-semibold font-serif text-slate-900">教案列表</h2>
              <p class="text-sm text-slate-500 mt-1">共 {{ planStore.pagination.total }} 个教案</p>
              <div class="mt-2 flex items-center gap-2 text-xs">
                <span class="text-slate-500">导出服务</span>
                <span
                  class="inline-flex items-center rounded px-2 py-0.5"
                  :class="exportServiceStatusClass"
                >
                  {{ exportServiceStatusText }}
                </span>
                <button
                  class="text-slate-500 hover:text-slate-700 transition-colors"
                  @click="checkExportServiceHealth"
                >
                  重试
                </button>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <BaseInput
                v-model="searchQuery"
                placeholder="搜索教案..."
                class="w-full sm:w-64"
                @keyup.enter="handleSearch"
              />
              <BaseButton
                @click="handleSearch"
                class="w-full sm:w-auto min-h-[44px]"
              >
                搜索
              </BaseButton>
            </div>
          </div>

          <div
            v-if="planStore.hasPlans"
            class="px-6 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <label class="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-[#647269] focus:ring-[#647269]/20"
                :checked="allVisibleSelected"
                @change="toggleSelectAllVisible(($event.target as HTMLInputElement).checked)"
              />
              <span>已选 {{ selectedPlanIds.length }} 项</span>
            </label>

            <div class="flex flex-wrap items-center gap-2">
              <button
                class="min-h-[44px] px-3 rounded border border-emerald-200 bg-white text-sm text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedDraftIds.length === 0"
                @click="batchPublishSelected"
              >
                批量发布
              </button>
              <button
                class="min-h-[44px] px-3 rounded border border-amber-200 bg-white text-sm text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedPublishedIds.length === 0"
                @click="batchArchiveSelected"
              >
                批量归档
              </button>
              <button
                class="min-h-[44px] px-3 rounded border border-red-200 bg-white text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedPlanIds.length === 0"
                @click="batchDeleteSelected"
              >
                批量删除
              </button>
              <button
                class="min-h-[44px] px-3 rounded border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="selectedPlanIds.length === 0"
                @click="clearSelection"
              >
                清空选择
              </button>
            </div>
          </div>

          <div v-if="!planStore.hasPlans" class="py-16 text-center px-6">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded bg-slate-100 text-[#647269] mb-5">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-slate-900 font-serif">暂无教案</h3>
            <p class="text-sm text-slate-500 mt-2 mb-6">开始创建您的第一个教案吧</p>
            <BaseButton @click="router.push('/editor')">创建教案</BaseButton>
          </div>

          <TransitionGroup
            v-else
            tag="div"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            class="divide-y divide-slate-200"
          >
            <div
              v-for="(plan, index) in planStore.plans"
              :key="plan.id"
              class="p-6 hover:bg-slate-50/70 transition-colors"
              :style="{ transitionDelay: `${index * 40}ms` }"
            >
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-[#647269] focus:ring-[#647269]/20"
                      :checked="isSelected(plan.id!)"
                      @change="toggleSelect(plan.id!, ($event.target as HTMLInputElement).checked)"
                    />
                    <h3
                      class="text-base font-semibold text-slate-900 cursor-pointer hover:text-slate-600 transition-colors truncate"
                      @click="editPlan(plan.id!)"
                    >
                      {{ plan.title }}
                    </h3>
                    <BaseBadge :variant="getStatusVariant(plan.status)">
                      {{ getStatusText(plan.status) }}
                    </BaseBadge>
                  </div>
                  <p class="text-sm text-slate-500">
                    {{ plan.courseName }} · {{ plan.className }} · {{ plan.duration }}分钟
                  </p>
                  <p class="text-sm text-slate-400 mt-1">
                    更新于 {{ formatDate(plan.updatedAt) }}
                  </p>
                </div>

                <div class="flex items-center flex-wrap gap-2">
                  <button
                    @click="editPlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    title="编辑"
                  >
                    编辑
                  </button>
                  <select
                    v-model="exportFormat"
                    class="min-h-[44px] px-3 rounded border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
                    title="导出格式"
                  >
                    <option value="word">Word</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <button
                    @click="openExportPreview(plan.id!, plan.title, exportFormat)"
                    class="min-h-[44px] px-3 rounded border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    title="导出"
                  >
                    导出
                  </button>
                  <button
                    @click="duplicatePlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded border border-sky-200 bg-white text-sm text-sky-700 hover:bg-sky-50 transition-colors"
                    title="复制"
                  >
                    复制
                  </button>
                  <button
                    v-if="plan.status === 'DRAFT'"
                    @click="publishPlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded border border-emerald-200 bg-white text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="发布"
                  >
                    发布
                  </button>
                  <button
                    v-if="plan.status === 'PUBLISHED'"
                    @click="archivePlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded border border-amber-200 bg-white text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                    title="归档"
                  >
                    归档
                  </button>
                  <button
                    @click="deletePlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded border border-red-200 bg-white text-sm text-red-600 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="planStore.pagination.totalPages > 1" class="flex items-center justify-between p-6 border-t border-slate-200">
            <p class="text-sm text-slate-500">第 {{ planStore.pagination.page }} / {{ planStore.pagination.totalPages }} 页</p>
            <div class="flex items-center gap-3">
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="planStore.pagination.page <= 1"
                @click="changePage(planStore.pagination.page - 1)"
              >
                上一页
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="planStore.pagination.page >= planStore.pagination.totalPages"
                @click="changePage(planStore.pagination.page + 1)"
              >
                下一页
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </template>
    </main>

    <Teleport to="body">
      <div
        v-if="isExportPreviewVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <button
          class="absolute inset-0 bg-slate-900/40"
          @click="closeExportPreview"
          aria-label="关闭导出前预检弹窗"
        ></button>

        <div class="relative w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded border border-slate-200 bg-white shadow-[var(--shadow-lg)]">
          <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-[#647269]">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <div>
                <h3 class="text-base font-semibold text-slate-900">导出前预检</h3>
                <p class="text-sm text-slate-500">确认内容完整度后再导出</p>
              </div>
            </div>
            <BaseBadge variant="default">
              {{ selectedFormatLabel }}
            </BaseBadge>
          </div>

          <div class="px-5 py-4 space-y-4">
            <div v-if="isExportPreviewLoading" class="flex items-center gap-2 text-sm text-slate-500">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>正在检查教案完整度...</span>
            </div>

            <div v-else-if="exportPreviewError" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ exportPreviewError }}
            </div>

            <template v-else-if="exportPreviewData">
              <div class="rounded border border-slate-200 bg-slate-50 px-4 py-3">
                <p class="text-sm text-slate-700">
                  <span class="font-medium text-slate-900">完成度 {{ exportPreviewData.readiness.completionRate }}%</span>
                  · 已完成 {{ exportPreviewData.readiness.completedSections }} / {{ exportPreviewData.readiness.totalSections }} 个模块
                </p>
                <p class="text-xs text-slate-500 mt-1">教案：{{ exportPreviewData.plan.title }}</p>
                <p
                  v-if="exportPreviewData.readiness.missingSections.length > 0"
                  class="text-xs text-amber-700 mt-2"
                >
                  待补充：{{ exportPreviewData.readiness.missingSections.join('、') }}
                </p>
              </div>

              <ul class="space-y-2">
                <li
                  v-for="section in exportPreviewData.sections"
                  :key="section.key"
                  class="rounded border border-slate-200 px-3 py-2"
                >
                  <div class="flex items-center justify-between gap-3">
                    <p class="text-sm font-medium text-slate-800">{{ section.label }}</p>
                    <span
                      class="inline-flex items-center rounded px-2 py-0.5 text-xs"
                      :class="section.isEmpty ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                    >
                      {{ section.isEmpty ? '未填' : '已填' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                    {{ section.preview || '暂无内容' }}
                  </p>
                </li>
              </ul>
            </template>
          </div>

          <div class="px-5 py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            <BaseButton
              variant="secondary"
              class="w-full sm:w-auto"
              @click="closeExportPreview"
            >
              取消
            </BaseButton>
            <BaseButton
              class="w-full sm:w-auto"
              :loading="isExporting"
              :disabled="isExportPreviewLoading || !!exportPreviewError || !exportPreviewData"
              @click="confirmExport"
            >
              继续导出
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePlanStore } from '../stores/plan'
import NavBar from '../components/layout/NavBar.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import StatCard from '../components/ui/StatCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const planStore = usePlanStore()

const searchQuery = ref('')
const exportFormat = ref<ExportFormat>('word')
const selectedPlanIds = ref<string[]>([])
const exportServiceStatus = ref<'checking' | 'connected' | 'unavailable'>('checking')

type ExportFormat = 'word' | 'excel' | 'pdf'
const EXPORT_FORMAT_CONFIG: Record<ExportFormat, { extension: 'docx' | 'xlsx' | 'pdf' }> = {
  word: { extension: 'docx' },
  excel: { extension: 'xlsx' },
  pdf: { extension: 'pdf' },
}
const EXPORT_FORMAT_LABEL: Record<ExportFormat, string> = {
  word: 'Word 导出',
  excel: 'Excel 导出',
  pdf: 'PDF 导出',
}

interface ExportPreviewSection {
  key: string
  label: string
  preview: string
  isEmpty: boolean
  length: number
}

interface ExportPreviewData {
  plan: {
    id: string
    title: string
    courseName: string
    className: string
    duration: number
    status: string
    teacherName: string
    updatedAt: string
  }
  sections: ExportPreviewSection[]
  readiness: {
    completedSections: number
    totalSections: number
    completionRate: number
    missingSections: string[]
  }
  availableFormats: ExportFormat[]
}

type PendingExport = {
  id: string
  title: string
  format: ExportFormat
} | null

const isExportPreviewVisible = ref(false)
const isExportPreviewLoading = ref(false)
const exportPreviewError = ref('')
const exportPreviewData = ref<ExportPreviewData | null>(null)
const pendingExport = ref<PendingExport>(null)
const isExporting = ref(false)

const selectedFormatLabel = computed(() => {
  const format = pendingExport.value?.format || exportFormat.value
  return EXPORT_FORMAT_LABEL[format]
})
const exportServiceStatusText = computed(() => {
  switch (exportServiceStatus.value) {
    case 'connected':
      return '已连接'
    case 'unavailable':
      return '不可用'
    default:
      return '检测中'
  }
})
const exportServiceStatusClass = computed(() => {
  switch (exportServiceStatus.value) {
    case 'connected':
      return 'bg-emerald-100 text-emerald-700'
    case 'unavailable':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
})

const draftCount = computed(() => planStore.plans.filter((p) => p.status === 'DRAFT').length)
const publishedCount = computed(() => planStore.plans.filter((p) => p.status === 'PUBLISHED').length)
const archivedCount = computed(() => planStore.plans.filter((p) => p.status === 'ARCHIVED').length)
const allVisiblePlanIds = computed(() => planStore.plans.map((plan) => plan.id).filter(Boolean) as string[])
const allVisibleSelected = computed(
  () =>
    allVisiblePlanIds.value.length > 0 &&
    allVisiblePlanIds.value.every((id) => selectedPlanIds.value.includes(id))
)
const selectedPlans = computed(() =>
  planStore.plans.filter((plan) => plan.id && selectedPlanIds.value.includes(plan.id))
)
const selectedDraftIds = computed(() =>
  selectedPlans.value.filter((plan) => plan.status === 'DRAFT').map((plan) => plan.id as string)
)
const selectedPublishedIds = computed(() =>
  selectedPlans.value.filter((plan) => plan.status === 'PUBLISHED').map((plan) => plan.id as string)
)

const statCards = computed(() => [
  {
    label: '总教案数',
    value: planStore.pagination.total,
    color: 'slate' as const,
    iconClass: 'text-slate-500',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: '草稿',
    value: draftCount.value,
    color: 'indigo' as const,
    iconClass: 'text-amber-600',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  {
    label: '已发布',
    value: publishedCount.value,
    color: 'emerald' as const,
    iconClass: 'text-emerald-600',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: '已归档',
    value: archivedCount.value,
    color: 'blue' as const,
    iconClass: 'text-[#435549]',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
])

onMounted(() => {
  loadPlans()
  checkExportServiceHealth()
})

const loadPlans = async (page = 1) => {
  try {
    await planStore.fetchPlans({
      page,
      limit: 10,
      search: searchQuery.value || undefined,
    })
    selectedPlanIds.value = []
  } catch (error) {
    console.error('加载教案失败:', error)
  }
}

const handleSearch = () => {
  loadPlans(1)
}

const changePage = (page: number) => {
  loadPlans(page)
}

const editPlan = (id: string) => {
  router.push(`/editor/${id}`)
}

const deletePlan = async (id: string) => {
  if (!confirm('确定要删除这个教案吗？此操作不可撤销。')) {
    return
  }

  try {
    await planStore.deletePlan(id)
    await loadPlans()
  } catch (error) {
    alert('删除失败: ' + error)
  }
}

const isSelected = (id: string) => selectedPlanIds.value.includes(id)

const toggleSelect = (id: string, checked: boolean) => {
  if (checked) {
    if (!selectedPlanIds.value.includes(id)) {
      selectedPlanIds.value.push(id)
    }
    return
  }

  selectedPlanIds.value = selectedPlanIds.value.filter((selectedId) => selectedId !== id)
}

const toggleSelectAllVisible = (checked: boolean) => {
  if (checked) {
    selectedPlanIds.value = [...allVisiblePlanIds.value]
    return
  }
  selectedPlanIds.value = []
}

const clearSelection = () => {
  selectedPlanIds.value = []
}

const runBatchAction = async (
  action: 'PUBLISH' | 'ARCHIVE' | 'DELETE',
  ids: string[],
  successMessage: string,
  failurePrefix: string
) => {
  try {
    const result = await planStore.batchPlanAction(action, ids)
    await loadPlans(planStore.pagination.page || 1)
    clearSelection()
    alert(`${successMessage}：成功 ${result.affected} 条，跳过 ${result.skipped} 条`)
  } catch (error) {
    alert(`${failurePrefix}：${error}`)
  }
}

const batchPublishSelected = async () => {
  if (selectedDraftIds.value.length === 0) {
    return
  }

  if (!confirm(`确定发布选中的 ${selectedDraftIds.value.length} 条草稿教案吗？`)) {
    return
  }

  await runBatchAction('PUBLISH', selectedDraftIds.value, '批量发布完成', '批量发布失败')
}

const batchArchiveSelected = async () => {
  if (selectedPublishedIds.value.length === 0) {
    return
  }

  if (!confirm(`确定归档选中的 ${selectedPublishedIds.value.length} 条已发布教案吗？`)) {
    return
  }

  await runBatchAction('ARCHIVE', selectedPublishedIds.value, '批量归档完成', '批量归档失败')
}

const batchDeleteSelected = async () => {
  if (selectedPlanIds.value.length === 0) {
    return
  }

  if (!confirm(`确定删除选中的 ${selectedPlanIds.value.length} 条教案吗？该操作不可撤销。`)) {
    return
  }

  await runBatchAction('DELETE', selectedPlanIds.value, '批量删除完成', '批量删除失败')
}

const checkExportServiceHealth = async () => {
  exportServiceStatus.value = 'checking'
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/export/health', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      exportServiceStatus.value = 'unavailable'
      return
    }

    const data = await response.json()
    exportServiceStatus.value = data?.success ? 'connected' : 'unavailable'
  } catch {
    exportServiceStatus.value = 'unavailable'
  }
}

const duplicatePlan = async (id: string) => {
  try {
    await planStore.duplicatePlan(id)
    await loadPlans(planStore.pagination.page || 1)
  } catch (error) {
    alert('复制失败: ' + error)
  }
}

const publishPlan = async (id: string) => {
  if (!confirm('确定要发布该教案吗？发布后将进入已发布状态。')) {
    return
  }

  try {
    await planStore.publishPlan(id)
    await loadPlans(planStore.pagination.page || 1)
  } catch (error) {
    alert('发布失败: ' + error)
  }
}

const archivePlan = async (id: string) => {
  if (!confirm('确定要归档该教案吗？归档后将不再显示为活跃教案。')) {
    return
  }

  try {
    await planStore.archivePlan(id)
    await loadPlans(planStore.pagination.page || 1)
  } catch (error) {
    alert('归档失败: ' + error)
  }
}

const triggerExportDownload = async (id: string, title: string, format: ExportFormat) => {
  try {
    const config = EXPORT_FORMAT_CONFIG[format]
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/export/${format}/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || '导出失败')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}.${config.extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    return true
  } catch (error) {
    alert('导出失败: ' + error)
    return false
  }
}

const openExportPreview = async (id: string, title: string, format: ExportFormat) => {
  isExportPreviewVisible.value = true
  isExportPreviewLoading.value = true
  exportPreviewError.value = ''
  exportPreviewData.value = null
  pendingExport.value = { id, title, format }

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/export/preview/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || '导出预检失败')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || '导出预检失败')
    }

    exportPreviewData.value = result.data as ExportPreviewData
  } catch (error) {
    exportPreviewError.value = error instanceof Error ? error.message : '导出预检失败'
  } finally {
    isExportPreviewLoading.value = false
  }
}

const closeExportPreview = () => {
  isExportPreviewVisible.value = false
  isExportPreviewLoading.value = false
  exportPreviewError.value = ''
  exportPreviewData.value = null
  pendingExport.value = null
  isExporting.value = false
}

const confirmExport = async () => {
  if (!pendingExport.value || isExporting.value) {
    return
  }

  isExporting.value = true
  const { id, title, format } = pendingExport.value
  const success = await triggerExportDownload(id, title, format)
  isExporting.value = false

  if (success) {
    closeExportPreview()
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const getStatusVariant = (status?: string): 'default' | 'warning' | 'success' => {
  switch (status) {
    case 'PUBLISHED':
      return 'success'
    case 'DRAFT':
      return 'warning'
    default:
      return 'default'
  }
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'PUBLISHED':
      return '已发布'
    case 'DRAFT':
      return '草稿'
    case 'ARCHIVED':
      return '已归档'
    default:
      return '未知'
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>
