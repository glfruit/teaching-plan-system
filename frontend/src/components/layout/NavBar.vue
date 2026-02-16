<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo area -->
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-warm">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="font-display text-xl font-bold text-warm-900">教案管理系统</h1>
            <p class="text-xs text-warm-600">教师工作台</p>
          </div>
        </router-link>
      </div>
      
      <!-- Mobile menu button -->
      <button 
        @click="showMobileMenu = !showMobileMenu" 
        class="rounded-lg p-2 text-warm-600 hover:bg-warm-100 sm:hidden"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Desktop actions -->
      <div class="hidden sm:flex items-center gap-3">
        <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm text-amber-800">
          {{ username }}
        </span>
        <BaseButton
          v-if="showNewButton"
          variant="primary"
          size="md"
          @click="$emit('new')"
        >
          <template #default>
            <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            新建教案
          </template>
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="md"
          @click="$emit('logout')"
        >
          退出
        </BaseButton>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="showMobileMenu" class="border-t border-amber-100 bg-white p-4 sm:hidden">
      <p class="mb-3 text-sm text-warm-700">当前用户：{{ username }}</p>
      <div class="grid grid-cols-2 gap-2">
        <BaseButton
          v-if="showNewButton"
          variant="primary"
          size="md"
          full-width
          @click="$emit('new'); showMobileMenu = false"
        >
          新建教案
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="md"
          full-width
          @click="$emit('logout'); showMobileMenu = false"
        >
          退出
        </BaseButton>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

interface Props {
  username: string
  showNewButton?: boolean
}

withDefaults(defineProps<Props>(), {
  showNewButton: true,
})

defineEmits<{
  new: []
  logout: []
}>()

const showMobileMenu = ref(false)
</script>
