<template>
  <div class="w-full">
    <label v-if="label" class="block mb-1.5 text-sm font-medium text-warm-800">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
    />
    <p v-if="error" class="mt-1.5 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="helper" class="mt-1.5 text-sm text-warm-600">{{ helper }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helper?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  required: false,
  error: '',
  helper: '',
  size: 'md',
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const inputClasses = computed(() => {
  const baseClasses = 'w-full bg-warm-50 border border-amber-200 rounded-lg text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 disabled:bg-warm-100 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-3 text-lg',
  }
  
  const errorClasses = props.error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''
  
  return `${baseClasses} ${sizeClasses[props.size]} ${errorClasses}`
})
</script>
