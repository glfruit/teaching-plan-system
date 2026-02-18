<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
    <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="hidden md:flex h-16 items-center justify-between">
        <div class="flex items-center gap-8">
          <router-link to="/" class="flex items-center gap-3">
            <div class="h-10 w-10 rounded bg-gradient-to-br from-[#6f8177] to-[#435549] text-white flex items-center justify-center shadow-[var(--shadow-warm)]">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="font-serif text-lg font-semibold text-slate-900 leading-none">教案系统</p>
              <p class="text-xs text-slate-500 mt-1">教师工作台</p>
            </div>
          </router-link>

          <nav class="flex items-center gap-2">
            <router-link
              to="/"
              class="min-h-[44px] px-4 rounded text-sm font-medium inline-flex items-center transition-colors"
              :class="route.path === '/' ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-100'"
            >
              首页
            </router-link>
            <router-link
              to="/analytics"
              class="min-h-[44px] px-4 rounded text-sm font-medium inline-flex items-center transition-colors"
              :class="route.path === '/analytics' ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-100'"
            >
              分析
            </router-link>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="emit('new')"
            class="min-h-[44px] px-4 rounded bg-[#647269] hover:bg-[#55645b] text-white text-sm font-medium inline-flex items-center gap-1.5 transition-all active:scale-95"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            新建
          </button>

          <div class="h-6 w-px bg-slate-200"></div>

          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold inline-flex items-center justify-center">
              {{ userInitial }}
            </div>
            <span class="text-sm text-slate-800/85">{{ username }}</span>
          </div>

          <button
            @click="emit('logout')"
            class="h-10 w-10 rounded border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 inline-flex items-center justify-center transition-colors"
            title="退出登录"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div class="md:hidden h-16 flex items-center gap-2 mobile-action-row">
        <router-link to="/" class="flex items-center gap-2 min-w-0">
          <div class="h-9 w-9 rounded bg-gradient-to-br from-[#6f8177] to-[#435549] text-white flex items-center justify-center shadow-[var(--shadow-warm)]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 leading-none">教案系统</p>
            <p class="text-[11px] text-slate-400 mt-1 truncate">{{ username || 'testteacher' }}</p>
          </div>
        </router-link>

        <button
          @click="toggleMobileDrawer"
          class="ml-2 h-9 w-9 shrink-0 rounded border border-slate-200 text-slate-600 bg-white inline-flex items-center justify-center"
          title="打开导航菜单"
          aria-label="打开导航菜单"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="showMobileDrawer"
      class="md:hidden mobile-user-drawer border-t border-slate-200 bg-slate-50 px-4 pb-4 pt-3 space-y-3"
    >
      <div class="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2.5">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="h-8 w-8 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center">
            {{ userInitial }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ username || '教师账号' }}</p>
            <p class="text-[11px] text-slate-400">教学工作台</p>
          </div>
        </div>
        <button
          @click="showMobileDrawer = false"
          class="h-8 w-8 rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"
          title="收起导航菜单"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="grid grid-cols-2 gap-2">
        <router-link
          to="/"
          class="min-h-[44px] rounded border text-sm font-medium inline-flex items-center justify-center"
          :class="route.path === '/' ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-slate-200 text-slate-600 bg-white'"
          @click="showMobileDrawer = false"
        >
          首页
        </router-link>
        <router-link
          to="/analytics"
          class="min-h-[44px] rounded border text-sm font-medium inline-flex items-center justify-center"
          :class="route.path === '/analytics' ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-slate-200 text-slate-600 bg-white'"
          @click="showMobileDrawer = false"
        >
          分析
        </router-link>
      </nav>

      <button
        @click="handleCreatePlan"
        class="w-full min-h-[44px] rounded bg-[#647269] text-white text-sm font-medium inline-flex items-center justify-center gap-1.5"
        title="新建教案"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新建教案
      </button>

      <button
        @click="handleLogout"
        class="w-full min-h-[44px] rounded border border-red-200 text-red-600 bg-red-50 text-sm font-medium inline-flex items-center justify-center gap-1.5"
        title="退出登录"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        退出登录
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  username: string
}>()

const emit = defineEmits<{
  new: []
  logout: []
}>()

const route = useRoute()
const showMobileDrawer = ref(false)

const userInitial = computed(() => (props.username?.trim()?.charAt(0) || '教').toUpperCase())

watch(
  () => route.path,
  () => {
    showMobileDrawer.value = false
  }
)

const toggleMobileDrawer = () => {
  showMobileDrawer.value = !showMobileDrawer.value
}

const handleCreatePlan = () => {
  showMobileDrawer.value = false
  emit('new')
}

const handleLogout = () => {
  showMobileDrawer.value = false
  emit('logout')
}
</script>
