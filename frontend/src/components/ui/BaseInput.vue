<template>
  <div class="w-full">
    <label v-if="label" class="mb-2 block text-sm font-medium text-amber-900">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @keyup="$emit('keyup', $event)"
      />
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="helper" class="mt-2 text-sm text-amber-700/75">{{ helper }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helper?: string
  size?: 'sm' | 'md' | 'lg'
  min?: string | number
  max?: string | number
  step?: string | number
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
  min: undefined,
  max: undefined,
  step: undefined,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  keyup: [event: KeyboardEvent]
}>()

const inputClasses = computed(() => {
  const baseClasses =
    'w-full rounded-xl border bg-[#fffdf8] text-[#3f2305] placeholder-[#b78f5d] transition-all duration-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white disabled:bg-amber-50/70 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'min-h-[40px] px-4 py-2 text-sm',
    md: 'min-h-[44px] px-4 py-3 text-base',
    lg: 'min-h-[48px] px-5 py-3.5 text-lg',
  }

  const errorClasses = props.error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-amber-200'

  return `${baseClasses} ${sizeClasses[props.size]} ${errorClasses}`
})
</script>
