<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hoverable?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
  shadow: 'sm',
  border: true,
})

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-xl'

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-[var(--shadow-sm)]',
    md: 'shadow-[var(--shadow-md)]',
    lg: 'shadow-[var(--shadow-lg)]',
  }

  const borderClass = props.border ? 'border border-amber-100' : ''
  const hoverClass = props.hoverable
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-warm-lg)]'
    : ''

  return [baseClasses, paddingClasses[props.padding], shadowClasses[props.shadow], borderClass, hoverClass].join(' ')
})
</script>
