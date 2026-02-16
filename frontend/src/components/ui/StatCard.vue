<template>
  <BaseCard class="p-5" :hoverable="true">
    <p class="text-sm text-warm-600">{{ label }}</p>
    <p class="mt-2 text-4xl font-bold text-warm-900">{{ formattedValue }}</p>
    <div v-if="trend" class="mt-2 flex items-center gap-1 text-sm">
      <svg 
        v-if="trend === 'up'" 
        class="h-4 w-4 text-emerald-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <svg 
        v-else 
        class="h-4 w-4 text-red-600" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
      <span :class="trend === 'up' ? 'text-emerald-600' : 'text-red-600'">
        {{ trendValue }}
      </span>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'

interface Props {
  label: string
  value: string | number
  trend?: 'up' | 'down' | null
  trendValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: null,
  trendValue: '',
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('zh-CN')
  }
  return props.value
})
</script>
