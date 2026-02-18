<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-[#eef3f0] to-[#e4ece7] px-4 py-8 sm:px-6 lg:px-10">
    <div class="pointer-events-none absolute -top-16 -left-20 h-72 w-72 rounded-full bg-slate-300/35 blur-3xl floating-shape"></div>
    <div class="pointer-events-none absolute bottom-[-120px] right-[-80px] h-80 w-80 rounded-full bg-[#b7c6bc]/30 blur-3xl floating-shape-delayed"></div>

    <div class="relative mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded border border-slate-200 bg-white/70 shadow-[var(--shadow-warm-lg)] backdrop-blur-sm lg:grid-cols-[1.05fr_0.95fr]">
      <section class="relative overflow-hidden bg-gradient-to-br from-slate-100 via-[#eef3f0] to-[#d9e5de] p-8 sm:p-10 lg:p-12">
        <div class="absolute -top-16 right-[-60px] h-52 w-52 rounded-full bg-white/45 blur-2xl"></div>
        <div class="absolute bottom-[-30px] left-[-30px] h-44 w-44 rounded-full bg-[#b7c6bc]/35 blur-2xl"></div>

        <div class="relative">
          <div class="mb-8 inline-flex h-16 w-16 items-center justify-center rounded bg-gradient-to-br from-[#6f8177] to-[#435549] text-white shadow-[var(--shadow-md)]">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <h1 class="font-serif text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight">教案管理系统</h1>
          <p class="mt-4 max-w-md text-slate-800/85 leading-relaxed">
            面向教师的现代化教案工作台，支持结构化编写、模板复用与数据分析。
          </p>

          <BaseCard padding="lg" class="mt-10 bg-white/75 border-slate-200">
            <h2 class="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 mb-4">演示账号</h2>
            <div class="space-y-3 text-sm text-slate-800/85">
              <p><span class="font-semibold">教师：</span><code>testteacher / 123456</code></p>
              <p><span class="font-semibold">备用：</span><code>teacher1 / teacher123</code></p>
              <p><span class="font-semibold">管理员：</span><code>admin / admin123</code></p>
            </div>
          </BaseCard>
        </div>
      </section>

      <section class="flex items-center p-6 sm:p-10 lg:p-12">
        <BaseCard padding="xl" class="w-full bg-white/95 border-slate-200 shadow-[var(--shadow-warm)]">
          <h2 class="font-serif text-3xl font-semibold text-slate-900">欢迎回来</h2>
          <p class="mt-2 text-sm text-slate-500">请使用教师账号进入教案编辑工作台</p>

          <form @submit.prevent="handleLogin" class="mt-8 space-y-5">
            <BaseInput
              v-model="form.username"
              label="用户名"
              placeholder="请输入用户名"
              required
              size="md"
            />

            <BaseInput
              v-model="form.password"
              label="密码"
              type="password"
              placeholder="请输入密码"
              required
              size="md"
            />

            <div v-if="authStore.error" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {{ authStore.error }}
            </div>

            <BaseButton
              type="submit"
              full-width
              size="lg"
              :loading="authStore.isLoading"
              :disabled="authStore.isLoading"
              class="mt-2"
            >
              {{ authStore.isLoading ? '登录中...' : '登录系统' }}
            </BaseButton>
          </form>
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
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

const handleLogin = async () => {
  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    })
    router.push('/')
  } catch {
    // error handled by store
  }
}
</script>
