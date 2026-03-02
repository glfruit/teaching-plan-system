<template>
  <div class="mb-4 rounded border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/80 p-3">
    <p class="text-xs font-semibold text-amber-800">模板编辑标签</p>
    <div class="mt-2 flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
      <button
        v-for="(tab, index) in tabs"
        :key="`template-edit-tab-${tab.id}`"
        type="button"
        @click="emit('select', tab.id)"
        :aria-current="activeTab === tab.id ? 'page' : undefined"
        class="min-w-[9rem] shrink-0 rounded border px-2.5 py-2 text-left transition-all lg:min-w-0"
        :class="activeTab === tab.id
          ? 'border-amber-300 bg-amber-100/80 ring-1 ring-amber-200'
          : 'border-slate-200 bg-white hover:bg-slate-50'"
      >
        <div class="flex items-center justify-between gap-1">
          <p class="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
            <span class="inline-flex h-4 min-w-4 items-center justify-center rounded border border-amber-200 bg-amber-50 px-1 text-[10px] font-semibold text-amber-700">
              {{ index + 1 }}
            </span>
            <span>{{ tab.label }}</span>
          </p>
          <span class="text-[10px] font-medium text-slate-500">{{ tab.filledCount }}/{{ tab.totalCount }}</span>
        </div>
        <p class="mt-0.5 text-[10px] text-slate-500">{{ tab.description }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type TemplateEditTabItem = {
  id: 'basic' | 'design' | 'process' | 'review'
  label: string
  description: string
  filledCount: number
  totalCount: number
}

defineProps<{
  tabs: TemplateEditTabItem[]
  activeTab: TemplateEditTabItem['id']
}>()

const emit = defineEmits<{
  select: [tab: TemplateEditTabItem['id']]
}>()
</script>
