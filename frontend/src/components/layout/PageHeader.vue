<template>
  <header class="mb-8">
    <div class="flex items-start gap-3">
      <button
        v-if="backLink"
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-800 hover:bg-amber-50 transition-colors"
        @click="handleBack"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div>
        <p v-if="superTitle" class="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          {{ superTitle }}
        </p>
        <h1 class="font-serif text-3xl sm:text-4xl font-semibold text-amber-900 mt-1">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-2 text-amber-800/85 max-w-2xl leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
  subtitle?: string
  superTitle?: string
  backLink?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  superTitle: '',
  backLink: '',
})

const router = useRouter()

const handleBack = () => {
  if (!props.backLink) return
  router.push(props.backLink)
}
</script>
