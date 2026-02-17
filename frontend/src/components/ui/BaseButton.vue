<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-2 inline-flex">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <span v-if="$slots.prefix && !loading" class="mr-1.5 inline-flex items-center">
      <slot name="prefix" />
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'text-white bg-amber-600 hover:bg-amber-700 shadow-[var(--shadow-warm)] hover:shadow-[var(--shadow-warm-lg)]',
    secondary:
      'text-amber-900 bg-white border border-amber-200 hover:bg-amber-50',
    ghost: 'text-amber-800 hover:text-amber-900 hover:bg-amber-100',
    danger: 'text-white bg-red-600 hover:bg-red-700 shadow-[var(--shadow-md)]',
    warning: 'text-white bg-orange-500 hover:bg-orange-600 shadow-[var(--shadow-md)]',
  }

  const sizeClasses = {
    sm: 'min-h-[40px] px-3 py-2 text-sm',
    md: 'min-h-[44px] px-4 py-2.5 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-base',
  }

  return [baseClasses, variantClasses[props.variant], sizeClasses[props.size], props.fullWidth ? 'w-full' : ''].join(' ')
})
</script>
