<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-slate-800">教案管理系统</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- User Info -->
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ authStore.user?.username }}</span>
            </div>
            
            <!-- Logout -->
            <button
              @click="handleLogout"
              class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="退出登录"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            
            <router-link
              to="/editor"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新建教案
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="planStore.isLoading" class="flex items-center justify-center py-20">
        <div class="flex items-center gap-3 text-slate-500">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>加载中...</span>
        </div>
      </div>

      <template v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500">总教案数</p>
                <p class="text-3xl font-bold text-slate-800 mt-1">{{ planStore.pagination.total }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500">草稿</p>
                <p class="text-3xl font-bold text-slate-800 mt-1">{{ draftCount }}</p>
              </div>
              <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-500">已发布</p>
                <p class="text-3xl font-bold text-slate-800 mt-1">{{ publishedCount }}</p>
              </div>
              <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Plans List -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-800">教案列表</h2>
            
            <div class="flex items-center gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索教案..."
                class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="handleSearch"
              />
              <button
                @click="handleSearch"
                class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="!planStore.hasPlans" class="py-20 text-center">
            <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-slate-500">还没有教案，点击右上角按钮创建</p>
          </div>
          
          <!-- Plans List -->
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="plan in planStore.plans"
              :key="plan.id"
              class="px-6 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 cursor-pointer flex-1" @click="editPlan(plan.id!)">
                  <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  <div class="flex-1">
                    <h3 class="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                      {{ plan.title }}
                    </h3>
                    <p class="text-sm text-slate-500 mt-0.5">
                      {{ plan.courseName }} · {{ plan.className }} · {{ plan.duration }}分钟
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <span
                    class="px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClass(plan.status)"
                  >
                    {{ getStatusText(plan.status) }}
                  </span>
                  
                  <span class="text-sm text-slate-400">
                    {{ formatDate(plan.updatedAt) }}
                  </span>
                  
                  <!-- Delete Button -->
                  <button
                    @click="deletePlan(plan.id!)"
                    class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="删除"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="planStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <button
              @click="changePage(planStore.pagination.page - 1)"
              :disabled="planStore.pagination.page <= 1"
              class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              上一页
            </button>
            
            <span class="text-sm text-slate-600">
              第 {{ planStore.pagination.page }} / {{ planStore.pagination.totalPages }} 页
            </span>
            
            <button
              @click="changePage(planStore.pagination.page + 1)"
              :disabled="planStore.pagination.page >= planStore.pagination.totalPages"
              class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePlanStore } from '../stores/plan'

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

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const getStatusClass = (status?: string) => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-emerald-50 text-emerald-600'
    case 'DRAFT':
      return 'bg-amber-50 text-amber-600'
    case 'ARCHIVED':
      return 'bg-slate-100 text-slate-600'
    default:
      return 'bg-slate-100 text-slate-600'
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
