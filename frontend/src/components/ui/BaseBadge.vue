<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium'

  const variantClasses = {
    default: 'bg-amber-100 text-amber-900',
    primary: 'bg-amber-200 text-amber-900',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-orange-100 text-orange-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-sky-100 text-sky-700',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]}`
})
</script>
