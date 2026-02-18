<template>
  <BaseCard :hoverable="true" padding="lg" class="relative overflow-hidden">
    <div class="absolute inset-x-0 top-0 h-0.5 opacity-80" :class="accentClass"></div>

    <div class="relative flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="h-11 w-11 rounded flex items-center justify-center" :class="iconBgClass">
          <slot name="icon">
            <svg class="h-5 w-5" :class="iconClass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </slot>
        </div>
        <div class="min-w-0">
          <p class="text-sm text-slate-500 truncate">{{ label }}</p>
          <p class="text-3xl font-semibold text-slate-900 leading-tight">{{ formattedValue }}</p>
        </div>
      </div>

      <div v-if="trend" class="text-xs font-semibold" :class="trendClass">
        {{ trendValue }}
      </div>
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
  color?: 'blue' | 'indigo' | 'emerald' | 'slate'
}

const props = withDefaults(defineProps<Props>(), {
  trend: null,
  trendValue: '',
  color: 'blue',
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('zh-CN')
  }
  return props.value
})

const colorMap = {
  blue: {
    accent: 'bg-[#c9d6cf]',
    iconBg: 'bg-[#eef3f0]',
    icon: 'text-[#435549]',
  },
  indigo: {
    accent: 'bg-amber-200',
    iconBg: 'bg-amber-50',
    icon: 'text-amber-600',
  },
  emerald: {
    accent: 'bg-emerald-300',
    iconBg: 'bg-emerald-50',
    icon: 'text-emerald-600',
  },
  slate: {
    accent: 'bg-slate-300',
    iconBg: 'bg-slate-100',
    icon: 'text-slate-500',
  },
}

const accentClass = computed(() => colorMap[props.color].accent)
const iconBgClass = computed(() => colorMap[props.color].iconBg)
const iconClass = computed(() => colorMap[props.color].icon)

const trendClass = computed(() => (props.trend === 'up' ? 'text-emerald-600' : 'text-red-600'))
</script>
