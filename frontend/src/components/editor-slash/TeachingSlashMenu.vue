<template>
  <div class="border-b border-slate-200 bg-slate-50/60 px-3 py-2">
    <div class="flex items-center gap-2 flex-wrap">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="text-xs px-2 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
        @click="$emit('select', item)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeachingSlashItem } from './slashItems'

defineProps<{
  items: TeachingSlashItem[]
}>()

defineEmits<{
  (e: 'select', item: TeachingSlashItem): void
}>()
</script>
