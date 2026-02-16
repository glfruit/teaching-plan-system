<template>
  <header class="mb-8">
    <p v-if="superTitle" class="text-xs font-semibold uppercase tracking-wider text-amber-700">
      {{ superTitle }}
    </p>
    <div class="flex items-center gap-4 mt-2">
      <router-link
        v-if="backLink"
        :to="backLink"
        class="rounded-lg p-2 text-warm-600 hover:bg-warm-100 transition-colors"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </router-link>
      <h1 class="font-display text-3xl font-bold text-warm-900">{{ title }}</h1>
    </div>
    <p v-if="subtitle" class="mt-2 text-warm-600 max-w-2xl">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  superTitle?: string
  backLink?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  superTitle: '',
  backLink: '',
})
</script>
