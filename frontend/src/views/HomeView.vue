<template>
  <div class="min-h-screen bg-[#fffbf0]">
    <NavBar
      :username="authStore.user?.username || ''"
      @new="router.push('/editor')"
      @logout="handleLogout"
    />

    <main class="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <div v-if="planStore.isLoading" class="flex items-center justify-center py-24">
        <div class="flex items-center gap-3 text-amber-700">
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
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 p-6 border-b border-amber-100">
            <div>
              <h2 class="text-xl font-semibold font-serif text-amber-950">教案列表</h2>
              <p class="text-sm text-amber-800/80 mt-1">共 {{ planStore.pagination.total }} 个教案</p>
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

          <div v-if="!planStore.hasPlans" class="py-16 text-center px-6">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-5">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-amber-950 font-serif">暂无教案</h3>
            <p class="text-sm text-amber-800/80 mt-2 mb-6">开始创建您的第一个教案吧</p>
            <BaseButton @click="router.push('/editor')">创建教案</BaseButton>
          </div>

          <TransitionGroup
            v-else
            tag="div"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            class="divide-y divide-amber-100"
          >
            <div
              v-for="(plan, index) in planStore.plans"
              :key="plan.id"
              class="p-6 hover:bg-amber-50/50 transition-colors"
              :style="{ transitionDelay: `${index * 40}ms` }"
            >
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3
                      class="text-base font-semibold text-amber-950 cursor-pointer hover:text-amber-700 transition-colors truncate"
                      @click="editPlan(plan.id!)"
                    >
                      {{ plan.title }}
                    </h3>
                    <BaseBadge :variant="getStatusVariant(plan.status)">
                      {{ getStatusText(plan.status) }}
                    </BaseBadge>
                  </div>
                  <p class="text-sm text-amber-800/80">
                    {{ plan.courseName }} · {{ plan.className }} · {{ plan.duration }}分钟
                  </p>
                  <p class="text-sm text-amber-700/70 mt-1">
                    更新于 {{ formatDate(plan.updatedAt) }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="editPlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded-lg text-sm text-amber-800 hover:bg-amber-100 transition-colors"
                    title="编辑"
                  >
                    编辑
                  </button>
                  <button
                    @click="exportPlan(plan.id!, plan.title)"
                    class="min-h-[44px] px-3 rounded-lg text-sm text-amber-800 hover:bg-amber-100 transition-colors"
                    title="导出"
                  >
                    导出
                  </button>
                  <button
                    @click="deletePlan(plan.id!)"
                    class="min-h-[44px] px-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="planStore.pagination.totalPages > 1" class="flex items-center justify-between p-6 border-t border-amber-100">
            <p class="text-sm text-amber-800/80">第 {{ planStore.pagination.page }} / {{ planStore.pagination.totalPages }} 页</p>
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

const draftCount = computed(() => planStore.plans.filter((p) => p.status === 'DRAFT').length)
const publishedCount = computed(() => planStore.plans.filter((p) => p.status === 'PUBLISHED').length)
const archivedCount = computed(() => planStore.plans.filter((p) => p.status === 'ARCHIVED').length)

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
    color: 'orange' as const,
    iconClass: 'text-orange-600',
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
    color: 'amber' as const,
    iconClass: 'text-amber-600',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  },
])

onMounted(() => {
  loadPlans()
})

const loadPlans = async (page = 1) => {
  try {
    await planStore.fetchPlans({
      page,
      limit: 10,
      search: searchQuery.value || undefined,
    })
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

const exportPlan = async (id: string, title: string) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/export/word/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('导出失败')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    alert('导出失败: ' + error)
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
