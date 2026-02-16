<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
  shadow: 'md',
})

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-xl border border-amber-100 transition-all duration-300'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-warm',
    lg: 'shadow-warm-lg',
  }
  
  const hoverClasses = props.hoverable 
    ? 'hover:shadow-warm-lg hover:-translate-y-1 cursor-pointer' 
    : ''
  
  return `${baseClasses} ${paddingClasses[props.padding]} ${shadowClasses[props.shadow]} ${hoverClasses}`
})
</script>
