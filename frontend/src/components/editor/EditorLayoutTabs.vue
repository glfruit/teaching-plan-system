<template>
  <section class="sticky top-[4.5rem] z-10 rounded border border-amber-200 bg-gradient-to-r from-amber-50/95 via-white/95 to-orange-50/95 p-4 shadow-sm backdrop-blur-sm">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p class="text-sm font-semibold text-amber-900">标签式编辑分区</p>
        <p class="mt-1 text-xs text-amber-700">将输入项按教学流程分组，避免整页拥挤。</p>
        <p class="mt-1 text-[11px] text-amber-700/90">快捷切换：Alt/Option + 1~4</p>
      </div>
      <span class="inline-flex items-center rounded-sm border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-amber-700">
        当前标签：{{ activeLabel }}
      </span>
    </div>
    <div class="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
      <button
        v-for="(tab, index) in tabs"
        :key="`editor-layout-tab-${tab.id}`"
        type="button"
        @click="emit('select', tab.id)"
        :aria-current="activeTab === tab.id ? 'page' : undefined"
        class="min-w-[12rem] shrink-0 rounded border px-3 py-2 text-left transition-all sm:min-w-0"
        :class="activeTab === tab.id
          ? 'border-amber-300 bg-amber-100/80 shadow-sm ring-1 ring-amber-200'
          : tab.requiredMissingCount > 0
            ? 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/50'
            : 'border-slate-200 bg-white hover:bg-slate-50'"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="inline-flex h-4 min-w-4 items-center justify-center rounded border border-amber-200 bg-amber-50 px-1 text-[10px] font-semibold text-amber-700">
              {{ index + 1 }}
            </span>
            <p class="text-sm font-semibold text-slate-800">{{ tab.label }}</p>
          </div>
          <span class="text-[11px] font-medium" :class="tab.requiredMissingCount > 0 ? 'text-amber-700' : 'text-slate-500'">
            {{ tab.filledCount }}/{{ tab.totalCount }}
          </span>
        </div>
        <p class="mt-1 text-[11px] text-slate-500">{{ tab.description }}</p>
        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full transition-all"
            :class="tab.requiredMissingCount > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'"
            :style="{ width: `${tab.totalCount > 0 ? Math.round((tab.filledCount / tab.totalCount) * 100) : 0}%` }"
          />
        </div>
        <p
          class="mt-1 text-[10px] font-medium"
          :class="tab.requiredMissingCount > 0 ? 'text-amber-700' : 'text-emerald-700'"
        >
          {{ tab.requiredMissingCount > 0 ? `缺 ${tab.requiredMissingCount} 项必填` : '必填项已就绪' }}
        </p>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
type EditorLayoutTabItem = {
  id: 'basic' | 'design' | 'process' | 'review'
  label: string
  description: string
  filledCount: number
  totalCount: number
  requiredMissingCount: number
}

defineProps<{
  tabs: EditorLayoutTabItem[]
  activeTab: EditorLayoutTabItem['id']
  activeLabel: string
}>()

const emit = defineEmits<{
  select: [tab: EditorLayoutTabItem['id']]
}>()
</script>
