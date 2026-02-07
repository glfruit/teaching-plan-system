<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800">教案管理系统</h1>
        <p class="text-slate-500 mt-2">请登录您的账户</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <form @submit.prevent="handleLogin">
          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
          >
            {{ authStore.error }}
          </div>

          <!-- Username -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-2">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-2">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- Demo Account Hint -->
        <div class="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p class="text-sm text-slate-600 font-medium mb-2">演示账户：</p>
          <p class="text-sm text-slate-500">用户名: testteacher</p>
          <p class="text-sm text-slate-500">密码: 123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

onMounted(() => {
  // 如果已登录，跳转到首页
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
