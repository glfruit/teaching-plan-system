<template>
  <div class="min-h-screen bg-warm-50">
    <NavBar
      :username="authStore.user?.username || ''"
      @new="router.push('/editor')"
      @logout="handleLogout"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div v-if="planStore.isLoading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 text-warm-600">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </div>
      </div>

      <template v-else>
        <!-- Welcome section -->
        <PageHeader
          super-title="Dashboard"
          :title="`欢迎，${authStore.user?.username || '教师'}`"
          subtitle="专注教案编写、模板沉淀与导出交付。开始创建您的教学计划吧！"
        />

        <!-- Stats cards -->
        <section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="总教案数" :value="planStore.pagination.total" />
          <StatCard label="草稿" :value="draftCount" trend="up" trend-value="待完善" />
          <StatCard label="已发布" :value="publishedCount" trend="up" trend-value="可使用" />
        </section>

        <!-- Plans list -->
        <BaseCard>
          <div class="flex flex-col gap-4 border-b border-warm-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="font-display text-2xl font-bold text-warm-900">教案列表</h3>
            <div class="flex items-center gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索教案标题"
                class="h-11 w-full sm:w-64 bg-warm-50 border border-amber-200 rounded-xl px-4 text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                @keyup.enter="handleSearch"
              />
              <BaseButton variant="primary" size="md" @click="handleSearch">
                搜索
              </BaseButton>
            </div>
          </div>

          <div v-if="!planStore.hasPlans" class="p-12 text-center">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warm-100 mb-4">
              <svg class="h-8 w-8 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-warm-600 text-lg">暂无教案</p>
            <p class="text-warm-500 text-sm mt-1">点击"新建教案"开始创建您的第一个教案</p>
          </div>

          <div v-else class="divide-y divide-warm-100">
            <article 
              v-for="plan in planStore.plans" 
              :key="plan.id" 
              class="p-5 hover:bg-warm-50/50 transition-colors duration-200"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button class="text-left flex-1" @click="editPlan(plan.id!)">
                  <h4 class="font-display text-lg font-semibold text-warm-900 hover:text-amber-700 transition-colors">{{ plan.title }}</h4>
                  <p class="mt-1 text-sm text-warm-600">{{ plan.courseName }} · {{ plan.className }} · {{ plan.duration }}分钟</p>
                  <p class="mt-1 text-xs text-warm-500">更新于 {{ formatDate(plan.updatedAt) }}</p>
                </button>
                <div class="flex flex-wrap items-center gap-2">
                  <BaseBadge :variant="getStatusVariant(plan.status)">
                    {{ getStatusText(plan.status) }}
                  </BaseBadge>
                  <BaseButton variant="ghost" size="sm" @click="exportPlan(plan.id!, plan.title)">
                    导出
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="editPlan(plan.id!)">
                    编辑
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="deletePlan(plan.id!)">
                    <span class="text-red-600">删除</span>
                  </BaseButton>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <div v-if="planStore.pagination.totalPages > 1" class="flex items-center justify-between border-t border-warm-100 p-5">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="planStore.pagination.page <= 1"
              @click="changePage(planStore.pagination.page - 1)"
            >
              上一页
            </BaseButton>
            <span class="text-sm text-warm-600">
              第 {{ planStore.pagination.page }} / {{ planStore.pagination.totalPages }} 页
            </span>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="planStore.pagination.page >= planStore.pagination.totalPages"
              @click="changePage(planStore.pagination.page + 1)"
            >
              下一页
            </BaseButton>
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
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import StatCard from '../components/ui/StatCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const planStore = usePlanStore()

const searchQuery = ref('')

const draftCount = computed(() => 
  planStore.plans.filter(p => p.status === 'DRAFT').length
)

const publishedCount = computed(() => 
  planStore.plans.filter(p => p.status === 'PUBLISHED').length
)

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
        'Authorization': `Bearer ${token}`,
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

const getStatusVariant = (status?: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'success'
    case 'DRAFT':
      return 'warning'
    case 'ARCHIVED':
      return 'default'
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
