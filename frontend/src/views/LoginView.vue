<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div class="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-float-delayed"></div>
      <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl animate-float"></div>
    </div>
    
    <div class="relative z-10 w-full max-w-5xl">
      <div class="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
        <!-- Left side - Brand -->
        <section class="hidden lg:block">
          <div class="space-y-8">
            <div>
              <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-warm-lg mb-6">
                <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="font-display text-4xl font-bold text-warm-900 leading-tight">教案管理系统</h1>
              <p class="mt-4 text-lg text-warm-700 leading-relaxed max-w-md">
                面向高职院校教师的教案编写与管理平台，支持富文本编辑、模板复用与一键导出，让教学准备更高效。
              </p>
            </div>
            
            <div class="inline-block rounded-2xl border border-amber-200 bg-white/70 backdrop-blur-sm p-6 shadow-warm">
              <p class="text-sm font-semibold text-amber-800 mb-3">演示账号</p>
              <div class="space-y-1.5 text-sm text-warm-700">
                <p>用户名：<span class="font-semibold text-warm-900">testteacher</span></p>
                <p>密码：<span class="font-semibold text-warm-900">123456</span></p>
              </div>
            </div>
          </div>
        </section>

        <!-- Right side - Login form -->
        <section>
          <BaseCard padding="lg" shadow="lg" class="bg-white/90 backdrop-blur-sm">
            <!-- Mobile header -->
            <div class="mb-6 lg:hidden text-center">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-warm mb-4">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 class="font-display text-2xl font-bold text-warm-900">教案管理系统</h1>
            </div>

            <div class="mb-6">
              <h2 class="font-display text-2xl font-bold text-warm-900">欢迎回来</h2>
              <p class="mt-1 text-sm text-warm-600">请使用教师账号登录系统</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
              <div v-if="authStore.error" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {{ authStore.error }}
              </div>

              <BaseInput
                v-model="form.username"
                label="用户名"
                placeholder="请输入用户名"
                required
                size="lg"
              />

              <BaseInput
                v-model="form.password"
                type="password"
                label="密码"
                placeholder="请输入密码"
                required
                size="lg"
              />

              <BaseButton
                type="submit"
                variant="primary"
                size="lg"
                :loading="authStore.isLoading"
                full-width
                class="mt-2"
              >
                {{ authStore.isLoading ? '登录中...' : '进入系统' }}
              </BaseButton>
            </form>

            <!-- Mobile demo account -->
            <div class="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 lg:hidden">
              <p class="font-semibold mb-2">演示账号</p>
              <p>用户名：<span class="font-semibold">testteacher</span></p>
              <p>密码：<span class="font-semibold">123456</span></p>
            </div>
          </BaseCard>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

onMounted(() => {
  authStore.initUser()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

const handleLogin = async () => {
  try {
    authStore.clearError()
    await authStore.login(form)
    router.push('/')
  } catch (error) {
    // 错误已在 store 中处理
  }
}
</script>
