<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex min-h-16 items-center justify-between gap-2 py-2">
          <div class="flex min-w-0 items-center gap-3 sm:gap-4">
            <router-link
              to="/"
              class="shrink-0 p-2 hover:bg-slate-100 rounded transition-colors text-slate-600 hover:text-slate-800"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            
            <div class="min-w-0">
              <h1 class="text-base sm:text-lg font-semibold text-slate-800 truncate">{{ editorPageTitle }}</h1>
              <p class="hidden lg:block text-xs text-[#647269] truncate">{{ contentSourceLabel }} · {{ editorStatusText }}</p>
              <p v-if="localDraftMessage" class="hidden xl:block text-[11px] text-emerald-600 truncate max-w-[24rem]">{{ localDraftMessage }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Desktop Buttons -->
            <div class="hidden sm:flex items-center gap-3">
              <button
                @click="handleToggleFocusMode"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium"
                :class="isFocusMode ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : ''"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M7 4h10M7 20h10M4 17h16" />
                </svg>
                <span>{{ isFocusMode ? '退出专注' : '专注模式' }}</span>
              </button>
              <button
                @click="showTemplatePanel = !showTemplatePanel"
                :disabled="isFocusMode"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium"
                :class="isFocusMode ? 'cursor-not-allowed opacity-50' : ''"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5 5.145 5 3.118 5.87 2 7.124v11.502C3.118 17.37 5.145 16.5 7.5 16.5c1.746 0 3.332.477 4.5 1.253m0-11.5C13.168 5.477 14.754 5 16.5 5c2.355 0 4.382.87 5.5 2.124v11.502C20.882 17.37 18.855 16.5 16.5 16.5c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{{ showTemplatePanel ? '收起模板' : '模板库' }}</span>
              </button>

              <button
                v-if="isEditing"
                @click="handleExport"
                class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium"
              >
                导出 Word
              </button>
              
              <button
                v-if="canPublishCurrentDocument"
                @click="handlePublish"
                :disabled="isEditorSaving"
                class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                {{ publishButtonText }}
              </button>

              <button
                @click="handleOpenDraftDialog"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M7 8v11a2 2 0 002 2h6a2 2 0 002-2V8m-9 0V6a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                <span>草稿箱</span>
              </button>

              <button
                @click="handleOpenShortcutDialog"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h3m2 0h5m-9 4h3m2 0h3M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
                <span>快捷键</span>
              </button>
              
              <button
                @click="handleSave"
                :disabled="isEditorSaving || !isFormValid"
                class="px-4 py-2 bg-[#647269] text-white rounded hover:bg-[#55645b] transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                {{ isEditorSaving ? '保存中...' : '保存' }}
              </button>
            </div>

            <button
              @click="showMobileActions = true"
              class="sm:hidden h-9 w-9 inline-flex items-center justify-center rounded border border-[#d1ddd5] bg-white text-slate-600"
              title="更多操作"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-8">
      <!-- Error Message -->
      <div
        v-if="planStore.error"
        class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm sm:text-base"
      >
        {{ planStore.error }}
      </div>

      <section
        class="mb-4 rounded border border-slate-200 bg-white p-4 shadow-sm"
        :class="shouldRenderTemplatePanel ? '' : 'mx-auto w-full max-w-4xl'"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <p class="inline-flex items-center gap-2 text-base font-semibold text-slate-800">
              <svg class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197 2.132A4 4 0 017.2 6.7l.4-.4a4 4 0 016.6 4.868l-.448.6zM9 14l6 6m-6 0h6" />
              </svg>
              <span>编写助手</span>
            </p>
            <span class="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
              进度 {{ editorCompletionSummary.score }}%
            </span>
            <span
              v-if="isFocusMode"
              class="inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700"
            >
              专注编辑中
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="showOutlineDialog = true"
              class="h-10 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              章节大纲
            </button>
            <button
              @click="isAllCollapsibleSectionsCollapsed ? handleExpandAllEditorSections() : handleCollapseAllEditorSections()"
              class="h-10 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {{ isAllCollapsibleSectionsCollapsed ? '展开正文分区' : '收起正文分区' }}
            </button>
            <button
              @click="showProgressAssistantDialog = true"
              class="h-10 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              查看编写助手
            </button>
          </div>
        </div>
      </section>

      <section
        class="mb-4 rounded border border-slate-200 bg-white p-4 shadow-sm"
        :class="shouldRenderTemplatePanel ? '' : 'mx-auto w-full max-w-4xl'"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-slate-800">编辑导航</p>
            <span class="inline-flex items-center rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
              当前分区：{{ resolveEditorSectionLabelForView(activeEditorSection) }}
            </span>
          </div>
          <button
            @click="handleFocusNextIncompleteSection"
            class="h-9 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            下一待补分区
          </button>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <button
            v-for="item in editorSectionCompletionItems"
            :key="`editor-section-nav-${item.section}`"
            @click="handleFocusEditorSection(item.section)"
            class="rounded border px-2.5 py-2 text-left transition-colors"
            :class="[
              isActiveEditorSectionForView(item.section)
                ? 'border-sky-300 bg-sky-50/80 ring-1 ring-sky-200'
                :
              item.status === 'complete'
                ? 'border-emerald-200 bg-emerald-50/60'
                : item.requiredMissingLabels.length > 0
                  ? 'border-amber-200 bg-amber-50/60'
                  : 'border-slate-200 bg-slate-50/60',
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-medium text-slate-700">{{ item.label }}</p>
                <span
                  v-if="isActiveEditorSectionForView(item.section)"
                  class="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700"
                >
                当前
              </span>
            </div>
            <p class="mt-1 text-[11px] text-slate-500">{{ item.filledCount }}/{{ item.totalCount }}</p>
            <p
              class="mt-1 text-[10px] font-medium"
              :class="item.status === 'complete' ? 'text-emerald-700' : item.requiredMissingLabels.length > 0 ? 'text-amber-700' : 'text-slate-500'"
            >
              {{
                item.status === 'complete'
                  ? '已完成'
                  : item.requiredMissingLabels.length > 0
                    ? '缺必填'
                    : '待完善'
              }}
            </p>
          </button>
        </div>
      </section>

      <div
        v-if="showProgressAssistantDialog"
        class="fixed inset-0 z-40 bg-slate-900/45 p-4 overflow-y-auto"
        @click.self="showProgressAssistantDialog = false"
      >
        <div class="mx-auto mt-6 max-w-3xl rounded border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xl font-semibold text-slate-900">编写进度</p>
              <p class="mt-1 text-base text-slate-500">实时查看完成度、质量建议与导出前预检结果</p>
            </div>
            <button
              @click="showProgressAssistantDialog = false"
              class="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              title="关闭"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all"
              :style="{ width: `${editorCompletionSummary.score}%` }"
            />
          </div>
          <p class="mt-3 text-base text-slate-600">
            已完成 {{ editorCompletionSummary.filledCount }} / {{ editorCompletionSummary.totalCount }} 项
          </p>
          <p
            v-if="editorCompletionSummary.missingLabels.length > 0"
            class="mt-1 text-base text-amber-700"
          >
            待补充：{{ editorCompletionSummary.missingLabels.slice(0, 4).join('、') }}
            <span v-if="editorCompletionSummary.missingLabels.length > 4">
              等 {{ editorCompletionSummary.missingLabels.length }} 项
            </span>
          </p>

          <div
            v-if="editorQualityTips.length > 0"
            class="mt-4 rounded border border-amber-200 bg-amber-50 p-4"
          >
            <p class="text-base font-medium text-amber-700">质量建议</p>
            <ul class="mt-1.5 space-y-1">
              <li
                v-for="tip in editorQualityTips"
                :key="tip.message"
                class="text-base"
                :class="tip.level === 'warning' ? 'text-amber-700' : 'text-slate-600'"
              >
                {{ tip.message }}
              </li>
            </ul>
          </div>

          <div class="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-2">
              <p class="text-base font-medium text-slate-700">导出前预检</p>
              <span
                class="text-base font-medium"
                :class="editorExportPrecheck.passed ? 'text-emerald-700' : 'text-red-600'"
              >
                {{ editorExportPrecheck.passed ? '通过' : '未通过' }}
              </span>
            </div>
            <p v-if="editorExportPrecheck.blockingIssues.length === 0" class="mt-1 text-base text-emerald-700">
              未发现阻塞项，可直接导出。
            </p>
            <ul
              v-else
              class="mt-1.5 space-y-1"
            >
              <li
                v-for="issue in editorExportPrecheck.blockingIssues"
                :key="issue"
                class="text-base text-red-600"
              >
                {{ issue }}
              </li>
            </ul>
            <ul
              v-if="editorExportPrecheck.warningIssues.length > 0"
              class="mt-1.5 space-y-1"
            >
              <li
                v-for="warning in editorExportPrecheck.warningIssues.slice(0, 2)"
                :key="warning"
                class="text-base text-amber-700"
              >
                {{ warning }}
              </li>
            </ul>
            <div
              v-if="editorExportPrecheckFixActions.length > 0"
              class="mt-3 flex flex-wrap gap-2"
            >
              <button
                v-for="action in editorExportPrecheckFixActions.slice(0, 3)"
                :key="`precheck-fix-${action.key}`"
                @click="handleApplyExportPrecheckFix(action)"
                class="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
              >
                一键修复：{{ action.label }}
              </button>
              <button
                @click="handleApplyAllExportPrecheckFixes"
                class="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                全部修复
              </button>
            </div>
            <div
              v-if="editorExportPrecheck.focusSections.length > 0"
              class="mt-3 flex flex-wrap gap-2"
            >
              <button
                v-for="section in editorExportPrecheck.focusSections"
                :key="`focus-${section}`"
                @click="handleFocusEditorSection(section)"
                class="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                定位到{{ resolveEditorSectionLabelForView(section) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showShortcutDialog"
        class="fixed inset-0 z-40 bg-slate-900/45 p-4 overflow-y-auto"
        @click.self="showShortcutDialog = false"
      >
        <div class="mx-auto mt-8 max-w-lg rounded border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">常用快捷键</p>
              <p class="mt-1 text-sm text-slate-500">提升教案编辑效率，支持 Windows 与 macOS。</p>
            </div>
            <button
              @click="showShortcutDialog = false"
              class="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              title="关闭"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            v-if="hasShortcutConflicts"
            class="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            <p class="font-medium">检测到快捷键冲突</p>
            <ul class="mt-1 space-y-0.5">
              <li v-for="group in shortcutConflictGroups" :key="`shortcut-conflict-${group.signature}`">
                {{ formatShortcutSignature(group.signature) }} 被
                {{ group.actions.map((action) => resolveShortcutActionLabel(action)).join('、') }} 同时使用
              </li>
            </ul>
          </div>

          <div class="mt-4 space-y-3 text-sm text-slate-700">
            <section class="rounded border border-amber-200 bg-amber-50/60 p-2">
              <p class="px-1 text-xs font-semibold tracking-wide text-amber-700">标签切换（固定）</p>
              <p class="px-1 pt-0.5 text-[11px] text-amber-700/80">
                该组快捷键不可自定义，用于快速切换主编辑标签分区。
              </p>
              <ul class="mt-2 space-y-1 px-1 text-xs text-amber-800">
                <li
                  v-for="item in EDITOR_LAYOUT_SHORTCUT_HINTS"
                  :key="`layout-shortcut-hint-${item.key}`"
                >
                  Alt / Option + {{ item.key }}：{{ item.label }}
                </li>
              </ul>
            </section>
            <section
              v-for="section in shortcutActionSections"
              :key="`shortcut-section-${section.id}`"
              class="rounded border border-slate-200 bg-slate-50/50 p-2"
            >
              <p class="px-1 text-xs font-semibold tracking-wide text-slate-500">
                {{ section.label }}
              </p>
              <p class="px-1 pt-0.5 text-[11px] text-slate-500">
                {{ section.description }}
              </p>
              <div class="mt-2 space-y-2">
                <div
                  v-for="action in section.actions"
                  :key="`shortcut-action-${action.id}`"
                  class="rounded border bg-slate-50 px-3 py-2"
                  :class="isShortcutActionConflicted(action.id) ? 'border-red-200 bg-red-50/60' : 'border-slate-200'"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate">{{ action.label }}</p>
                      <p class="mt-0.5 text-[11px] text-slate-500">{{ action.hint }}</p>
                    </div>
                    <code class="rounded-sm border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600">
                      {{ formatShortcutDisplay(shortcutDraftConfig[action.id]) }}
                    </code>
                  </div>
                  <div class="mt-2 grid grid-cols-[1fr_auto] gap-2">
                    <select
                      v-model="shortcutDraftConfig[action.id].key"
                      class="h-9 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:border-[#647269] focus:outline-none focus:ring-2 focus:ring-[#647269]/20"
                    >
                      <option v-for="key in SHORTCUT_KEY_OPTIONS" :key="`shortcut-key-${action.id}-${key}`" :value="key">
                        {{ key }}
                      </option>
                    </select>
                    <label class="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 text-xs text-slate-600">
                      <input
                        v-model="shortcutDraftConfig[action.id].shift"
                        type="checkbox"
                        class="h-3.5 w-3.5 rounded border-slate-300 text-[#647269] focus:ring-[#647269]"
                      />
                      Shift
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              @click="handleResetShortcutDraftToDefault"
              class="h-9 rounded border border-slate-300 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
            >
              恢复默认
            </button>
            <button
              @click="handleSaveShortcutConfig"
              :disabled="hasShortcutConflicts"
              class="h-9 rounded bg-[#647269] px-3 text-sm text-white disabled:opacity-50"
            >
              保存配置
            </button>
          </div>

          <p v-if="shortcutConfigMessage" class="mt-2 text-xs text-[#435549]">
            {{ shortcutConfigMessage }}
          </p>
        </div>
      </div>

      <div
        v-if="showOutlineDialog"
        class="fixed inset-0 z-40 bg-slate-900/45 p-4 overflow-y-auto"
        @click.self="showOutlineDialog = false"
      >
        <div class="mx-auto mt-8 max-w-md rounded border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">章节大纲</p>
              <p class="mt-1 text-sm text-slate-500">点击可快速定位到对应编辑分区。</p>
            </div>
            <button
              @click="showOutlineDialog = false"
              class="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              title="关闭"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mt-4 space-y-2">
            <button
              v-for="item in editorOutlineItems"
              :key="`outline-${item.section}`"
              @click="handleFocusOutlineSection(item.section)"
              class="flex w-full items-center justify-between rounded border px-3 py-2 text-left transition-colors"
              :class="isActiveEditorSectionForView(item.section)
                ? 'border-sky-300 bg-sky-50/80 ring-1 ring-sky-200'
                : item.status === 'complete'
                ? 'border-emerald-200 bg-emerald-50/60'
                : item.requiredMissingCount > 0
                  ? 'border-amber-200 bg-amber-50/60'
                  : 'border-slate-200 bg-slate-50/60'"
            >
              <span class="text-sm font-medium text-slate-700">
                {{ item.label }}
                <span
                  v-if="isActiveEditorSectionForView(item.section)"
                  class="ml-1 inline-flex items-center rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700"
                >
                  当前
                </span>
              </span>
              <span class="text-xs font-medium text-slate-500">
                {{ item.progress }}%
                <span v-if="item.requiredMissingCount > 0" class="text-amber-700"> · 缺{{ item.requiredMissingCount }}项</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showTimelineApplyPreviewDialog"
        class="fixed inset-0 z-40 bg-slate-900/45 p-4 overflow-y-auto"
        @click.self="showTimelineApplyPreviewDialog = false"
      >
        <div class="mx-auto mt-8 max-w-2xl rounded border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">时间轴应用预览</p>
              <p class="mt-1 text-sm text-slate-500">
                {{ timelineApplyPreview.mode === 'replace' ? '将替换当前教学过程正文' : '将追加到当前教学过程末尾' }}
              </p>
            </div>
            <button
              @click="showTimelineApplyPreviewDialog = false"
              class="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              title="关闭"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div class="rounded border border-slate-200 bg-slate-50 p-2">
              <p class="text-[11px] text-slate-500">有效环节</p>
              <p class="text-sm font-semibold text-slate-800">{{ timelineApplyPreview.stepCount }}</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 p-2">
              <p class="text-[11px] text-slate-500">草案分钟</p>
              <p class="text-sm font-semibold text-slate-800">{{ timelineApplyPreview.minuteTotal }}</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 p-2">
              <p class="text-[11px] text-slate-500">当前文本长度</p>
              <p class="text-sm font-semibold text-slate-800">{{ timelineApplyPreview.currentTextLength }}</p>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 p-2">
              <p class="text-[11px] text-slate-500">应用后文本长度</p>
              <p class="text-sm font-semibold text-slate-800">{{ timelineApplyPreview.nextTextLength }}</p>
            </div>
          </div>

          <div class="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-medium text-slate-600">差异高亮（替换前后）</p>
              <span class="text-[11px] text-slate-500">变更行 {{ timelineApplyPreviewDiff.changedCount }}</span>
            </div>
            <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div class="rounded border border-slate-200 bg-white p-2">
                <p class="text-[11px] font-medium text-slate-500">替换前</p>
                <div class="mt-1 max-h-40 overflow-auto space-y-1">
                  <p
                    v-for="item in timelineApplyPreviewDiff.before"
                    :key="item.key"
                    class="rounded px-1.5 py-1 text-xs break-words"
                    :class="item.changed ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'"
                  >
                    {{ item.text }}
                  </p>
                  <p v-if="timelineApplyPreviewDiff.before.length === 0" class="text-xs text-slate-400">无内容</p>
                </div>
              </div>
              <div class="rounded border border-slate-200 bg-white p-2">
                <p class="text-[11px] font-medium text-slate-500">替换后</p>
                <div class="mt-1 max-h-40 overflow-auto space-y-1">
                  <p
                    v-for="item in timelineApplyPreviewDiff.after"
                    :key="item.key"
                    class="rounded px-1.5 py-1 text-xs break-words"
                    :class="item.changed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'"
                  >
                    {{ item.text }}
                  </p>
                  <p v-if="timelineApplyPreviewDiff.after.length === 0" class="text-xs text-slate-400">无内容</p>
                </div>
              </div>
            </div>
            <p class="mt-2 text-xs text-slate-500 break-words">
              预览片段：{{ timelineApplyPreview.nextProcessPreviewText || '暂无可预览内容' }}
            </p>
          </div>

          <div class="mt-4 flex flex-wrap justify-end gap-2">
            <button
              @click="showTimelineApplyPreviewDialog = false"
              class="h-9 rounded border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="handleConfirmProcessTimelineApplyPreview"
              :disabled="!timelineApplyPreview.canApply"
              class="h-9 rounded bg-[#647269] px-4 text-sm text-white disabled:opacity-50"
            >
              确认应用
            </button>
          </div>
        </div>
      </div>

      <div
        class="editor-layout-shell grid grid-cols-1 gap-4 lg:gap-6"
        :class="shouldRenderTemplatePanel ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1 lg:justify-items-center'"
      >
      <aside
        v-if="shouldRenderTemplatePanel"
        aria-label="模板工作台"
        class="editor-template-panel bg-white rounded shadow-sm border border-slate-100 p-4 sm:p-6 lg:sticky lg:top-24"
      >
        <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-1">模板工作台</h2>
        <p class="text-xs text-slate-500 mb-4">可检索、套用与维护个人模板</p>
        <div class="mb-4 rounded border border-slate-200 bg-slate-50 p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-semibold text-slate-700">当前编写分区</p>
            <span class="inline-flex items-center rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700">
              {{ resolveEditorSectionLabelForView(activeEditorSection) }}
            </span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-1.5">
            <button
              v-for="item in editorSectionCompletionItems"
              :key="`template-outline-${item.section}`"
              @click="handleFocusEditorSection(item.section)"
              class="rounded border px-2 py-1.5 text-left text-[11px] transition-colors"
              :class="isActiveEditorSectionForView(item.section)
                ? 'border-sky-300 bg-sky-50 text-sky-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">模板检索</label>
            <div class="flex gap-2">
              <input
                v-model="templateSearch"
                type="text"
                placeholder="输入模板标题关键词"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
              <button
                @click="handleSearchTemplates"
                class="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
              >
                查询
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">另存为模板</label>
            <div class="flex gap-2">
              <input
                v-model="templateTitle"
                type="text"
                placeholder="默认使用当前教案标题"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
              <button
                @click="handleSaveAsTemplate"
                :disabled="templateStore.isSaving"
                class="px-3 py-2 text-sm text-white bg-[#647269] rounded hover:bg-[#55645b] disabled:opacity-50"
              >
                保存模板
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="tag in PRESET_TEMPLATE_TAGS"
                :key="`create-${tag}`"
                @click="handleAddCreateTag(tag)"
                class="px-2 py-1 text-xs text-slate-700 bg-slate-100 rounded-sm hover:bg-slate-200"
              >
                +{{ tag }}
              </button>
            </div>
            <div class="mt-2 flex gap-2">
              <input
                v-model="templateTagInput"
                type="text"
                placeholder="自定义标签（回车添加）"
                @keydown.enter.prevent="handleAddCreateTag(templateTagInput)"
                class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
              <button
                @click="handleAddCreateTag(templateTagInput)"
                class="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
              >
                添加
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in templateDraftTags"
                :key="`draft-${tag}`"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#eef3f0] text-[#435549] rounded-sm"
              >
                {{ tag }}
                <button @click="handleRemoveCreateTag(tag)">×</button>
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-slate-700 mb-2">选择模板并覆盖当前教案</label>
          <div class="flex flex-col gap-2">
            <select
              v-model="selectedTemplateId"
              class="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
            >
              <option value="">请选择模板</option>
              <option v-for="item in templateStore.templates" :key="item.id" :value="item.id">
                {{ item.title }}（{{ item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('zh-CN') : '新建' }}）
              </option>
            </select>
            <button
              @click="handleApplyTemplate"
              class="px-4 py-2 text-sm text-white bg-emerald-600 rounded hover:bg-emerald-700"
            >
              套用并覆盖
            </button>
            <button
              @click="handleOpenTemplateEditor"
              class="px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
            >
              编辑模板
            </button>
            <button
              @click="handleDeleteTemplate"
              class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              删除模板
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              @click="handleSelectTagFilter('')"
              :class="[
                'px-2 py-1 text-xs rounded-sm border',
                selectedTagFilter ? 'text-slate-700 border-slate-300' : 'text-[#435549] border-[#c9d6cf] bg-[#eef3f0]',
              ]"
            >
              全部
            </button>
            <button
              v-for="tag in PRESET_TEMPLATE_TAGS"
              :key="`filter-${tag}`"
              @click="handleSelectTagFilter(tag)"
              :class="[
                'px-2 py-1 text-xs rounded-sm border',
                selectedTagFilter === tag
                  ? 'text-[#435549] border-[#c9d6cf] bg-[#eef3f0]'
                  : 'text-slate-700 border-slate-300',
              ]"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </aside>

      <div
        v-if="showTemplateEditDialog"
        class="fixed inset-0 z-40 bg-slate-900/50 p-4 overflow-y-auto"
      >
        <div class="max-w-4xl mx-auto bg-white rounded shadow-lg border border-slate-200 p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800">编辑模板</h3>
            <button
              @click="handleCancelTemplateEdit"
              class="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
            >
              关闭
            </button>
          </div>

          <TemplateEditTabs
            :tabs="templateEditTabs"
            :active-tab="templateEditActiveTab"
            @select="handleSelectTemplateEditTab"
          />
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              @click="handleFocusNextIncompleteTemplateEditTab"
              class="h-8 rounded border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50"
            >
              下一待完善标签
              <span v-if="nextIncompleteTemplateEditTab">（{{ nextIncompleteTemplateEditTab.label }}）</span>
            </button>
          </div>

          <div v-show="templateEditActiveTab === 'basic'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">模板标题</label>
              <input
                v-model="templateEditTitle"
                type="text"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">课程名称</label>
              <input
                v-model="templateEditForm.courseName"
                type="text"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">授课班级</label>
              <input
                v-model="templateEditForm.className"
                type="text"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">课时长度（分钟）</label>
              <input
                v-model.number="templateEditForm.duration"
                type="number"
                min="1"
                max="300"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学方法</label>
              <input
                v-model="templateEditForm.methods"
                type="text"
                placeholder="例如：讲授法、案例教学"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">教学资源</label>
              <input
                v-model="templateEditForm.resources"
                type="text"
                placeholder="例如：PPT、视频、实验设备"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">模板标签</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in PRESET_TEMPLATE_TAGS"
                  :key="`edit-${tag}`"
                  @click="handleAddEditTag(tag)"
                  class="px-2 py-1 text-xs text-slate-700 bg-slate-100 rounded-sm hover:bg-slate-200"
                >
                  +{{ tag }}
                </button>
              </div>
              <div class="mt-2 flex gap-2">
                <input
                  v-model="templateEditTagInput"
                  type="text"
                  placeholder="自定义标签（回车添加）"
                  @keydown.enter.prevent="handleAddEditTag(templateEditTagInput)"
                  class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269] transition-colors"
                />
                <button
                  @click="handleAddEditTag(templateEditTagInput)"
                  class="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
                >
                  添加
                </button>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="tag in templateEditTags"
                  :key="`edit-chip-${tag}`"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#eef3f0] text-[#435549] rounded-sm"
                >
                  {{ tag }}
                  <button @click="handleRemoveEditTag(tag)">×</button>
                </span>
              </div>
            </div>
          </div>

          <div v-show="templateEditActiveTab === 'design'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学目标</label>
              <TipTapEditor
                v-model="templateEditForm.objectives"
                v-model:modelJson="templateEditForm.contentJson.objectives"
                :shortcut-config="tiptapShortcutConfig"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">重点难点</label>
              <TipTapEditor
                v-model="templateEditForm.keyPoints"
                v-model:modelJson="templateEditForm.contentJson.keyPoints"
                :shortcut-config="tiptapShortcutConfig"
              />
            </div>
          </div>

          <div v-show="templateEditActiveTab === 'process'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学过程</label>
              <TipTapEditor
                v-model="templateEditForm.process"
                v-model:modelJson="templateEditForm.contentJson.process"
                :shortcut-config="tiptapShortcutConfig"
              />
            </div>
          </div>

          <div v-show="templateEditActiveTab === 'review'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">板书设计</label>
              <TipTapEditor
                v-model="templateEditForm.blackboard"
                v-model:modelJson="templateEditForm.contentJson.blackboard"
                :shortcut-config="tiptapShortcutConfig"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学反思</label>
              <TipTapEditor
                v-model="templateEditForm.reflection"
                v-model:modelJson="templateEditForm.contentJson.reflection"
                :shortcut-config="tiptapShortcutConfig"
              />
            </div>
          </div>

          <div class="mt-4 flex items-center justify-end gap-2">
            <button
              @click="handleCancelTemplateEdit"
              class="px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="handleSaveTemplateEdits"
              :disabled="templateStore.isSaving"
              class="px-4 py-2 text-sm text-white bg-[#647269] rounded hover:bg-[#55645b] disabled:opacity-50"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>

      <div
        class="min-w-0 space-y-4 sm:space-y-6"
        :class="shouldRenderTemplatePanel ? '' : 'w-full max-w-4xl'"
      >
      <EditorLayoutTabs
        :tabs="editorLayoutTabs"
        :active-tab="activeEditorLayoutTab"
        :active-label="resolveEditorLayoutTabLabelForView(activeEditorLayoutTab)"
        @select="handleSelectEditorLayoutTab"
      />
      <!-- Basic Info -->
      <section
        v-show="activeEditorLayoutTab === 'basic'"
        id="editor-section-basic"
        class="bg-white rounded shadow-sm border border-slate-100 p-4 sm:p-6"
      >
        <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#647269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          基本信息
        </h2>

        <div class="mb-4 rounded border border-[#dbe5df] bg-[#f7faf8] p-3">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-medium text-slate-700">快速骨架模板</p>
            <select
              :value="selectedLessonSkeletonPreset"
              @change="handleSelectLessonSkeletonPreset"
              class="h-8 rounded-sm border border-slate-300 bg-white px-2 text-xs text-slate-700"
            >
              <option
                v-for="option in lessonSkeletonOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.label }}
              </option>
            </select>
            <button
              @click="handleApplyLessonSkeleton('fill-empty')"
              class="h-8 rounded-sm border border-slate-300 bg-white px-2.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              仅填空
            </button>
            <button
              @click="handleApplyLessonSkeleton('overwrite')"
              class="h-8 rounded-sm border border-amber-300 bg-amber-50 px-2.5 text-xs text-amber-700 hover:bg-amber-100"
            >
              覆盖套用
            </button>
            <p class="text-[11px] text-slate-500">推荐：{{ recommendedLessonSkeletonLabel }}</p>
            <button
              @click="handleApplyRecommendedLessonSkeleton"
              class="h-8 rounded-sm border border-emerald-300 bg-emerald-50 px-2.5 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              使用推荐
            </button>
          </div>
          <p class="mt-1 text-[11px] text-slate-500">
            {{
              lessonSkeletonOptions.find((item) => item.id === selectedLessonSkeletonPreset)?.description ||
              ''
            }}
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div class="md:col-span-2">
            <BaseInput
              v-model="form.title"
              label="教案标题"
              placeholder="例如：Vue 3 基础入门"
              required
              size="md"
            />
          </div>
          
          <div>
            <BaseInput
              v-model="form.courseName"
              label="课程名称"
              placeholder="例如：前端开发技术"
              required
              size="md"
            />
          </div>
          
          <div>
            <BaseInput
              v-model="form.className"
              label="授课班级"
              placeholder="例如：计算机2301班"
              required
              size="md"
            />
          </div>
          
          <div>
            <BaseInput
              v-model="durationText"
              label="课时长度（分钟）"
              type="number"
              placeholder="90"
              :min="1"
              :max="300"
              required
              size="md"
            />
          </div>
          
          <div>
            <BaseInput
              v-model="form.methods"
              label="教学方法"
              placeholder="例如：讲授法、案例教学"
              size="md"
            />
          </div>

          <div>
            <BaseInput
              v-model="form.resources"
              label="教学资源"
              placeholder="例如：PPT、视频、实验设备"
              size="md"
            />
          </div>
        </div>
      </section>

      <section
        v-if="isLessonEditorMode"
        v-show="activeEditorLayoutTab === 'basic'"
        class="bg-white rounded shadow-sm border border-slate-100 p-4 sm:p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-base sm:text-lg font-semibold text-slate-800">单次课链路映证</h2>
          <button
            @click="handleRunLessonTraceabilityCheck"
            :disabled="isLessonTraceabilityChecking"
            class="h-9 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {{ isLessonTraceabilityChecking ? '校验中...' : '执行映证校验' }}
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2 rounded border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p class="text-sm font-medium text-slate-700">课堂教学教案头信息（No.x）</p>
            <div class="mt-3 grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded border border-slate-200 bg-white px-3 py-2">
                <p class="text-[11px] text-slate-500">授课教师</p>
                <p class="mt-1 font-medium text-slate-800">{{ lessonHeaderTeacherName || '未填写（来自教案册）' }}</p>
              </div>
              <div class="rounded border border-slate-200 bg-white px-3 py-2">
                <p class="text-[11px] text-slate-500">课程</p>
                <p class="mt-1 font-medium text-slate-800">{{ lessonHeaderCourseName || form.courseName || '未关联课程' }}</p>
              </div>
              <div class="rounded border border-slate-200 bg-white px-3 py-2">
                <p class="text-[11px] text-slate-500">课题</p>
                <p class="mt-1 font-medium text-slate-800">{{ form.title || '未填写' }}</p>
              </div>
              <div class="rounded border border-slate-200 bg-white px-3 py-2">
                <p class="text-[11px] text-slate-500">授课班级</p>
                <p class="mt-1 font-medium text-slate-800">{{ form.className || '未填写' }}</p>
              </div>
            </div>
          </div>
          <div>
            <BaseInput
              v-model="lessonContext.lessonType"
              label="课型"
              placeholder="例如：理论课/理实一体课"
              size="md"
            />
          </div>
          <div id="lesson-field-week-no">
            <BaseInput
              v-model="lessonWeekNoText"
              label="关联周次"
              type="number"
              placeholder="例如：1"
              size="md"
            />
          </div>
          <div>
            <BaseInput
              v-model="lessonContext.weekday"
              label="星期"
              placeholder="例如：星期三"
              size="md"
            />
          </div>
          <div>
            <BaseInput
              v-model="lessonContext.period"
              label="节次"
              placeholder="例如：第3-4节"
              size="md"
            />
          </div>
          <div>
            <BaseInput
              v-model="lessonContext.lessonDate"
              label="日期"
              type="date"
              size="md"
            />
          </div>
          <div id="lesson-field-ideology">
            <BaseInput
              v-model="lessonContext.ideologicalElements"
              label="课程思政元素"
              placeholder="例如：工匠精神、职业规范"
              size="md"
            />
          </div>
          <div id="lesson-field-integration">
            <BaseInput
              v-model="lessonContext.integrationMethod"
              label="融入方式"
              placeholder="例如：案例讨论、任务驱动"
              size="md"
            />
          </div>
          <div>
            <BaseInput
              v-model="lessonContext.difficulty"
              label="教学难点"
              placeholder="例如：概念迁移与综合应用"
              size="md"
            />
          </div>
          <div>
            <BaseInput
              v-model="lessonContext.teachingAids"
              label="方法与教具"
              placeholder="例如：任务驱动+PPT+实训平台"
              size="md"
            />
          </div>
          <div id="lesson-field-topic-refs" class="md:col-span-2 rounded border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm font-medium text-slate-700">课程标准条目引用</p>
              <p class="text-xs text-slate-500">
                已选 {{ lessonContext.courseStandardTopicRefs.length }} / {{ lessonTopicCandidates.length }}
              </p>
            </div>

            <div class="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                v-model="lessonTopicSearch"
                type="text"
                class="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                placeholder="搜索条目标题、模块或 ID"
              />
              <button
                type="button"
                @click="handleSelectAllFilteredLessonTopics"
                :disabled="filteredLessonTopicCandidates.length === 0"
                class="h-9 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                全选筛选结果
              </button>
              <button
                type="button"
                @click="handleClearAllLessonTopicRefs"
                :disabled="lessonContext.courseStandardTopicRefs.length === 0"
                class="h-9 rounded border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                清空已选
              </button>
            </div>

            <div class="mt-3 rounded border border-slate-200 bg-white p-2">
              <p v-if="isLessonTopicLoading" class="px-2 py-3 text-xs text-slate-500">正在加载授课计划条目...</p>
              <p v-else-if="!lessonContext.deliveryPlanId" class="px-2 py-3 text-xs text-slate-500">
                未绑定授课计划，暂无法加载候选条目。
              </p>
              <p v-else-if="filteredLessonTopicCandidates.length === 0" class="px-2 py-3 text-xs text-slate-500">
                未找到可选条目，请调整搜索条件或检查授课计划配置。
              </p>
              <div v-else class="max-h-52 space-y-1 overflow-y-auto pr-1">
                <label
                  v-for="item in filteredLessonTopicCandidates"
                  :key="`lesson-topic-candidate-${item.id}`"
                  class="flex cursor-pointer items-start gap-2 rounded border border-transparent px-2 py-1.5 hover:border-slate-200 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    class="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    :checked="lessonTopicRefSet.has(item.id)"
                    @change="handleToggleLessonTopicRef(item.id)"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-slate-700">{{ item.title }}</p>
                    <p class="mt-0.5 truncate text-xs text-slate-500">{{ item.moduleName }} · {{ item.id }}</p>
                  </div>
                  <span
                    v-if="currentWeekLinkedTopicSet.has(item.id)"
                    class="inline-flex shrink-0 items-center rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                  >
                    本周推荐
                  </span>
                </label>
              </div>
            </div>

            <p v-if="lessonContext.weekNo !== null" class="mt-2 text-xs text-slate-500">
              当前周次推荐条目数：{{ currentWeekLinkedTopicIds.length }}
            </p>

            <div
              v-if="orphanLessonTopicRefs.length > 0"
              class="mt-3 rounded border border-amber-200 bg-amber-50 p-2.5"
            >
              <p class="text-xs font-medium text-amber-700">存在未匹配条目（可能来自旧数据或模板变更）</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="topicId in orphanLessonTopicRefs"
                  :key="`lesson-topic-orphan-${topicId}`"
                  class="inline-flex items-center rounded border border-amber-300 bg-white px-1.5 py-0.5 font-mono text-[11px] text-amber-700"
                >
                  {{ topicId }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-500">授课计划 ID</p>
            <p class="mt-1 text-xs font-mono text-slate-700 break-all">{{ lessonContext.deliveryPlanId || '未关联' }}</p>
          </div>
          <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-500">周次记录 ID</p>
            <p class="mt-1 text-xs font-mono text-slate-700 break-all">{{ lessonContext.deliveryPlanWeekId || '未关联' }}</p>
          </div>
        </div>

        <div
          id="lesson-courseware-traceability"
          class="mt-4 rounded border border-slate-200 bg-slate-50 p-3 sm:p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-semibold text-slate-800">课件附件映证</p>
            <button
              type="button"
              @click="loadLessonCoursewareAssets"
              :disabled="isLessonCoursewareLoading"
              class="h-8 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isLessonCoursewareLoading ? '刷新中...' : '刷新列表' }}
            </button>
          </div>

          <p class="mt-2 text-xs text-slate-500">
            当前已关联 {{ lessonCoursewareAssets.length }} 个附件。建议为每个附件补充章节与思政标签，提升映证完整度。
          </p>
          <p
            v-if="editingLessonCoursewareAssetId"
            class="mt-2 rounded border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs text-sky-700"
          >
            正在编辑附件：{{ editingLessonCoursewareAssetId }}
          </p>

          <div class="mt-3 rounded border border-slate-200 bg-white p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs font-medium text-slate-700">
                已选择 {{ selectedLessonCoursewareAssetIds.length }} / {{ lessonCoursewareAssets.length }} 条附件
              </p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="handleToggleAllLessonCoursewareAssetSelection"
                  class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  {{ isAllLessonCoursewareSelected ? '取消全选' : '全选当前列表' }}
                </button>
                <button
                  type="button"
                  @click="handleClearLessonCoursewareAssetSelection"
                  :disabled="selectedLessonCoursewareAssetIds.length === 0"
                  class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  清空选择
                </button>
              </div>
            </div>

            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <BaseInput
                v-model="lessonCoursewareBatchForm.chapterRef"
                label="批量章节"
                placeholder="留空则不更新"
                size="sm"
              />
              <BaseInput
                v-model="lessonCoursewareBatchForm.tagsText"
                label="批量标签"
                placeholder="逗号分隔，留空则不更新"
                size="sm"
              />
              <BaseInput
                v-model="lessonCoursewareBatchForm.ideologicalElementsText"
                label="批量思政标签"
                placeholder="逗号分隔，留空则不更新"
                size="sm"
              />
            </div>

            <div class="mt-3 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                @click="resetLessonCoursewareBatchForm"
                class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                清空批量字段
              </button>
              <button
                type="button"
                @click="handleApplyLessonCoursewareBatchUpdate({ onlyMissing: false })"
                :disabled="isLessonCoursewareBatchUpdating"
                class="h-8 rounded border border-sky-300 bg-sky-50 px-2.5 text-xs font-medium text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ isLessonCoursewareBatchUpdating ? '处理中...' : '批量覆盖已选' }}
              </button>
              <button
                type="button"
                @click="handleApplyLessonCoursewareBatchUpdate({ onlyMissing: true })"
                :disabled="isLessonCoursewareBatchUpdating"
                class="h-8 rounded border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ isLessonCoursewareBatchUpdating ? '处理中...' : '批量补齐缺失' }}
              </button>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <BaseInput
              v-model="lessonCoursewareForm.title"
              label="附件标题"
              placeholder="例如：第 1 周教学课件"
              size="sm"
            />
            <BaseInput
              v-model="lessonCoursewareForm.fileName"
              label="文件名"
              placeholder="例如：week1.pptx"
              size="sm"
            />
            <BaseInput
              v-model="lessonCoursewareForm.fileUrl"
              label="文件地址"
              placeholder="例如：https://example.com/week1.pptx"
              size="sm"
            />
            <BaseInput
              v-model="lessonCoursewareForm.chapterRef"
              label="对应章节"
              placeholder="例如：模块一-主题1"
              size="sm"
            />
            <BaseInput
              v-model="lessonCoursewareForm.tagsText"
              label="标签"
              placeholder="逗号分隔，例如：PPT,示例代码"
              size="sm"
            />
            <BaseInput
              v-model="lessonCoursewareForm.ideologicalElementsText"
              label="思政标签"
              placeholder="逗号分隔，例如：工匠精神,团队协作"
              size="sm"
            />
          </div>

          <div class="mt-3 flex justify-end">
            <div class="flex items-center gap-2">
              <button
                v-if="editingLessonCoursewareAssetId"
                type="button"
                @click="handleCancelEditLessonCoursewareAsset"
                class="h-9 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                取消编辑
              </button>
              <button
                type="button"
                @click="handleCreateLessonCoursewareAsset"
                :disabled="isLessonCoursewareSubmitting"
                class="h-9 rounded bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{
                  isLessonCoursewareSubmitting
                    ? (editingLessonCoursewareAssetId ? '保存中...' : '添加中...')
                    : (editingLessonCoursewareAssetId ? '保存修改' : '添加课件附件')
                }}
              </button>
            </div>
          </div>

          <div class="mt-3 overflow-x-auto rounded border border-slate-200 bg-white">
            <table class="min-w-full text-xs text-slate-600 sm:text-sm">
              <thead class="bg-slate-50 text-slate-500">
                <tr>
                  <th class="px-3 py-2 text-left font-medium w-10">
                    <input
                      type="checkbox"
                      :checked="isAllLessonCoursewareSelected"
                      @change="handleToggleAllLessonCoursewareAssetSelection"
                      class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th class="px-3 py-2 text-left font-medium">标题</th>
                  <th class="px-3 py-2 text-left font-medium">文件</th>
                  <th class="px-3 py-2 text-left font-medium">章节</th>
                  <th class="px-3 py-2 text-left font-medium">完整性</th>
                  <th class="px-3 py-2 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="asset in lessonCoursewareAssets"
                  :key="`lesson-courseware-${asset.id}`"
                  class="border-t border-slate-100"
                >
                  <td class="px-3 py-2">
                    <input
                      type="checkbox"
                      :checked="selectedLessonCoursewareAssetIds.includes(asset.id)"
                      @change="handleToggleLessonCoursewareAssetSelection(asset.id)"
                      class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td class="px-3 py-2">{{ asset.title }}</td>
                  <td class="px-3 py-2">
                    <a
                      :href="asset.fileUrl"
                      target="_blank"
                      rel="noreferrer"
                      class="text-sky-700 hover:text-sky-800 hover:underline"
                    >
                      {{ asset.fileName }}
                    </a>
                  </td>
                  <td class="px-3 py-2">{{ asset.chapterRef || '未标注' }}</td>
                  <td class="px-3 py-2">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="field in resolveCoursewareMissingFields(asset)"
                        :key="`courseware-missing-${asset.id}-${field}`"
                        class="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                      >
                        缺{{ field }}
                      </span>
                      <span
                        v-if="resolveCoursewareMissingFields(asset).length === 0"
                        class="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700"
                      >
                        完整
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        v-if="resolveCoursewareMissingFields(asset).length > 0"
                        type="button"
                        @click="handleAutofillLessonCoursewareAsset(asset)"
                        :disabled="autofillingLessonCoursewareAssetId === asset.id"
                        class="h-7 rounded border border-amber-300 bg-amber-50 px-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {{ autofillingLessonCoursewareAssetId === asset.id ? '补齐中...' : '一键补齐' }}
                      </button>
                      <button
                        type="button"
                        @click="handleEditLessonCoursewareAsset(asset)"
                        class="h-7 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        @click="handleDeleteLessonCoursewareAsset(asset.id)"
                        :disabled="deletingLessonCoursewareAssetId === asset.id"
                        class="h-7 rounded border border-red-200 bg-red-50 px-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {{ deletingLessonCoursewareAssetId === asset.id ? '删除中...' : '删除' }}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!isLessonCoursewareLoading && lessonCoursewareAssets.length === 0">
                  <td colspan="6" class="px-3 py-5 text-center text-slate-400">暂无课件附件</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="lessonTraceabilityResult" class="mt-4 rounded border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-sm font-medium" :class="lessonTraceabilityResult.passed ? 'text-emerald-700' : 'text-red-600'">
            {{ lessonTraceabilityResult.passed ? '映证校验通过' : '映证校验未通过' }}
          </p>
          <div class="mt-2">
            <p class="text-xs font-semibold text-red-600">阻断项</p>
            <ul class="mt-1 list-disc pl-5 text-xs text-red-600 space-y-1">
              <li v-for="item in lessonTraceabilityResult.blockers" :key="`lesson-blocker-${item}`">{{ item }}</li>
              <li v-if="lessonTraceabilityResult.blockers.length === 0" class="text-slate-400">无阻断项</li>
            </ul>
          </div>
          <div class="mt-2">
            <p class="text-xs font-semibold text-amber-700">告警项</p>
            <div class="mt-2 space-y-2">
              <div
                v-for="group in lessonWarningGroups"
                :key="`lesson-warning-group-${group.key}`"
                class="rounded border border-amber-200 bg-amber-50 px-2.5 py-2"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-xs font-semibold text-amber-800">{{ group.label }}（{{ group.items.length }}）</p>
                  <div class="flex items-center gap-1.5">
                    <button
                      v-if="group.key === 'courseware'"
                      type="button"
                      @click="handleFocusLessonCoursewareSection"
                      class="h-7 rounded border border-amber-300 bg-white px-2 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
                    >
                      定位处理
                    </button>
                    <button
                      v-if="group.key === 'courseware' && lessonCoursewareAssets.length > 0"
                      type="button"
                      @click="handleAutofillAllMissingLessonCoursewareAssets"
                      class="h-7 rounded border border-amber-300 bg-white px-2 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
                    >
                      一键补齐全部缺失
                    </button>
                  </div>
                </div>
                <ul class="mt-1 space-y-1 text-xs text-amber-700">
                  <li
                    v-for="item in group.items"
                    :key="`lesson-warning-${group.key}-${item}`"
                    class="flex items-start justify-between gap-2 rounded border border-amber-100 bg-white/70 px-2 py-1"
                  >
                    <span class="leading-5">{{ item }}</span>
                    <button
                      type="button"
                      @click="handleResolveLessonWarning(item)"
                      class="shrink-0 h-6 rounded border border-amber-300 bg-white px-2 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
                    >
                      去处理
                    </button>
                  </li>
                </ul>
              </div>
              <p v-if="lessonWarningGroups.length === 0" class="text-xs text-slate-400">无告警项</p>
            </div>
            <div
              v-if="lessonWarningFixChecklist.length > 0"
              class="mt-2 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-2"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-xs font-semibold text-emerald-700">发布前修复建议</p>
                <button
                  v-if="lessonWarningHasCoursewareAutofix && lessonCoursewareAssets.length > 0"
                  type="button"
                  @click="handleApplyLessonWarningAutofix"
                  class="h-7 rounded border border-emerald-300 bg-white px-2 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  一键执行可自动项
                </button>
              </div>
              <ul class="mt-1 list-disc pl-4 text-xs text-emerald-700 space-y-1">
                <li
                  v-for="item in lessonWarningFixChecklist"
                  :key="`lesson-warning-fix-${item}`"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Teaching Objectives -->
      <section
        v-show="activeEditorLayoutTab === 'design'"
        id="editor-section-objectives"
        class="bg-white rounded shadow-sm border border-slate-100 p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ isLessonEditorMode ? '教学目的和要求' : '教学目标' }}
          </h2>
          <button
            @click="handleToggleEditorSectionCollapsed('objectives')"
            class="inline-flex h-8 items-center gap-1 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            :aria-expanded="(!isEditorSectionCollapsedForView('objectives')).toString()"
            aria-controls="editor-section-content-objectives"
          >
            {{ isEditorSectionCollapsedForView('objectives') ? '展开' : '收起' }}
          </button>
        </div>
        <p v-if="isEditorSectionCollapsedForView('objectives')" class="mt-3 text-xs text-slate-500">
          已收起，点击“展开”继续编辑。
        </p>
        <div
          id="editor-section-content-objectives"
          v-show="!isEditorSectionCollapsedForView('objectives')"
          class="mt-4"
        >
          <TipTapEditor
            v-model="form.objectives"
            v-model:modelJson="form.contentJson.objectives"
            :shortcut-config="tiptapShortcutConfig"
          />
        </div>
      </section>

      <!-- Key Points -->
      <section
        v-show="activeEditorLayoutTab === 'design'"
        id="editor-section-keypoints"
        class="bg-white rounded shadow-sm border border-slate-100 p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {{ isLessonEditorMode ? '教学重点与难点' : '重点难点' }}
          </h2>
          <button
            @click="handleToggleEditorSectionCollapsed('keyPoints')"
            class="inline-flex h-8 items-center gap-1 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            :aria-expanded="(!isEditorSectionCollapsedForView('keyPoints')).toString()"
            aria-controls="editor-section-content-keypoints"
          >
            {{ isEditorSectionCollapsedForView('keyPoints') ? '展开' : '收起' }}
          </button>
        </div>
        <p v-if="isEditorSectionCollapsedForView('keyPoints')" class="mt-3 text-xs text-slate-500">
          已收起，点击“展开”继续编辑。
        </p>
        <div
          id="editor-section-content-keypoints"
          v-show="!isEditorSectionCollapsedForView('keyPoints')"
          class="mt-4"
        >
          <TipTapEditor
            v-model="form.keyPoints"
            v-model:modelJson="form.contentJson.keyPoints"
            :shortcut-config="tiptapShortcutConfig"
          />
        </div>
      </section>

      <!-- Teaching Process -->
      <section
        v-show="activeEditorLayoutTab === 'process'"
        id="editor-section-process"
        class="bg-white rounded shadow-sm border border-slate-100 p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ isLessonEditorMode ? '授课提纲' : '教学过程' }}
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-if="processMinutesTotal > 0"
              class="inline-flex h-8 items-center rounded border px-2.5 text-xs font-medium"
              :class="hasProcessDurationMismatch ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'"
            >
              环节分钟 {{ processMinutesTotal }} / 课时 {{ form.duration }}
            </span>
            <button
              v-if="hasProcessDurationMismatch"
              @click="handleAlignDurationWithProcessMinutes"
              class="inline-flex h-8 items-center rounded border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              对齐课时
            </button>
            <button
              @click="handleToggleEditorSectionCollapsed('process')"
              class="inline-flex h-8 items-center gap-1 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              :aria-expanded="(!isEditorSectionCollapsedForView('process')).toString()"
              aria-controls="editor-section-content-process"
            >
              {{ isEditorSectionCollapsedForView('process') ? '展开' : '收起' }}
            </button>
          </div>
        </div>
        <div class="mt-3 rounded border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-slate-600">结构化时间轴</span>
            <span class="text-[11px] text-slate-500">拖拽排序</span>
            <span
              v-if="!canUseTimelineDrag"
              class="text-[11px] font-medium text-amber-700"
            >
              当前设备建议使用上移/下移
            </span>
            <select
              :value="selectedProcessTimelinePreset"
              @change="handleSelectProcessTimelinePreset"
              class="h-8 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
            >
              <option
                v-for="option in processTimelineOptions"
                :key="`process-timeline-${option.id}`"
                :value="option.id"
              >
                {{ option.label }}
              </option>
            </select>
            <button
              @click="handleResetProcessTimelineDraft"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              生成草案
            </button>
            <button
              @click="handleUndoProcessTimelineDraft"
              :disabled="!canUndoProcessTimelineDraft"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              撤销草案
            </button>
            <button
              @click="handleRedoProcessTimelineDraft"
              :disabled="!canRedoProcessTimelineDraft"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              重做草案
            </button>
            <button
              @click="handleToggleAllProcessTimelineDraftStepCollapsed"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {{ isAllProcessTimelineDraftStepsCollapsed ? '全部展开' : '全部收起' }}
            </button>
            <button
              @click="handleToggleAllProcessTimelineDraftStepSelected"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {{ isAllProcessTimelineDraftStepsSelected ? '清空选择' : '全选' }}
            </button>
          </div>
          <p class="mt-1 text-[11px] text-slate-500">
            {{ processTimelineOptions.find((item) => item.id === selectedProcessTimelinePreset)?.description }}
          </p>
          <p class="mt-1 text-[11px] text-slate-500">
            已选 {{ selectedProcessTimelineDraftStepCount }} 项
          </p>
          <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              v-for="(step, index) in processTimelineDraftSteps"
              :key="step.id"
              :draggable="canUseTimelineDrag"
              @dragstart="canUseTimelineDrag && handleStartProcessTimelineDraftDrag(step.id, $event)"
              @dragover.prevent="canUseTimelineDrag && handleDragOverProcessTimelineDraftStep(step.id)"
              @drop.prevent="canUseTimelineDrag && handleDropProcessTimelineDraftStep(step.id, $event)"
              @dragend="canUseTimelineDrag && handleEndProcessTimelineDraftDrag()"
              class="rounded border bg-white p-2 transition-colors"
              :class="[
                canUseTimelineDrag ? 'cursor-grab active:cursor-grabbing' : '',
                dragOverProcessTimelineDraftStepId === step.id && draggingProcessTimelineDraftStepId !== step.id
                  ? 'border-sky-300 bg-sky-50/70'
                  : 'border-slate-200',
              ]"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <input
                    :checked="isProcessTimelineDraftStepSelected(step.id)"
                    @change="handleToggleProcessTimelineDraftStepSelected(step.id)"
                    type="checkbox"
                    class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                  />
                  <p class="text-[11px] font-medium text-slate-600">环节 {{ index + 1 }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    @click="handleToggleProcessTimelineDraftStepCollapsed(step.id)"
                    class="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                    :title="isProcessTimelineDraftStepCollapsed(step.id) ? '展开' : '收起'"
                  >
                    {{ isProcessTimelineDraftStepCollapsed(step.id) ? '展开' : '收起' }}
                  </button>
                  <button
                    @click="handleMoveProcessTimelineDraftStep(step.id, 'up')"
                    :disabled="index === 0"
                    class="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    title="上移"
                  >
                    上移
                  </button>
                  <button
                    @click="handleMoveProcessTimelineDraftStep(step.id, 'down')"
                    :disabled="index === processTimelineDraftSteps.length - 1"
                    class="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    title="下移"
                  >
                    下移
                  </button>
                  <button
                    @click="handleRemoveProcessTimelineDraftStep(step.id)"
                    :disabled="processTimelineDraftSteps.length <= 1"
                    class="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
              <p
                v-if="isProcessTimelineDraftStepCollapsed(step.id)"
                class="mt-1 truncate text-[11px] text-slate-500"
              >
                {{ step.label || `环节${index + 1}` }} · {{ Math.max(0, Math.round(step.minutes || 0)) }}分钟
              </p>
              <div v-show="!isProcessTimelineDraftStepCollapsed(step.id)">
                <input
                  v-model="step.label"
                  type="text"
                  class="mt-1 h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
                />
                <div class="mt-1 flex items-center gap-1">
                  <input
                    v-model.number="step.minutes"
                    type="number"
                    min="0"
                    step="1"
                    class="h-8 w-20 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
                  />
                  <span class="text-xs text-slate-500">分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <button
              @click="handleAddProcessTimelineDraftStep"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              新增环节
            </button>
            <button
              @click="handleApplyProcessTimelineDraft('replace')"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              应用替换
            </button>
            <button
              @click="handleOpenProcessTimelineApplyPreview('replace')"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              预览替换
            </button>
            <button
              @click="handleApplyProcessTimelineDraft('append')"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              应用追加
            </button>
            <button
              @click="handleOpenProcessTimelineApplyPreview('append')"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              预览追加
            </button>
            <button
              @click="handleGenerateProcessTimeline('replace')"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              一键生成替换
            </button>
            <button
              @click="handleRemoveSelectedProcessTimelineDraftSteps"
              :disabled="selectedProcessTimelineDraftStepCount === 0 || selectedProcessTimelineDraftStepCount >= processTimelineDraftSteps.length"
              class="h-8 rounded border border-rose-300 bg-rose-50 px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              批量删除选中
            </button>
            <button
              @click="handleRedistributeSelectedProcessTimelineDraftStepMinutes"
              :disabled="selectedProcessTimelineDraftStepCount < 2"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              选中等分总分钟
            </button>
            <button
              @click="handleAlignSelectedProcessTimelineDraftMinutesWithDuration"
              :disabled="selectedProcessTimelineDraftStepCount < 1"
              class="h-8 rounded border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
            >
              选中对齐课时
            </button>
            <button
              @click="handleAdjustSelectedProcessTimelineDraftStepMinutes(5)"
              :disabled="selectedProcessTimelineDraftStepCount < 1"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              选中+5分钟
            </button>
            <button
              @click="handleAdjustSelectedProcessTimelineDraftStepMinutes(-5)"
              :disabled="selectedProcessTimelineDraftStepCount < 1"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              选中-5分钟
            </button>
            <button
              @click="handleAutofillSelectedProcessTimelineDraftStepLabels"
              class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              补全空标签
            </button>
            <button
              v-if="hasProcessTimelineDraftMismatch"
              @click="handleAlignProcessTimelineDraftMinutes"
              class="h-8 rounded border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              草案对齐课时
            </button>
          </div>
          <p class="mt-1 text-[11px]" :class="hasProcessTimelineDraftMismatch ? 'text-amber-700' : 'text-slate-500'">
            草案分钟合计 {{ processTimelineDraftMinutesTotal }} 分钟
            <span v-if="hasProcessTimelineDraftMismatch">
              ，与课时 {{ form.duration }} 分钟偏差 {{ Math.abs(processTimelineDraftDurationDelta) }} 分钟
            </span>
          </p>
        </div>
        <p v-if="isEditorSectionCollapsedForView('process')" class="mt-3 text-xs text-slate-500">
          已收起，点击“展开”继续编辑。
        </p>
        <div
          id="editor-section-content-process"
          v-show="!isEditorSectionCollapsedForView('process')"
          class="mt-4"
        >
          <TipTapEditor
            v-model="form.process"
            v-model:modelJson="form.contentJson.process"
            :shortcut-config="tiptapShortcutConfig"
          />
        </div>
      </section>

      <!-- Blackboard Design -->
      <section
        v-show="activeEditorLayoutTab === 'review'"
        id="editor-section-blackboard"
        class="bg-white rounded shadow-sm border border-slate-100 p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            板书设计
          </h2>
          <button
            @click="handleToggleEditorSectionCollapsed('blackboard')"
            class="inline-flex h-8 items-center gap-1 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            :aria-expanded="(!isEditorSectionCollapsedForView('blackboard')).toString()"
            aria-controls="editor-section-content-blackboard"
          >
            {{ isEditorSectionCollapsedForView('blackboard') ? '展开' : '收起' }}
          </button>
        </div>
        <p v-if="isEditorSectionCollapsedForView('blackboard')" class="mt-3 text-xs text-slate-500">
          已收起，点击“展开”继续编辑。
        </p>
        <div
          id="editor-section-content-blackboard"
          v-show="!isEditorSectionCollapsedForView('blackboard')"
          class="mt-4"
        >
          <TipTapEditor
            v-model="form.blackboard"
            v-model:modelJson="form.contentJson.blackboard"
            :shortcut-config="tiptapShortcutConfig"
          />
        </div>
      </section>

      <!-- Teaching Reflection -->
      <section
        v-show="activeEditorLayoutTab === 'review'"
        id="editor-section-reflection"
        class="bg-white rounded shadow-sm border border-slate-100 p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {{ isLessonEditorMode ? '课后小结' : '教学反思' }}
          </h2>
          <button
            @click="handleToggleEditorSectionCollapsed('reflection')"
            class="inline-flex h-8 items-center gap-1 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            :aria-expanded="(!isEditorSectionCollapsedForView('reflection')).toString()"
            aria-controls="editor-section-content-reflection"
          >
            {{ isEditorSectionCollapsedForView('reflection') ? '展开' : '收起' }}
          </button>
        </div>
        <p v-if="isEditorSectionCollapsedForView('reflection')" class="mt-3 text-xs text-slate-500">
          已收起，点击“展开”继续编辑。
        </p>
        <div
          id="editor-section-content-reflection"
          v-show="!isEditorSectionCollapsedForView('reflection')"
          class="mt-4"
        >
          <TipTapEditor
            v-model="form.reflection"
            v-model:modelJson="form.contentJson.reflection"
            :shortcut-config="tiptapShortcutConfig"
          />
        </div>
      </section>
      </div>
      </div>
    </main>

    <div class="mobile-quick-actions sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#d9e1dc] bg-white/95 backdrop-blur">
      <div class="max-w-6xl mx-auto px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] grid grid-cols-1 gap-2">
        <button
          @click="isFocusMode ? handleToggleFocusMode() : handleMobileToggleTemplatePanel()"
          class="h-10 rounded border text-sm font-medium transition-colors"
          :class="isFocusMode ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : showTemplatePanel ? 'border-[#647269] bg-[#eef4f0] text-[#1f3128]' : 'border-[#d1ddd5] bg-white text-[#435549]'"
        >
          {{ isFocusMode ? '退出专注' : '模板库' }}
        </button>
        <button
          @click="handleMobileSave"
          :disabled="isEditorSaving || !isFormValid"
          class="h-10 rounded bg-[#647269] text-white text-sm font-medium disabled:opacity-50"
        >
          {{ isEditorSaving ? '保存中...' : '保存草稿' }}
        </button>
        <button
          @click="showMobileActions = true"
          class="h-10 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
        >
          更多操作
        </button>
      </div>
    </div>

    <div
      v-if="showMobileActions"
      class="sm:hidden fixed inset-0 z-40 bg-slate-900/45"
      @click.self="closeMobileActions"
    >
      <div class="absolute bottom-0 inset-x-0 rounded-t bg-white border-t border-[#d9e1dc] px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div class="w-10 h-1.5 bg-[#d1ddd5] rounded-full mx-auto mb-3"></div>
        <p class="text-sm font-semibold text-[#33463c] mb-3">更多操作</p>
        <div class="space-y-2">
          <button
            @click="handleMobileToggleFocusMode"
            class="w-full h-11 rounded border text-sm font-medium"
            :class="isFocusMode ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-[#d1ddd5] bg-white text-[#435549]'"
          >
            {{ isFocusMode ? '退出专注模式' : '开启专注模式' }}
          </button>
          <button
            @click="handleMobileToggleTemplatePanel"
            :disabled="isFocusMode"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
            :class="isFocusMode ? 'cursor-not-allowed opacity-50' : ''"
          >
            {{ showTemplatePanel ? '收起模板库' : '打开模板库' }}
          </button>
          <button
            @click="handleMobileOpenDraftDialog"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            草稿箱
          </button>
          <button
            @click="handleMobileOpenShortcutDialog"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            快捷键帮助
          </button>
          <button
            @click="handleMobileOpenOutlineDialog"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            章节大纲
          </button>
          <button
            @click="handleMobileFocusNextIncompleteSection"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            下一待补分区
          </button>
          <button
            v-if="isEditing"
            @click="handleMobileExport"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            导出 Word
          </button>
          <button
            v-if="canPublishCurrentDocument"
            @click="handleMobilePublish"
            :disabled="isEditorSaving"
            class="w-full h-11 rounded bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {{ publishButtonText }}
          </button>
          <button
            @click="closeMobileActions"
            class="w-full h-11 rounded bg-[#f4f7f5] text-[#435549] text-sm font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDraftDialog"
      class="fixed inset-0 z-40 bg-slate-900/45 p-4 overflow-y-auto"
      @click.self="handleCloseDraftDialog"
    >
      <div class="max-w-md mx-auto mt-10 rounded border border-slate-200 bg-white shadow-lg p-5 sm:p-6">
        <h3 class="text-base font-semibold text-slate-800">本地草稿箱</h3>
        <p class="mt-1 text-xs text-slate-500">用于恢复未保存内容，数据仅保存在当前浏览器。</p>
        <div v-if="currentLocalDraft" class="mt-4 rounded border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-[#2f5f4f]">
          <div class="mt-2">
            <input
              v-model="localDraftSearch"
              type="text"
              placeholder="搜索草稿名称/课程/班级"
              class="w-full rounded border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <p class="mt-2">
            共 {{ localDraftHistory.length }} 条本地草稿（置顶 {{ pinnedDraftCount }} / 未置顶 {{ unpinnedDraftCount }}），筛选命中 {{ filteredLocalDraftHistory.length }} 条
          </p>
          <p v-if="filteredLocalDraftHistory.length === 0" class="mt-2 text-xs text-slate-500">无匹配草稿，请调整搜索关键词。</p>
          <div class="mt-2 max-h-36 overflow-auto space-y-1">
            <div
              v-for="item in filteredLocalDraftHistory"
              :key="item.savedAt"
              class="rounded border p-1.5 transition-colors"
              :class="selectedLocalDraftSavedAt === item.savedAt ? 'border-emerald-300 bg-white' : 'border-transparent bg-emerald-50/50'"
            >
              <button
                @click="handleSelectLocalDraft(item.savedAt)"
                class="w-full text-left rounded-sm px-2 py-1 transition-colors hover:bg-emerald-50"
              >
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs font-medium leading-5 text-[#2f5f4f]">
                    {{ resolveLocalDraftDisplayNameForView(item) }}
                    <span
                      v-if="item.pinned"
                      class="ml-1 inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700"
                    >
                      置顶
                    </span>
                  </span>
                  <span class="text-[10px] text-slate-500 whitespace-nowrap">
                    {{ formatDraftTimestamp(item.savedAt) || item.savedAt }}
                  </span>
                </div>
                <p class="mt-0.5 text-[10px] text-slate-500">
                  {{ item.snapshot.courseName || '未填课程' }} · {{ item.snapshot.className || '未填班级' }}
                </p>
              </button>
              <div class="mt-1 flex items-center gap-1 px-2 pb-1">
                <button
                  @click.stop="handleToggleLocalDraftPinned(item.savedAt)"
                  class="rounded-sm border border-emerald-200 bg-white px-2 py-1 text-[10px] text-emerald-700 hover:bg-emerald-50"
                >
                  {{ item.pinned ? '取消置顶' : '置顶' }}
                </button>
                <button
                  @click.stop="handleRenameLocalDraft(item.savedAt)"
                  class="rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-50"
                >
                  重命名
                </button>
              </div>
            </div>
          </div>
          <p class="mt-2">当前选择：{{ selectedLocalDraft ? (formatDraftTimestamp(selectedLocalDraft.savedAt) || selectedLocalDraft.savedAt) : '无' }}</p>
          <p class="mt-1">与当前内容差异：{{ selectedLocalDraftDiff.changedCount }} 项</p>
          <div
            v-if="selectedLocalDraftDiff.changedCount > 0"
            class="mt-2 max-h-36 overflow-auto space-y-1 rounded border border-emerald-100 bg-white/70 p-2"
          >
            <div
              v-for="item in selectedLocalDraftDiff.items"
              :key="item.field"
              class="rounded-sm border border-emerald-100 bg-white px-2 py-1.5"
            >
              <p class="text-xs font-medium text-[#2f5f4f]">{{ item.label }}</p>
              <p class="text-[11px] text-slate-500">当前：{{ item.currentPreview }}</p>
              <p class="text-[11px] text-[#2f5f4f]">草稿：{{ item.draftPreview }}</p>
            </div>
          </div>
          <p v-else class="mt-2 text-xs text-[#2f5f4f]">所选草稿与当前编辑内容一致</p>
          <p class="mt-1">恢复后内容来源将变更为：本地草稿</p>
        </div>
        <div v-else class="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          暂无本地草稿
        </div>
        <div class="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            @click="handleRestoreLocalDraft"
            :disabled="!selectedLocalDraft"
            class="h-10 rounded bg-[#647269] text-white text-sm font-medium disabled:opacity-50"
          >
            恢复草稿
          </button>
          <button
            @click="handleClearLocalDraft"
            :disabled="!currentLocalDraft"
            class="h-10 rounded border border-red-200 bg-red-50 text-red-600 text-sm font-medium disabled:opacity-50"
          >
            清空草稿
          </button>
          <button
            @click="handleClearUnpinnedLocalDrafts"
            :disabled="unpinnedDraftCount === 0"
            class="h-10 rounded border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium disabled:opacity-50"
          >
            清理未置顶
          </button>
          <button
            @click="handleExportLocalDrafts"
            :disabled="localDraftHistory.length === 0"
            class="h-10 rounded border border-[#c9d6cf] bg-[#eef3f0] text-[#435549] text-sm font-medium disabled:opacity-50"
          >
            导出草稿
          </button>
          <button
            @click="triggerImportLocalDrafts"
            class="h-10 rounded border border-slate-300 bg-white text-slate-700 text-sm font-medium"
          >
            导入草稿
          </button>
          <button
            @click="handleCloseDraftDialog"
            class="h-10 rounded border border-slate-300 bg-white text-slate-700 text-sm font-medium sm:col-span-2"
          >
            关闭
          </button>
          <input
            ref="localDraftImportInputRef"
            type="file"
            accept="application/json,.json"
            class="hidden"
            @change="handleImportLocalDrafts"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showImportPreviewDialog"
      class="fixed inset-0 z-50 bg-slate-900/60 p-4 overflow-y-auto"
      @click.self="handleCancelImportPreview"
    >
      <div class="max-w-lg mx-auto mt-8 rounded border border-slate-200 bg-white shadow-lg p-5 sm:p-6">
        <h3 class="text-base font-semibold text-slate-800">导入草稿预览</h3>
        <p class="mt-1 text-xs text-slate-500">仅导入勾选草稿，导入前可选择冲突处理策略。</p>
        <p
          v-if="localDraftImportConflictCount > 0"
          class="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
        >
          检测到重复时间戳草稿 {{ localDraftImportConflictCount }} 条
        </p>

        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            @click="localDraftImportMode = 'prefer-imported'"
            :class="[
              'h-10 rounded border text-sm font-medium',
              localDraftImportMode === 'prefer-imported'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white text-slate-600',
            ]"
          >
            覆盖本地冲突项
          </button>
          <button
            @click="localDraftImportMode = 'keep-existing'"
            :class="[
              'h-10 rounded border text-sm font-medium',
              localDraftImportMode === 'keep-existing'
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-slate-300 bg-white text-slate-600',
            ]"
          >
            保留本地版本（仅导入新增）
          </button>
        </div>

        <div
          v-if="localDraftImportConflictCount > 0"
          class="mt-3 rounded border border-amber-200 bg-amber-50/70 p-3"
        >
          <p class="text-xs font-medium text-amber-700">冲突字段策略</p>
          <p class="mt-0.5 text-[11px] text-amber-700">一键批量设置所有冲突项的字段覆盖范围</p>
          <label class="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700">
            <input
              v-model="applyPresetToSelectedConflictOnly"
              type="checkbox"
              class="h-3.5 w-3.5 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
            />
            仅对已勾选冲突项应用
          </label>
          <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              @click="handleApplyLocalDraftImportConflictPreset('all')"
              class="rounded-sm border border-amber-300 bg-white px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-50"
            >
              冲突全覆盖
            </button>
            <button
              @click="handleApplyLocalDraftImportConflictPreset('metadata')"
              class="rounded-sm border border-amber-300 bg-white px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-50"
            >
              仅基础信息
            </button>
            <button
              @click="handleApplyLocalDraftImportConflictPreset('content')"
              class="rounded-sm border border-amber-300 bg-white px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-50"
            >
              仅正文
            </button>
            <button
              @click="handleApplyLocalDraftImportConflictPreset('none')"
              class="rounded-sm border border-amber-300 bg-white px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-50"
            >
              清空冲突字段
            </button>
          </div>
        </div>

        <div class="mt-4 rounded border border-slate-200 bg-slate-50/80 p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium text-slate-700">仅导入勾选草稿</p>
            <div class="flex items-center gap-2">
              <button
                @click="showOnlyConflictImportDrafts = !showOnlyConflictImportDrafts"
                :class="[
                  'rounded-sm border px-2 py-1 text-[11px] hover:bg-slate-50',
                  showOnlyConflictImportDrafts
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-slate-300 bg-white text-slate-600',
                ]"
              >
                仅看冲突
              </button>
              <button
                @click="showOnlySelectedImportDrafts = !showOnlySelectedImportDrafts"
                :class="[
                  'rounded-sm border px-2 py-1 text-[11px] hover:bg-slate-50',
                  showOnlySelectedImportDrafts
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-600',
                ]"
              >
                仅看已勾选
              </button>
              <button
                @click="handleSelectAllImportDrafts"
                class="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                全选
              </button>
              <button
                @click="handleSelectConflictImportDrafts"
                class="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                仅冲突
              </button>
              <button
                @click="handleSelectNewImportDrafts"
                class="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                仅新增
              </button>
              <button
                @click="handleClearImportDraftSelection"
                class="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                清空选择
              </button>
            </div>
          </div>
          <p class="mt-1 text-[11px] text-slate-500">
            已选择 {{ selectedImportDraftSavedAt.length }} / {{ localDraftImportCandidates.length }}，当前显示 {{ filteredLocalDraftImportCandidates.length }} 条
          </p>
          <input
            v-model="localDraftImportSearch"
            type="text"
            placeholder="筛选导入草稿（标题/课程/班级/冲突字段）"
            class="mt-2 h-8 w-full rounded-sm border border-slate-300 bg-white px-2.5 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-200"
          />
          <div class="mt-2 max-h-48 overflow-auto space-y-1.5">
            <label
              v-for="item in filteredLocalDraftImportCandidates"
              :key="`import-${item.draft.savedAt}`"
              class="flex items-start gap-2 rounded border border-slate-200 bg-white px-2.5 py-2"
            >
              <input
                type="checkbox"
                :checked="selectedImportDraftSavedAt.includes(item.draft.savedAt)"
                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                @change="handleToggleImportDraftSelection(item.draft.savedAt)"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="truncate text-xs font-medium text-slate-700">
                    {{ resolveLocalDraftDisplayNameForView(item.draft) }}
                  </span>
                  <span
                    v-if="item.conflict"
                    class="shrink-0 rounded-sm border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700"
                  >
                    冲突
                  </span>
                </div>
                <p class="mt-0.5 text-[10px] text-slate-500">
                  {{ formatDraftTimestamp(item.draft.savedAt) || item.draft.savedAt }}
                </p>
                <p
                  v-if="item.conflict && localDraftImportConflictItemMap.get(item.draft.savedAt)"
                  class="mt-0.5 text-[10px] text-amber-700"
                >
                  本地：{{ localDraftImportConflictItemMap.get(item.draft.savedAt)?.localDisplayName }} ·
                  导入：{{ localDraftImportConflictItemMap.get(item.draft.savedAt)?.importedDisplayName }}
                </p>
                <p
                  v-if="item.conflict"
                  class="mt-0.5 text-[10px] text-slate-500"
                >
                  {{ formatLocalDraftImportConflictDiffText(item.draft.savedAt) }}
                </p>
                <div v-if="item.conflict" class="mt-1">
                  <button
                    @click.prevent="handleToggleLocalDraftImportConflictExpanded(item.draft.savedAt)"
                    class="rounded-sm border border-slate-300 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                  >
                    {{ isLocalDraftImportConflictExpanded(item.draft.savedAt) ? '收起差异' : '展开差异' }}
                  </button>
                </div>
                <div
                  v-if="item.conflict && isLocalDraftImportConflictExpanded(item.draft.savedAt)"
                  class="mt-1.5 rounded-sm border border-slate-200 bg-slate-50 p-2 space-y-1"
                >
                  <div class="flex items-center gap-1 pb-1">
                    <button
                      @click.prevent="handleSelectAllLocalDraftImportConflictFields(item.draft.savedAt)"
                      class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-600"
                    >
                      字段全选
                    </button>
                    <button
                      @click.prevent="handleClearLocalDraftImportConflictFields(item.draft.savedAt)"
                      class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-600"
                    >
                      清空字段
                    </button>
                  </div>
                  <template
                    v-for="detail in localDraftImportConflictDetailItemMap.get(item.draft.savedAt)?.details || []"
                    :key="`${item.draft.savedAt}-${detail.label}`"
                  >
                    <div class="flex items-start gap-1.5">
                      <input
                        type="checkbox"
                        :checked="resolveLocalDraftImportSelectedFields(item.draft.savedAt).includes(detail.field)"
                        class="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        @change="handleToggleLocalDraftImportConflictField(item.draft.savedAt, detail.field)"
                      />
                      <p class="text-[10px] text-slate-700 font-medium">{{ detail.label }}</p>
                    </div>
                    <p class="text-[10px] text-slate-500">当前：{{ detail.currentPreview }}</p>
                    <p class="text-[10px] text-emerald-700">导入：{{ detail.importedPreview }}</p>
                  </template>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="mt-4 rounded border border-emerald-100 bg-emerald-50/70 p-3">
          <p class="text-xs text-[#2f5f4f]">检测到 {{ localDraftImportPreview.importedCount }} 条有效草稿</p>
          <p class="mt-1 text-xs text-[#2f5f4f]">
            预计新增 {{ localDraftImportPreview.newCount }} 条，覆盖 {{ localDraftImportPreview.overwriteCount }} 条
          </p>
          <p
            v-if="localDraftImportPreview.droppedByLimitCount > 0"
            class="mt-1 text-xs text-amber-700"
          >
            受历史上限影响，将移除最旧 {{ localDraftImportPreview.droppedByLimitCount }} 条草稿
          </p>
          <p class="mt-1 text-[11px] text-slate-500 whitespace-pre-line">{{ localDraftImportPreviewMessage }}</p>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            @click="handleCancelImportPreview"
            class="h-10 rounded border border-slate-300 bg-white text-slate-700 text-sm font-medium"
          >
            取消
          </button>
          <button
            @click="handleConfirmImportPreview"
            :disabled="selectedImportDraftSavedAt.length === 0"
            class="h-10 rounded bg-[#647269] text-white text-sm font-medium disabled:opacity-50"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { TeachingPlan } from '../stores/plan'
import type { JSONContent } from '@tiptap/core'

export type EditorContentJson = Partial<
  Record<'objectives' | 'keyPoints' | 'process' | 'blackboard' | 'reflection', JSONContent>
>
type RichTextField = keyof EditorContentJson

export type EditorPlanForm = {
  title: string
  courseName: string
  className: string
  duration: number
  methods: string
  resources: string
  objectives: string
  keyPoints: string
  process: string
  blackboard: string
  reflection: string
  contentJson: EditorContentJson
}

const fallbackRichText = (value?: string) => value || '<p></p>'
const RICH_TEXT_FIELDS: RichTextField[] = ['objectives', 'keyPoints', 'process', 'blackboard', 'reflection']
const KNOWN_LAYOUT_NODE_TYPES = new Set([
  'lessonTimeline',
  'activityStepCard',
  'goalActivityAssessmentGrid',
])
const UNKNOWN_PLACEHOLDER_NODE_TYPE = 'unknownNodePlaceholder'

const createTextParagraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const htmlToText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const buildLayoutNodeFromTag = (type: string, tag: string): JSONContent | null => {
  if (!KNOWN_LAYOUT_NODE_TYPES.has(type)) {
    return null
  }

  const starter = tag.match(/data-starter=\"([^\"]*)\"/i)?.[1]
  const starterText = starter || '示例：请根据本节教学安排补充内容'
  const baseContent = [createTextParagraph(starterText)]

  if (type === 'lessonTimeline') {
    const title = tag.match(/data-title=\"([^\"]*)\"/i)?.[1] || '时间轴'
    const minutesRaw = tag.match(/data-minutes=\"([^\"]*)\"/i)?.[1]
    const minutes = minutesRaw ? Number(minutesRaw) || 0 : 0
    return { type, attrs: { title, minutes, starter: starterText }, content: baseContent }
  }

  if (type === 'activityStepCard') {
    const title = tag.match(/data-title=\"([^\"]*)\"/i)?.[1] || '步骤卡'
    const steps = tag.match(/data-steps=\"([^\"]*)\"/i)?.[1] || '[]'
    return { type, attrs: { title, steps, starter: starterText }, content: baseContent }
  }

  const goal = tag.match(/data-goal=\"([^\"]*)\"/i)?.[1] || ''
  const activity = tag.match(/data-activity=\"([^\"]*)\"/i)?.[1] || ''
  const assessment = tag.match(/data-assessment=\"([^\"]*)\"/i)?.[1] || ''
  return { type, attrs: { goal, activity, assessment, starter: starterText }, content: baseContent }
}

const deriveDocFromHtml = (html?: string): JSONContent => {
  if (!html || !html.trim()) {
    return { type: 'doc', content: [createTextParagraph('')] }
  }

  const content: JSONContent[] = []
  const markerTagRegex = /<[^>]*data-node-type=\"([^\"]+)\"[^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = markerTagRegex.exec(html)) !== null) {
    const type = match[1]
    const tag = match[0]
    const node = buildLayoutNodeFromTag(type, tag)
    if (node) {
      content.push(node)
    }
  }

  if (content.length === 0) {
    const text = htmlToText(html)
    content.push(createTextParagraph(text))
  }

  return { type: 'doc', content }
}

const isValidDoc = (value: unknown): value is JSONContent => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const doc = value as JSONContent
  return doc.type === 'doc' && Array.isArray(doc.content)
}

const ensureCompleteContentJson = (form: EditorPlanForm): EditorContentJson => {
  const result: EditorContentJson = {}
  const source = form.contentJson || {}

  for (const field of RICH_TEXT_FIELDS) {
    const existing = source[field]
    if (isValidDoc(existing)) {
      result[field] = existing
      continue
    }
    result[field] = deriveDocFromHtml(form[field])
  }

  return result
}

const restoreUnknownPlaceholderNode = (node: any): any => {
  if (!node || typeof node !== 'object') {
    return node
  }

  if (node.type === UNKNOWN_PLACEHOLDER_NODE_TYPE) {
    const rawJson = typeof node.attrs?.rawJson === 'string' ? node.attrs.rawJson : ''
    if (rawJson) {
      try {
        return JSON.parse(rawJson)
      } catch {
        return createTextParagraph(node.attrs?.summary || '未识别内容')
      }
    }
    return createTextParagraph(node.attrs?.summary || '未识别内容')
  }

  if (!Array.isArray(node.content)) {
    return node
  }

  return {
    ...node,
    content: node.content.map(restoreUnknownPlaceholderNode),
  }
}

const restoreUnknownNodesInContentJson = (contentJson: EditorContentJson): EditorContentJson => {
  const restored: EditorContentJson = {}

  for (const field of RICH_TEXT_FIELDS) {
    const section = contentJson[field]
    if (!section) {
      continue
    }
    restored[field] = restoreUnknownPlaceholderNode(section)
  }

  return restored
}

export const mapFetchedPlanToForm = (plan: Partial<TeachingPlan>): EditorPlanForm => ({
  title: plan.title || '',
  courseName: plan.courseName || '',
  className: plan.className || '',
  duration: plan.duration || 90,
  methods: plan.methods || '',
  resources: plan.resources || '',
  objectives: fallbackRichText(plan.objectives),
  keyPoints: fallbackRichText(plan.keyPoints),
  process: fallbackRichText(plan.process),
  blackboard: fallbackRichText(plan.blackboard),
  reflection: fallbackRichText(plan.reflection),
  contentJson: plan.contentJson || {},
})

export const applyTemplateToForm = (
  current: EditorPlanForm,
  template: Partial<TeachingPlan>
): EditorPlanForm => {
  const mapped = mapFetchedPlanToForm(template)
  return {
    ...current,
    ...mapped,
  }
}

export const applyTemplateWithConfirmation = (
  current: EditorPlanForm,
  template: Partial<TeachingPlan>,
  confirmed: boolean
): EditorPlanForm => {
  if (!confirmed) {
    return current
  }
  return applyTemplateToForm(current, template)
}

export const buildPlanPayload = (form: EditorPlanForm) => ({
  ...form,
  contentJson: restoreUnknownNodesInContentJson(ensureCompleteContentJson(form)),
  htmlContent: form.process,
})

export const buildEditorDraftSignature = (form: EditorPlanForm): string =>
  JSON.stringify(buildPlanPayload(form))

export const hasEditorDraftChanges = (
  current: EditorPlanForm,
  savedSignature?: string | null
): boolean => {
  if (!savedSignature) {
    return true
  }
  return buildEditorDraftSignature(current) !== savedSignature
}

export const LOCAL_EDITOR_DRAFT_VERSION = 1
export const LOCAL_EDITOR_DRAFT_PREFIX = 'editor-local-draft:'
export const LOCAL_EDITOR_DRAFT_HISTORY_LIMIT = 6

export type EditorLocalDraftSnapshot = {
  displayName: string
  title: string
  courseName: string
  className: string
}

export type EditorLocalDraft = {
  version: number
  savedAt: string
  form: EditorPlanForm
  snapshot: EditorLocalDraftSnapshot
  pinned: boolean
}

export type EditorLocalDraftHistoryPayload = {
  version: number
  drafts: EditorLocalDraft[]
}

export type EditorLocalDraftExportPayload = {
  version: number
  exportedAt: string
  drafts: EditorLocalDraft[]
}

export type EditorLocalDraftMergeMode = 'keep-existing' | 'prefer-imported'

export type EditorLocalDraftImportPreview = {
  mode: EditorLocalDraftMergeMode
  importedCount: number
  conflictCount: number
  newCount: number
  overwriteCount: number
  droppedByLimitCount: number
  nextCount: number
  mergedHistory: EditorLocalDraft[]
}

export type EditorLocalDraftImportCandidate = {
  draft: EditorLocalDraft
  conflict: boolean
}

export type EditorLocalDraftImportSelectionStrategy = 'all' | 'conflict' | 'new' | 'none'
export type EditorLocalDraftImportCandidateFilterOptions = {
  onlyConflict: boolean
  onlySelected: boolean
  selectedSavedAt: string[]
}
export type EditorLocalDraftImportFieldSelections = Record<string, EditorDraftComparableField[]>
export type EditorLocalDraftImportConflictFieldPreset =
  | 'all'
  | 'metadata'
  | 'content'
  | 'none'

export type EditorLocalDraftImportConflictItem = {
  savedAt: string
  localDisplayName: string
  importedDisplayName: string
}

export type EditorLocalDraftImportConflictDiffItem = {
  savedAt: string
  changedCount: number
  fields: string[]
}

export type EditorLocalDraftImportConflictDetailLine = {
  field: EditorDraftComparableField
  label: string
  currentPreview: string
  importedPreview: string
}

export type EditorLocalDraftImportConflictDetailItem = {
  savedAt: string
  changedCount: number
  details: EditorLocalDraftImportConflictDetailLine[]
}

export type EditorLocalDraftImportPreparedDrafts = {
  importedDrafts: EditorLocalDraft[]
  effectiveMode: EditorLocalDraftMergeMode
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isEditorPlanFormLike = (value: unknown): value is EditorPlanForm => {
  if (!isObjectRecord(value)) {
    return false
  }

  return (
    typeof value.title === 'string' &&
    typeof value.courseName === 'string' &&
    typeof value.className === 'string' &&
    typeof value.duration === 'number' &&
    typeof value.methods === 'string' &&
    typeof value.resources === 'string' &&
    typeof value.objectives === 'string' &&
    typeof value.keyPoints === 'string' &&
    typeof value.process === 'string' &&
    typeof value.blackboard === 'string' &&
    typeof value.reflection === 'string' &&
    isObjectRecord(value.contentJson)
  )
}

export const buildEditorLocalDraftStorageKey = (planId?: string | null): string => {
  const normalizedId = typeof planId === 'string' && planId.trim() ? planId.trim() : 'new'
  return `${LOCAL_EDITOR_DRAFT_PREFIX}${normalizedId}`
}

export const serializeEditorLocalDraft = (
  form: EditorPlanForm,
  savedAt = new Date().toISOString()
): string => {
  const snapshot = buildEditorLocalDraftSnapshot(form)
  const payload: EditorLocalDraft = {
    version: LOCAL_EDITOR_DRAFT_VERSION,
    savedAt,
    form,
    snapshot,
    pinned: false,
  }
  return JSON.stringify(payload)
}

const resolveEditorDraftIdentityPart = (value: string | undefined): string =>
  (value || '').trim()

export const buildEditorLocalDraftDisplayName = (form: EditorPlanForm): string => {
  const title = resolveEditorDraftIdentityPart(form.title)
  if (title) {
    return title
  }

  const courseName = resolveEditorDraftIdentityPart(form.courseName)
  const className = resolveEditorDraftIdentityPart(form.className)
  if (courseName && className) {
    return `${courseName}｜${className}`
  }
  if (courseName) {
    return `${courseName}｜未填写班级`
  }
  if (className) {
    return `未命名教案｜${className}`
  }

  return '未命名草稿'
}

export const buildEditorLocalDraftSnapshot = (form: EditorPlanForm): EditorLocalDraftSnapshot => ({
  displayName: buildEditorLocalDraftDisplayName(form),
  title: resolveEditorDraftIdentityPart(form.title),
  courseName: resolveEditorDraftIdentityPart(form.courseName),
  className: resolveEditorDraftIdentityPart(form.className),
})

const parseEditorLocalDraftSnapshot = (
  value: unknown,
  form: EditorPlanForm
): EditorLocalDraftSnapshot => {
  const fallback = buildEditorLocalDraftSnapshot(form)
  if (!isObjectRecord(value)) {
    return fallback
  }

  const title = typeof value.title === 'string' ? value.title.trim() : fallback.title
  const courseName = typeof value.courseName === 'string' ? value.courseName.trim() : fallback.courseName
  const className = typeof value.className === 'string' ? value.className.trim() : fallback.className
  const displayName =
    typeof value.displayName === 'string' && value.displayName.trim()
      ? value.displayName.trim()
      : buildEditorLocalDraftDisplayName({ ...form, title, courseName, className })

  return {
    displayName,
    title,
    courseName,
    className,
  }
}

const parseEditorLocalDraftItem = (value: unknown): EditorLocalDraft | null => {
  if (!isObjectRecord(value)) {
    return null
  }

  if (typeof value.savedAt !== 'string' || !value.savedAt.trim()) {
    return null
  }

  if (!isEditorPlanFormLike(value.form)) {
    return null
  }

  const snapshot = parseEditorLocalDraftSnapshot(value.snapshot, value.form)

  return {
    version: typeof value.version === 'number' ? value.version : LOCAL_EDITOR_DRAFT_VERSION,
    savedAt: value.savedAt,
    form: value.form,
    snapshot,
    pinned: value.pinned === true,
  }
}

export const resolveEditorLocalDraftDisplayName = (draft: EditorLocalDraft): string =>
  draft.snapshot?.displayName?.trim() || buildEditorLocalDraftDisplayName(draft.form)

export const sortEditorLocalDraftHistoryForView = (history: EditorLocalDraft[]): EditorLocalDraft[] => {
  return [...history].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1
    }
    return b.savedAt.localeCompare(a.savedAt)
  })
}

export const renameEditorLocalDraft = (
  history: EditorLocalDraft[],
  savedAt: string,
  nextDisplayName: string
): EditorLocalDraft[] => {
  const trimmed = nextDisplayName.trim()
  return history.map((draft) => {
    if (draft.savedAt !== savedAt) {
      return draft
    }

    return {
      ...draft,
      snapshot: {
        ...draft.snapshot,
        displayName: trimmed || buildEditorLocalDraftDisplayName(draft.form),
      },
    }
  })
}

export const toggleEditorLocalDraftPinned = (
  history: EditorLocalDraft[],
  savedAt: string
): EditorLocalDraft[] => {
  return history.map((draft) => {
    if (draft.savedAt !== savedAt) {
      return draft
    }

    return {
      ...draft,
      pinned: !draft.pinned,
    }
  })
}

export const removeUnpinnedEditorLocalDrafts = (history: EditorLocalDraft[]): EditorLocalDraft[] =>
  history.filter((draft) => draft.pinned)

export const buildClearUnpinnedDraftConfirmMessage = (
  unpinnedCount: number,
  pinnedCount: number
): string => {
  if (pinnedCount > 0) {
    return `将清理 ${unpinnedCount} 条未置顶草稿，并保留 ${pinnedCount} 条置顶草稿，是否继续？`
  }
  return `将清理 ${unpinnedCount} 条未置顶草稿，是否继续？`
}

export const buildClearAllDraftConfirmMessage = (
  totalCount: number,
  pinnedCount: number
): string => {
  if (pinnedCount > 0) {
    return `当前共有 ${totalCount} 条草稿，其中 ${pinnedCount} 条为置顶草稿。继续将清空全部草稿（含置顶）吗？`
  }
  return `确定清空全部 ${totalCount} 条草稿吗？`
}

export const normalizeEditorLocalDraftSearchQuery = (value: string): string =>
  value.trim().toLocaleLowerCase('zh-CN')

export const filterEditorLocalDraftHistory = (
  history: EditorLocalDraft[],
  query: string
): EditorLocalDraft[] => {
  const keyword = normalizeEditorLocalDraftSearchQuery(query)
  if (!keyword) {
    return history
  }

  return history.filter((draft) => {
    const name = resolveEditorLocalDraftDisplayName(draft)
    const searchable = [
      name,
      draft.snapshot.title,
      draft.snapshot.courseName,
      draft.snapshot.className,
      draft.savedAt,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('zh-CN')
    return searchable.includes(keyword)
  })
}

export const serializeEditorLocalDraftHistory = (drafts: EditorLocalDraft[]): string => {
  const payload: EditorLocalDraftHistoryPayload = {
    version: LOCAL_EDITOR_DRAFT_VERSION,
    drafts,
  }
  return JSON.stringify(payload)
}

export const parseEditorLocalDraftHistory = (raw: string | null | undefined): EditorLocalDraft[] => {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (isObjectRecord(parsed) && Array.isArray(parsed.drafts)) {
      return parsed.drafts
        .map((item) => parseEditorLocalDraftItem(item))
        .filter((item): item is EditorLocalDraft => Boolean(item))
    }

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => parseEditorLocalDraftItem(item))
        .filter((item): item is EditorLocalDraft => Boolean(item))
    }

    const legacy = parseEditorLocalDraftItem(parsed)
    return legacy ? [legacy] : []
  } catch {
    return []
  }
}

export const pushEditorLocalDraftHistory = (
  history: EditorLocalDraft[],
  form: EditorPlanForm,
  savedAt = new Date().toISOString(),
  limit = LOCAL_EDITOR_DRAFT_HISTORY_LIMIT
): EditorLocalDraft[] => {
  const snapshot = buildEditorLocalDraftSnapshot(form)
  const nextDraft: EditorLocalDraft = {
    version: LOCAL_EDITOR_DRAFT_VERSION,
    savedAt,
    form,
    snapshot,
    pinned: false,
  }

  const normalized = history
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))

  const nextSignature = buildEditorDraftSignature(form)
  const firstSignature = normalized[0] ? buildEditorDraftSignature(normalized[0].form) : null

  if (firstSignature === nextSignature) {
    const first = normalized[0]
    const firstDefaultDisplayName = first ? buildEditorLocalDraftDisplayName(first.form) : ''
    const hasCustomDisplayName =
      first?.snapshot.displayName && first.snapshot.displayName !== firstDefaultDisplayName
    const mergedFirst: EditorLocalDraft = {
      ...nextDraft,
      pinned: first?.pinned === true,
      snapshot: {
        ...snapshot,
        displayName: hasCustomDisplayName ? first!.snapshot.displayName : snapshot.displayName,
      },
    }
    return [mergedFirst, ...normalized.slice(1)].slice(0, Math.max(1, limit))
  }

  return [nextDraft, ...normalized].slice(0, Math.max(1, limit))
}

export const parseEditorLocalDraft = (raw: string | null | undefined): EditorLocalDraft | null => {
  const history = parseEditorLocalDraftHistory(raw)
  return history[0] ?? null
}

export const serializeEditorLocalDraftExportPayload = (
  history: EditorLocalDraft[],
  exportedAt = new Date().toISOString()
): string => {
  const payload: EditorLocalDraftExportPayload = {
    version: LOCAL_EDITOR_DRAFT_VERSION,
    exportedAt,
    drafts: history,
  }
  return JSON.stringify(payload)
}

export const parseEditorLocalDraftImportPayload = (raw: string | null | undefined): EditorLocalDraft[] => {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (isObjectRecord(parsed) && Array.isArray(parsed.drafts)) {
      return parsed.drafts
        .map((item) => parseEditorLocalDraftItem(item))
        .filter((item): item is EditorLocalDraft => Boolean(item))
    }

    return parseEditorLocalDraftHistory(raw)
  } catch {
    return []
  }
}

export const mergeEditorLocalDraftHistory = (
  existing: EditorLocalDraft[],
  imported: EditorLocalDraft[],
  limit = LOCAL_EDITOR_DRAFT_HISTORY_LIMIT,
  mode: EditorLocalDraftMergeMode = 'keep-existing'
): EditorLocalDraft[] => {
  const normalizedExisting = existing
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))
  const normalizedImported = imported
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))

  const deduped = new Map<string, EditorLocalDraft>()

  for (const draft of normalizedExisting) {
    if (!deduped.has(draft.savedAt)) {
      deduped.set(draft.savedAt, draft)
    }
  }

  for (const draft of normalizedImported) {
    if (mode === 'prefer-imported') {
      deduped.set(draft.savedAt, draft)
      continue
    }
    if (!deduped.has(draft.savedAt)) {
      deduped.set(draft.savedAt, draft)
    }
  }

  return [...deduped.values()]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, Math.max(1, limit))
}

export const buildEditorLocalDraftImportCandidates = (
  existing: EditorLocalDraft[],
  imported: EditorLocalDraft[]
): EditorLocalDraftImportCandidate[] => {
  const normalizedExisting = existing
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))
  const normalizedImported = imported
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))
  const existingSavedAt = new Set(normalizedExisting.map((item) => item.savedAt))
  const dedupedImported = new Map<string, EditorLocalDraft>()
  for (const draft of normalizedImported) {
    dedupedImported.set(draft.savedAt, draft)
  }

  return [...dedupedImported.values()]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .map((draft) => ({
      draft,
      conflict: existingSavedAt.has(draft.savedAt),
    }))
}

export const pickEditorLocalDraftsForImport = (
  candidates: EditorLocalDraftImportCandidate[],
  selectedSavedAt: string[]
): EditorLocalDraft[] => {
  const selected = new Set(selectedSavedAt)
  return candidates
    .filter((item) => selected.has(item.draft.savedAt))
    .map((item) => item.draft)
}

export const mergeEditorDraftFormBySelectedFields = (
  localForm: EditorPlanForm,
  importedForm: EditorPlanForm,
  selectedFields: EditorDraftComparableField[]
): EditorPlanForm => {
  const merged = {
    ...localForm,
    contentJson: { ...localForm.contentJson },
  } as EditorPlanForm

  const uniqueFields = [...new Set(selectedFields)]
  for (const field of uniqueFields) {
    if (field === 'contentJson') {
      continue
    }
    ;(merged as Record<string, unknown>)[field] = importedForm[field] as unknown
  }

  return merged
}

const EDITOR_LOCAL_DRAFT_METADATA_FIELDS: EditorDraftComparableField[] = [
  'title',
  'courseName',
  'className',
  'duration',
  'methods',
  'resources',
]

const EDITOR_LOCAL_DRAFT_CONTENT_FIELDS: EditorDraftComparableField[] = [
  'objectives',
  'keyPoints',
  'process',
  'blackboard',
  'reflection',
]

const EDITOR_LOCAL_DRAFT_METADATA_FIELD_SET = new Set(EDITOR_LOCAL_DRAFT_METADATA_FIELDS)
const EDITOR_LOCAL_DRAFT_CONTENT_FIELD_SET = new Set(EDITOR_LOCAL_DRAFT_CONTENT_FIELDS)

export const buildEditorLocalDraftImportFieldSelectionsByPreset = (
  conflictItems: EditorLocalDraftImportConflictDetailItem[],
  preset: EditorLocalDraftImportConflictFieldPreset
): EditorLocalDraftImportFieldSelections => {
  const selection: EditorLocalDraftImportFieldSelections = {}

  for (const item of conflictItems) {
    const fields = [...new Set(item.details.map((detail) => detail.field))]
    if (preset === 'none') {
      selection[item.savedAt] = []
      continue
    }
    if (preset === 'all') {
      selection[item.savedAt] = fields
      continue
    }
    if (preset === 'metadata') {
      selection[item.savedAt] = fields.filter((field) => EDITOR_LOCAL_DRAFT_METADATA_FIELD_SET.has(field))
      continue
    }
    selection[item.savedAt] = fields.filter((field) => EDITOR_LOCAL_DRAFT_CONTENT_FIELD_SET.has(field))
  }

  return selection
}

export const pickEditorLocalDraftImportConflictDetailsBySelection = (
  conflictItems: EditorLocalDraftImportConflictDetailItem[],
  selectedSavedAt: string[],
  selectedOnly: boolean
): EditorLocalDraftImportConflictDetailItem[] => {
  if (!selectedOnly) {
    return conflictItems
  }
  const selectedSet = new Set(selectedSavedAt)
  return conflictItems.filter((item) => selectedSet.has(item.savedAt))
}

export const selectEditorLocalDraftImportSavedAtByStrategy = (
  candidates: EditorLocalDraftImportCandidate[],
  strategy: EditorLocalDraftImportSelectionStrategy
): string[] => {
  if (strategy === 'none') {
    return []
  }

  if (strategy === 'all') {
    return candidates.map((item) => item.draft.savedAt)
  }

  if (strategy === 'conflict') {
    return candidates.filter((item) => item.conflict).map((item) => item.draft.savedAt)
  }

  return candidates.filter((item) => !item.conflict).map((item) => item.draft.savedAt)
}

export const filterEditorLocalDraftImportCandidates = (
  candidates: EditorLocalDraftImportCandidate[],
  options: EditorLocalDraftImportCandidateFilterOptions
): EditorLocalDraftImportCandidate[] => {
  const selected = new Set(options.selectedSavedAt)
  return candidates.filter((item) => {
    if (options.onlyConflict && !item.conflict) {
      return false
    }
    if (options.onlySelected && !selected.has(item.draft.savedAt)) {
      return false
    }
    return true
  })
}

export const searchEditorLocalDraftImportCandidates = (
  candidates: EditorLocalDraftImportCandidate[],
  query: string,
  conflictDiffItems: EditorLocalDraftImportConflictDiffItem[]
): EditorLocalDraftImportCandidate[] => {
  const keyword = normalizeEditorLocalDraftSearchQuery(query)
  if (!keyword) {
    return candidates
  }

  const conflictDiffMap = new Map(conflictDiffItems.map((item) => [item.savedAt, item]))
  return candidates.filter((item) => {
    const searchableParts = [
      resolveEditorLocalDraftDisplayName(item.draft),
      item.draft.snapshot.title,
      item.draft.snapshot.courseName,
      item.draft.snapshot.className,
      item.draft.savedAt,
    ]

    const conflictItem = conflictDiffMap.get(item.draft.savedAt)
    if (conflictItem) {
      searchableParts.push(conflictItem.fields.join(' '))
    }

    const searchable = searchableParts
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('zh-CN')
    return searchable.includes(keyword)
  })
}

export const buildEditorLocalDraftImportPreparedDrafts = (
  existing: EditorLocalDraft[],
  candidates: EditorLocalDraftImportCandidate[],
  selectedSavedAt: string[],
  mode: EditorLocalDraftMergeMode,
  fieldSelections: EditorLocalDraftImportFieldSelections
): EditorLocalDraftImportPreparedDrafts => {
  const selectedSet = new Set(selectedSavedAt)
  const existingMap = new Map<string, EditorLocalDraft>()
  for (const item of existing) {
    const parsed = parseEditorLocalDraftItem(item)
    if (parsed) {
      existingMap.set(parsed.savedAt, parsed)
    }
  }

  const importedDrafts: EditorLocalDraft[] = []
  let mergedConflictCount = 0

  for (const candidate of candidates) {
    if (!selectedSet.has(candidate.draft.savedAt)) {
      continue
    }

    if (!candidate.conflict) {
      importedDrafts.push(candidate.draft)
      continue
    }

    const selectedFields = fieldSelections[candidate.draft.savedAt] || []
    const localDraft = existingMap.get(candidate.draft.savedAt)
    if (selectedFields.length > 0 && localDraft) {
      const mergedForm = mergeEditorDraftFormBySelectedFields(
        localDraft.form,
        candidate.draft.form,
        selectedFields
      )
      importedDrafts.push({
        ...candidate.draft,
        form: mergedForm,
        snapshot: buildEditorLocalDraftSnapshot(mergedForm),
      })
      mergedConflictCount += 1
      continue
    }

    if (mode === 'prefer-imported') {
      importedDrafts.push(candidate.draft)
    }
  }

  const effectiveMode: EditorLocalDraftMergeMode =
    mode === 'prefer-imported' || mergedConflictCount > 0 ? 'prefer-imported' : 'keep-existing'

  return {
    importedDrafts,
    effectiveMode,
  }
}

export const buildEditorLocalDraftImportConflictItems = (
  existing: EditorLocalDraft[],
  candidates: EditorLocalDraftImportCandidate[]
): EditorLocalDraftImportConflictItem[] => {
  const existingMap = new Map<string, EditorLocalDraft>()
  for (const item of existing) {
    const parsed = parseEditorLocalDraftItem(item)
    if (parsed) {
      existingMap.set(parsed.savedAt, parsed)
    }
  }

  return candidates
    .filter((item) => item.conflict)
    .map((item) => {
      const local = existingMap.get(item.draft.savedAt)
      if (!local) {
        return null
      }
      return {
        savedAt: item.draft.savedAt,
        localDisplayName: resolveEditorLocalDraftDisplayName(local),
        importedDisplayName: resolveEditorLocalDraftDisplayName(item.draft),
      }
    })
    .filter((item): item is EditorLocalDraftImportConflictItem => Boolean(item))
}

export const buildEditorLocalDraftImportConflictDiffItems = (
  existing: EditorLocalDraft[],
  candidates: EditorLocalDraftImportCandidate[]
): EditorLocalDraftImportConflictDiffItem[] => {
  const existingMap = new Map<string, EditorLocalDraft>()
  for (const item of existing) {
    const parsed = parseEditorLocalDraftItem(item)
    if (parsed) {
      existingMap.set(parsed.savedAt, parsed)
    }
  }

  return candidates
    .filter((item) => item.conflict)
    .map((item) => {
      const local = existingMap.get(item.draft.savedAt)
      if (!local) {
        return null
      }
      const diff = buildEditorDraftDiffSummary(local.form, item.draft)
      return {
        savedAt: item.draft.savedAt,
        changedCount: diff.changedCount,
        fields: diff.items.map((diffItem) => diffItem.label),
      }
    })
    .filter((item): item is EditorLocalDraftImportConflictDiffItem => Boolean(item))
}

export const buildEditorLocalDraftImportConflictDetailItems = (
  existing: EditorLocalDraft[],
  candidates: EditorLocalDraftImportCandidate[]
): EditorLocalDraftImportConflictDetailItem[] => {
  const existingMap = new Map<string, EditorLocalDraft>()
  for (const item of existing) {
    const parsed = parseEditorLocalDraftItem(item)
    if (parsed) {
      existingMap.set(parsed.savedAt, parsed)
    }
  }

  return candidates
    .filter((item) => item.conflict)
    .map((item) => {
      const local = existingMap.get(item.draft.savedAt)
      if (!local) {
        return null
      }
      const diff = buildEditorDraftDiffSummary(local.form, item.draft)
      return {
        savedAt: item.draft.savedAt,
        changedCount: diff.changedCount,
        details: diff.items.map((detail) => ({
          field: detail.field,
          label: detail.label,
          currentPreview: detail.currentPreview,
          importedPreview: detail.draftPreview,
        })),
      }
    })
    .filter((item): item is EditorLocalDraftImportConflictDetailItem => Boolean(item))
}

export const buildEditorLocalDraftImportPreview = (
  existing: EditorLocalDraft[],
  imported: EditorLocalDraft[],
  limit = LOCAL_EDITOR_DRAFT_HISTORY_LIMIT,
  mode: EditorLocalDraftMergeMode = 'prefer-imported'
): EditorLocalDraftImportPreview => {
  const normalizedExisting = existing
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))
  const normalizedImported = imported
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))

  const importedUniqueMap = new Map<string, EditorLocalDraft>()
  for (const draft of normalizedImported) {
    importedUniqueMap.set(draft.savedAt, draft)
  }
  const importedUnique = [...importedUniqueMap.values()]
  const existingSavedAt = new Set(normalizedExisting.map((item) => item.savedAt))
  const conflictCount = importedUnique.filter((item) => existingSavedAt.has(item.savedAt)).length
  const overwriteCount = mode === 'prefer-imported' ? conflictCount : 0
  const newCount = importedUnique.length - conflictCount
  const mergedHistory = mergeEditorLocalDraftHistory(
    normalizedExisting,
    importedUnique,
    limit,
    mode
  )
  const droppedByLimitCount = Math.max(0, normalizedExisting.length + newCount - mergedHistory.length)

  return {
    mode,
    importedCount: importedUnique.length,
    conflictCount,
    newCount,
    overwriteCount,
    droppedByLimitCount,
    nextCount: mergedHistory.length,
    mergedHistory,
  }
}

export const buildEditorLocalDraftImportPreviewMessage = (
  preview: EditorLocalDraftImportPreview
): string => {
  const lines = [`检测到 ${preview.importedCount} 条有效草稿`]
  if (preview.conflictCount > 0 && preview.overwriteCount === 0) {
    lines.push(
      `预计新增 ${preview.newCount} 条，覆盖 ${preview.overwriteCount} 条（检测到 ${preview.conflictCount} 条冲突，保留本地版本）`
    )
  } else {
    lines.push(`预计新增 ${preview.newCount} 条，覆盖 ${preview.overwriteCount} 条`)
  }

  if (preview.droppedByLimitCount > 0) {
    lines.push(`受历史上限影响，将移除最旧 ${preview.droppedByLimitCount} 条草稿`)
  }

  lines.push(`导入后本地共 ${preview.nextCount} 条草稿`)
  lines.push('是否继续导入？')
  return lines.join('\n')
}

export const buildEditorLocalDraftExportFileName = (
  planId?: string | null,
  now = new Date()
): string => {
  const normalizedId = typeof planId === 'string' && planId.trim() ? planId.trim() : 'new'
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const min = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')
  return `editor-local-drafts-${normalizedId}-${yyyy}${mm}${dd}-${hh}${min}${ss}.json`
}

export type EditorContentSource = 'server' | 'local' | 'new'

export const resolveEditorContentSourceLabel = (source: EditorContentSource): string => {
  if (source === 'local') {
    return '内容来源：本地草稿'
  }
  if (source === 'server') {
    return '内容来源：服务器'
  }
  return '内容来源：新建教案'
}

type EditorDraftComparableField = Exclude<keyof EditorPlanForm, 'contentJson'>

export type EditorDraftDiffItem = {
  field: EditorDraftComparableField
  label: string
  currentPreview: string
  draftPreview: string
}

export type EditorDraftDiffSummary = {
  changedCount: number
  items: EditorDraftDiffItem[]
}

export type EditorCompletionSummary = {
  score: number
  filledCount: number
  totalCount: number
  missingLabels: string[]
}

export type EditorSectionCompletionItem = {
  section: EditorSectionKey
  label: string
  filledCount: number
  totalCount: number
  requiredMissingLabels: string[]
  status: 'empty' | 'partial' | 'complete'
  progress: number
}

export type EditorViewPreference = {
  focusMode: boolean
  collapsedSections: EditorCollapsibleSectionKey[]
  activeLayoutTab: EditorLayoutTabKey
}

export type EditorQualityTip = {
  level: 'warning' | 'suggestion'
  message: string
}

export type EditorSectionKey =
  | 'basic'
  | 'objectives'
  | 'keyPoints'
  | 'process'
  | 'blackboard'
  | 'reflection'
export type EditorCollapsibleSectionKey = Exclude<EditorSectionKey, 'basic'>
export type EditorSectionViewportPosition = {
  section: EditorSectionKey
  top: number
}

export type EditorLessonSkeletonPreset = 'lecture' | 'practice' | 'lab'
export type EditorLessonSkeletonApplyMode = 'fill-empty' | 'overwrite'

export type EditorExportPrecheckReport = {
  passed: boolean
  blockingIssues: string[]
  warningIssues: string[]
  focusSections: EditorSectionKey[]
}

export type EditorExportPrecheckFixAction = {
  key: string
  label: string
  section: EditorSectionKey
}

export type EditorProcessTimelinePreset = 'balanced' | 'lecture' | 'practice'
export type EditorProcessTimelineApplyMode = 'replace' | 'append'
export type EditorTimelineMoveDirection = 'up' | 'down'
export type EditorTimelineStep = {
  label: string
  minutes: number
}
export type EditorTimelineDraftStep = EditorTimelineStep & {
  id: string
}
export type EditorTimelineApplyPreview = {
  mode: EditorProcessTimelineApplyMode
  canApply: boolean
  normalizedSteps: EditorTimelineStep[]
  stepCount: number
  minuteTotal: number
  currentTextLength: number
  nextTextLength: number
  nextProcessHtml: string
  nextProcessPreviewText: string
}
export type EditorTimelinePreviewDiffSegment = {
  key: string
  text: string
  changed: boolean
}
export type EditorTimelineApplyPreviewDiff = {
  before: EditorTimelinePreviewDiffSegment[]
  after: EditorTimelinePreviewDiffSegment[]
  changedCount: number
}
type EditorLayoutTabKey = 'basic' | 'design' | 'process' | 'review'

type EditorLayoutTabMeta = {
  id: EditorLayoutTabKey
  label: string
  description: string
}

type EditorLayoutTabSummary = EditorLayoutTabMeta & {
  filledCount: number
  totalCount: number
  requiredMissingCount: number
}
type EditorLayoutShortcutHint = {
  key: string
  tab: EditorLayoutTabKey
  label: string
}

type TemplateEditTabKey = 'basic' | 'design' | 'process' | 'review'

type TemplateEditTabMeta = {
  id: TemplateEditTabKey
  label: string
  description: string
  fields: EditorDraftComparableField[]
}

type TemplateEditTabSummary = TemplateEditTabMeta & {
  filledCount: number
  totalCount: number
}

type EditorLessonSkeletonDefinition = {
  label: string
  description: string
  patch: Partial<EditorPlanForm>
}

type EditorProcessTimelineDefinition = {
  label: string
  description: string
  steps: Array<{ label: string; weight: number }>
}

const EDITOR_SECTION_LABELS: Record<EditorSectionKey, string> = {
  basic: '基本信息',
  objectives: '教学目标',
  keyPoints: '重点难点',
  process: '教学过程',
  blackboard: '板书设计',
  reflection: '教学反思',
}

const EDITOR_SECTION_ELEMENT_IDS: Record<EditorSectionKey, string> = {
  basic: 'editor-section-basic',
  objectives: 'editor-section-objectives',
  keyPoints: 'editor-section-keypoints',
  process: 'editor-section-process',
  blackboard: 'editor-section-blackboard',
  reflection: 'editor-section-reflection',
}

const EDITOR_COLLAPSIBLE_SECTIONS: EditorCollapsibleSectionKey[] = [
  'objectives',
  'keyPoints',
  'process',
  'blackboard',
  'reflection',
]

const EDITOR_VIEW_PREFERENCE_STORAGE_KEY = 'editor-view-preference-v1'

const EDITOR_SECTION_ORDER: EditorSectionKey[] = [
  'basic',
  'objectives',
  'keyPoints',
  'process',
  'blackboard',
  'reflection',
]

const EDITOR_LAYOUT_TAB_ORDER: EditorLayoutTabKey[] = ['basic', 'design', 'process', 'review']
const EDITOR_LAYOUT_SHORTCUT_HINTS: readonly EditorLayoutShortcutHint[] = [
  { key: '1', tab: 'basic', label: '基础信息' },
  { key: '2', tab: 'design', label: '教学设计' },
  { key: '3', tab: 'process', label: '课堂流程' },
  { key: '4', tab: 'review', label: '课后沉淀' },
] as const

export const normalizeEditorLayoutTab = (value: string): EditorLayoutTabKey =>
  EDITOR_LAYOUT_TAB_ORDER.includes(value as EditorLayoutTabKey)
    ? (value as EditorLayoutTabKey)
    : 'basic'

export const resolveEditorLayoutTabByShortcutKey = (
  key: string
): EditorLayoutTabKey | null =>
  EDITOR_LAYOUT_SHORTCUT_HINTS.find((item) => item.key === key)?.tab || null

const EDITOR_LAYOUT_TABS: readonly EditorLayoutTabMeta[] = [
  { id: 'basic', label: '基础信息', description: '标题、课程班级、课时与方法资源' },
  { id: 'design', label: '教学设计', description: '教学目标与重点难点' },
  { id: 'process', label: '课堂流程', description: '教学过程与时间轴草案' },
  { id: 'review', label: '课后沉淀', description: '板书设计与教学反思' },
] as const

const EDITOR_LAYOUT_TAB_SECTIONS: Record<EditorLayoutTabKey, EditorSectionKey[]> = {
  basic: ['basic'],
  design: ['objectives', 'keyPoints'],
  process: ['process'],
  review: ['blackboard', 'reflection'],
}

const EDITOR_SECTION_TO_LAYOUT_TAB: Record<EditorSectionKey, EditorLayoutTabKey> = {
  basic: 'basic',
  objectives: 'design',
  keyPoints: 'design',
  process: 'process',
  blackboard: 'review',
  reflection: 'review',
}

const TEMPLATE_EDIT_TABS: readonly TemplateEditTabMeta[] = [
  {
    id: 'basic',
    label: '基础',
    description: '标题、课程班级、课时与标签',
    fields: ['title', 'courseName', 'className', 'duration', 'methods', 'resources'],
  },
  {
    id: 'design',
    label: '教学设计',
    description: '教学目标与重点难点',
    fields: ['objectives', 'keyPoints'],
  },
  {
    id: 'process',
    label: '流程',
    description: '教学过程正文',
    fields: ['process'],
  },
  {
    id: 'review',
    label: '复盘',
    description: '板书设计与教学反思',
    fields: ['blackboard', 'reflection'],
  },
] as const

export const normalizeEditorCollapsibleSections = (
  sections: string[]
): EditorCollapsibleSectionKey[] => {
  const normalized: EditorCollapsibleSectionKey[] = []
  for (const section of sections) {
    if (!EDITOR_COLLAPSIBLE_SECTIONS.includes(section as EditorCollapsibleSectionKey)) {
      continue
    }
    if (normalized.includes(section as EditorCollapsibleSectionKey)) {
      continue
    }
    normalized.push(section as EditorCollapsibleSectionKey)
  }
  return normalized
}

export const parseEditorViewPreference = (
  raw: string | null
): EditorViewPreference | null => {
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    const payload = parsed as Record<string, unknown>
    if (typeof payload.focusMode !== 'boolean') {
      return null
    }
    if (!Array.isArray(payload.collapsedSections)) {
      return null
    }
    const activeLayoutTab =
      typeof payload.activeLayoutTab === 'string'
        ? normalizeEditorLayoutTab(payload.activeLayoutTab)
        : 'basic'
    const collapsedSections = normalizeEditorCollapsibleSections(
      payload.collapsedSections.filter((item): item is string => typeof item === 'string')
    )
    return {
      focusMode: payload.focusMode,
      collapsedSections,
      activeLayoutTab,
    }
  } catch {
    return null
  }
}

export const serializeEditorViewPreference = (
  preference: EditorViewPreference
): string =>
  JSON.stringify({
    focusMode: Boolean(preference.focusMode),
    collapsedSections: normalizeEditorCollapsibleSections(preference.collapsedSections),
    activeLayoutTab: normalizeEditorLayoutTab(preference.activeLayoutTab),
  })

const EDITOR_REQUIRED_COMPLETION_LABELS = new Set([
  '教案标题',
  '课程名称',
  '授课班级',
  '课时长度',
  '教学目标',
  '教学过程',
])

const EDITOR_LABEL_TO_SECTION_KEY: Record<string, EditorSectionKey> = {
  教案标题: 'basic',
  课程名称: 'basic',
  授课班级: 'basic',
  课时长度: 'basic',
  教学方法: 'basic',
  教学资源: 'basic',
  教学目标: 'objectives',
  教学重点: 'keyPoints',
  教学过程: 'process',
  板书设计: 'blackboard',
  教学反思: 'reflection',
}

const EDITOR_LESSON_SKELETONS: Record<EditorLessonSkeletonPreset, EditorLessonSkeletonDefinition> = {
  lecture: {
    label: '理论讲授',
    description: '适合概念讲解与知识建构',
    patch: {
      methods: '讲授法、提问法',
      resources: 'PPT、板书',
      objectives: '<p>理解核心概念，能够完成基础知识复述与简单应用。</p>',
      keyPoints: '<p>重点：核心概念与关键步骤；难点：概念迁移与应用。</p>',
      process: '<p>导入（5分钟）→ 新知讲解（30分钟）→ 例题演示（20分钟）→ 课堂练习（25分钟）→ 小结与作业（10分钟）。</p>',
      blackboard: '<p>一、核心概念<br/>二、关键步骤<br/>三、典型例题</p>',
      reflection: '<p>关注讲解节奏与学生提问点，课后根据练习结果调整下次讲解深度。</p>',
    },
  },
  practice: {
    label: '项目实训',
    description: '适合任务驱动与分组协作',
    patch: {
      methods: '任务驱动法、分组协作法',
      resources: '任务单、示例代码、实训环境',
      objectives: '<p>完成指定项目任务，能够在小组协作中产出可运行成果并进行汇报。</p>',
      keyPoints: '<p>重点：任务拆解与协作分工；难点：问题排查与成果整合。</p>',
      process: '<p>任务发布（10分钟）→ 小组分工（10分钟）→ 分阶段实操（45分钟）→ 成果展示（15分钟）→ 讲评与改进（10分钟）。</p>',
      blackboard: '<p>任务目标｜分工角色｜验收标准</p>',
      reflection: '<p>记录小组协作瓶颈，优化下一轮任务难度梯度与时间分配。</p>',
    },
  },
  lab: {
    label: '实验课',
    description: '适合流程化实验操作与结果分析',
    patch: {
      methods: '实验演示法、操作指导法',
      resources: '实验设备、实验报告模板、安全规范',
      objectives: '<p>掌握实验流程与关键操作，能够完成数据记录并进行结果分析。</p>',
      keyPoints: '<p>重点：实验步骤与数据记录；难点：误差分析与结论归纳。</p>',
      process: '<p>实验说明与安全提示（10分钟）→ 教师演示（10分钟）→ 学生分组实验（50分钟）→ 数据分析与结论（15分钟）→ 讲评（5分钟）。</p>',
      blackboard: '<p>实验目的｜实验步骤｜数据记录｜误差分析</p>',
      reflection: '<p>关注实验器材准备与安全执行情况，补充高频错误案例。</p>',
    },
  },
}

const EDITOR_PROCESS_TIMELINE_PRESETS: Record<EditorProcessTimelinePreset, EditorProcessTimelineDefinition> = {
  balanced: {
    label: '标准四段',
    description: '导入、讲解、练习、总结均衡分配课时',
    steps: [
      { label: '导入', weight: 0.12 },
      { label: '新知讲解', weight: 0.43 },
      { label: '任务练习', weight: 0.3 },
      { label: '总结反馈', weight: 0.15 },
    ],
  },
  lecture: {
    label: '讲授导向',
    description: '加大讲解比例，适合理论知识建构',
    steps: [
      { label: '导入', weight: 0.1 },
      { label: '新知讲解', weight: 0.55 },
      { label: '课堂练习', weight: 0.23 },
      { label: '小结作业', weight: 0.12 },
    ],
  },
  practice: {
    label: '实训导向',
    description: '强化实践环节，适合任务驱动课堂',
    steps: [
      { label: '任务发布', weight: 0.12 },
      { label: '分组协作', weight: 0.2 },
      { label: '实操完成', weight: 0.5 },
      { label: '展示讲评', weight: 0.18 },
    ],
  },
}

const EDITOR_DRAFT_DIFF_FIELDS: Array<{ key: EditorDraftComparableField; label: string; richText?: boolean }> = [
  { key: 'title', label: '教案标题' },
  { key: 'courseName', label: '课程名称' },
  { key: 'className', label: '授课班级' },
  { key: 'duration', label: '课时长度' },
  { key: 'methods', label: '教学方法' },
  { key: 'resources', label: '教学资源' },
  { key: 'objectives', label: '教学目标', richText: true },
  { key: 'keyPoints', label: '教学重点', richText: true },
  { key: 'process', label: '教学过程', richText: true },
  { key: 'blackboard', label: '板书设计', richText: true },
  { key: 'reflection', label: '教学反思', richText: true },
]

const normalizeDraftFieldValue = (
  form: EditorPlanForm,
  field: { key: EditorDraftComparableField; richText?: boolean }
): string => {
  const raw = form[field.key]
  if (field.key === 'duration') {
    return String(raw ?? '')
  }

  const text = typeof raw === 'string' ? raw : ''
  if (field.richText) {
    return htmlToText(text)
  }
  return text.trim()
}

const previewDraftFieldValue = (value: string, maxLength = 36): string => {
  const text = value.trim()
  if (!text) {
    return '（空）'
  }
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength)}...`
}

const EDITOR_COMPLETION_FIELDS: Array<{
  key: EditorDraftComparableField
  label: string
  richText?: boolean
}> = [
  { key: 'title', label: '教案标题' },
  { key: 'courseName', label: '课程名称' },
  { key: 'className', label: '授课班级' },
  { key: 'duration', label: '课时长度' },
  { key: 'methods', label: '教学方法' },
  { key: 'resources', label: '教学资源' },
  { key: 'objectives', label: '教学目标', richText: true },
  { key: 'keyPoints', label: '教学重点', richText: true },
  { key: 'process', label: '教学过程', richText: true },
  { key: 'blackboard', label: '板书设计', richText: true },
  { key: 'reflection', label: '教学反思', richText: true },
]

const EDITOR_SECTION_COMPLETION_FIELDS: Record<
  EditorSectionKey,
  Array<{
    key: EditorDraftComparableField
    label: string
    richText?: boolean
    required?: boolean
  }>
> = {
  basic: [
    { key: 'title', label: '教案标题', required: true },
    { key: 'courseName', label: '课程名称', required: true },
    { key: 'className', label: '授课班级', required: true },
    { key: 'duration', label: '课时长度', required: true },
    { key: 'methods', label: '教学方法' },
    { key: 'resources', label: '教学资源' },
  ],
  objectives: [{ key: 'objectives', label: '教学目标', richText: true, required: true }],
  keyPoints: [{ key: 'keyPoints', label: '教学重点', richText: true }],
  process: [{ key: 'process', label: '教学过程', richText: true, required: true }],
  blackboard: [{ key: 'blackboard', label: '板书设计', richText: true }],
  reflection: [{ key: 'reflection', label: '教学反思', richText: true }],
}

const isEditorCompletionFieldFilled = (
  form: EditorPlanForm,
  field: { key: EditorDraftComparableField; richText?: boolean }
): boolean => {
  const raw = form[field.key]
  if (field.key === 'duration') {
    return Number(raw) > 0
  }

  if (typeof raw !== 'string') {
    return false
  }

  if (field.richText) {
    return Boolean(htmlToText(raw).trim())
  }

  return Boolean(raw.trim())
}

const isEditorPlanFieldEmpty = (form: EditorPlanForm, field: EditorDraftComparableField): boolean => {
  const raw = form[field]
  if (field === 'duration') {
    return Number(raw) <= 0
  }
  if (typeof raw !== 'string') {
    return true
  }

  const isRichTextField = EDITOR_COMPLETION_FIELDS.find((item) => item.key === field)?.richText
  if (isRichTextField) {
    return !htmlToText(raw).trim()
  }
  return !raw.trim()
}

export const resolveEditorSectionLabel = (section: EditorSectionKey): string =>
  EDITOR_SECTION_LABELS[section]

export const resolveEditorSectionElementId = (section: EditorSectionKey): string =>
  EDITOR_SECTION_ELEMENT_IDS[section]

export const resolveEditorLayoutTabBySection = (
  section: EditorSectionKey
): EditorLayoutTabKey => EDITOR_SECTION_TO_LAYOUT_TAB[section]

export const resolveEditorSectionForLayoutTab = (
  tab: EditorLayoutTabKey,
  currentSection: EditorSectionKey
): EditorSectionKey => {
  const sections = EDITOR_LAYOUT_TAB_SECTIONS[tab]
  if (sections.includes(currentSection)) {
    return currentSection
  }
  return sections[0]
}

export const buildEditorLayoutTabSummaries = (
  sections: EditorSectionCompletionItem[]
): EditorLayoutTabSummary[] =>
  EDITOR_LAYOUT_TABS.map((tab) => {
    const sectionSet = new Set(EDITOR_LAYOUT_TAB_SECTIONS[tab.id])
    const sectionItems = sections.filter((item) => sectionSet.has(item.section))
    return {
      ...tab,
      filledCount: sectionItems.reduce((sum, item) => sum + item.filledCount, 0),
      totalCount: sectionItems.reduce((sum, item) => sum + item.totalCount, 0),
      requiredMissingCount: sectionItems.reduce(
        (sum, item) => sum + item.requiredMissingLabels.length,
        0
      ),
    }
  })

export const shouldShowEditorTemplatePanel = (
  showTemplatePanel: boolean,
  isFocusMode: boolean
): boolean => showTemplatePanel && !isFocusMode

export const isEditorSectionCollapsedInState = (
  collapsedSections: EditorCollapsibleSectionKey[],
  section: EditorSectionKey
): boolean => collapsedSections.includes(section as EditorCollapsibleSectionKey)

export const setEditorSectionCollapsedState = (
  collapsedSections: EditorCollapsibleSectionKey[],
  section: EditorSectionKey,
  collapsed: boolean
): EditorCollapsibleSectionKey[] => {
  if (!EDITOR_COLLAPSIBLE_SECTIONS.includes(section as EditorCollapsibleSectionKey)) {
    return collapsedSections
  }

  const normalized = collapsedSections.filter((item) =>
    EDITOR_COLLAPSIBLE_SECTIONS.includes(item)
  )

  if (collapsed) {
    if (normalized.includes(section as EditorCollapsibleSectionKey)) {
      return normalized
    }
    return [...normalized, section as EditorCollapsibleSectionKey]
  }

  return normalized.filter((item) => item !== section)
}

export const toggleEditorSectionCollapsedState = (
  collapsedSections: EditorCollapsibleSectionKey[],
  section: EditorSectionKey
): EditorCollapsibleSectionKey[] =>
  setEditorSectionCollapsedState(
    collapsedSections,
    section,
    !isEditorSectionCollapsedInState(collapsedSections, section)
  )

export const resolveEditorLessonSkeletonOptions = (): Array<{
  id: EditorLessonSkeletonPreset
  label: string
  description: string
}> =>
  (Object.keys(EDITOR_LESSON_SKELETONS) as EditorLessonSkeletonPreset[]).map((id) => ({
    id,
    label: EDITOR_LESSON_SKELETONS[id].label,
    description: EDITOR_LESSON_SKELETONS[id].description,
  }))

export const resolveEditorLessonSkeletonLabel = (preset: EditorLessonSkeletonPreset): string =>
  EDITOR_LESSON_SKELETONS[preset].label

export const resolveEditorProcessTimelineOptions = (): Array<{
  id: EditorProcessTimelinePreset
  label: string
  description: string
}> =>
  (Object.keys(EDITOR_PROCESS_TIMELINE_PRESETS) as EditorProcessTimelinePreset[]).map((id) => ({
    id,
    label: EDITOR_PROCESS_TIMELINE_PRESETS[id].label,
    description: EDITOR_PROCESS_TIMELINE_PRESETS[id].description,
  }))

export const recommendEditorLessonSkeletonPreset = (
  courseName: string
): EditorLessonSkeletonPreset => {
  const keyword = courseName.trim().toLocaleLowerCase('zh-CN')
  if (!keyword) {
    return 'lecture'
  }
  if (keyword.includes('实验') || keyword.includes('机房')) {
    return 'lab'
  }
  if (keyword.includes('实训') || keyword.includes('项目') || keyword.includes('实践')) {
    return 'practice'
  }
  return 'lecture'
}

export const applyEditorLessonSkeleton = (
  form: EditorPlanForm,
  preset: EditorLessonSkeletonPreset,
  mode: EditorLessonSkeletonApplyMode
): EditorPlanForm => {
  const skeleton = EDITOR_LESSON_SKELETONS[preset]
  const next = {
    ...form,
    contentJson: { ...form.contentJson },
  } as EditorPlanForm

  const patchEntries = Object.entries(skeleton.patch) as Array<[EditorDraftComparableField, string | number]>
  for (const [field, value] of patchEntries) {
    if (mode === 'fill-empty' && !isEditorPlanFieldEmpty(next, field)) {
      continue
    }
    ;(next as Record<string, unknown>)[field] = value
  }

  return next
}

export const allocateEditorTimelineMinutes = (duration: number, weights: number[]): number[] => {
  const safeDuration = Math.max(0, Math.round(duration))
  if (!weights.length) {
    return []
  }
  if (safeDuration <= 0) {
    return weights.map(() => 0)
  }

  const safeWeights = weights.map((weight) => (Number.isFinite(weight) && weight > 0 ? weight : 1))
  const sumWeight = safeWeights.reduce((sum, weight) => sum + weight, 0) || safeWeights.length
  const rawValues = safeWeights.map((weight) => (weight / sumWeight) * safeDuration)
  const minutes = rawValues.map((value) => Math.floor(value))

  if (safeDuration >= minutes.length) {
    for (let index = 0; index < minutes.length; index += 1) {
      if (minutes[index] === 0) {
        minutes[index] = 1
      }
    }
  }

  const order = rawValues
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
    .map((item) => item.index)

  const minPerStep = safeDuration >= minutes.length ? 1 : 0
  let diff = safeDuration - minutes.reduce((sum, value) => sum + value, 0)
  let cursor = 0

  while (diff > 0) {
    const targetIndex = order[cursor % order.length]
    minutes[targetIndex] += 1
    diff -= 1
    cursor += 1
  }

  cursor = 0
  while (diff < 0) {
    const targetIndex = order[cursor % order.length]
    if (minutes[targetIndex] > minPerStep) {
      minutes[targetIndex] -= 1
      diff += 1
    }
    cursor += 1
    if (cursor > order.length * 5 && diff < 0) {
      break
    }
  }

  return minutes
}

export const buildEditorProcessTimelineHtml = (
  duration: number,
  preset: EditorProcessTimelinePreset
): string => {
  const steps = buildEditorTimelineStepsFromPreset(duration, preset)
  return buildEditorTimelineProcessHtmlFromSteps(steps)
}

export const buildEditorTimelineStepsFromPreset = (
  duration: number,
  preset: EditorProcessTimelinePreset
): EditorTimelineStep[] => {
  const definition = EDITOR_PROCESS_TIMELINE_PRESETS[preset]
  const minutes = allocateEditorTimelineMinutes(
    duration,
    definition.steps.map((step) => step.weight)
  )
  return definition.steps.map((step, index) => ({
    label: step.label,
    minutes: minutes[index] || 0,
  }))
}

export const buildEditorTimelineProcessHtmlFromSteps = (steps: EditorTimelineStep[]): string => {
  const segments = steps
    .map((step) => ({
      label: step.label.trim(),
      minutes: Number.isFinite(step.minutes) ? Math.max(0, Math.round(step.minutes)) : 0,
    }))
    .filter((step) => step.label)

  if (!segments.length) {
    return '<p></p>'
  }

  return `<p>${segments.map((step) => `${step.label}（${step.minutes}分钟）`).join('→')}</p>`
}

export const alignEditorTimelineStepsToDuration = (
  steps: EditorTimelineStep[],
  duration: number
): EditorTimelineStep[] => {
  if (!steps.length) {
    return []
  }
  const safeDuration = Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : 0
  const baseWeights = steps.map((step) => {
    const minutes = Number.isFinite(step.minutes) ? Math.max(0, step.minutes) : 0
    return minutes
  })
  const hasPositive = baseWeights.some((value) => value > 0)
  const weights = hasPositive ? baseWeights : steps.map(() => 1)
  const alignedMinutes = allocateEditorTimelineMinutes(safeDuration, weights)
  return steps.map((step, index) => ({
    label: step.label,
    minutes: alignedMinutes[index] || 0,
  }))
}

export const normalizeEditorTimelineDraftSteps = (
  steps: Array<Pick<EditorTimelineDraftStep, 'label' | 'minutes'>>
): EditorTimelineStep[] =>
  steps
    .map((step) => ({
      label: step.label.trim(),
      minutes: Math.max(0, Math.round(step.minutes || 0)),
    }))
    .filter((step) => step.label)

export const buildEditorTimelineApplyPreview = (
  currentProcessHtml: string,
  steps: Array<Pick<EditorTimelineDraftStep, 'label' | 'minutes'>>,
  mode: EditorProcessTimelineApplyMode
): EditorTimelineApplyPreview => {
  const normalizedSteps = normalizeEditorTimelineDraftSteps(steps)
  const canApply = normalizedSteps.length > 0
  const timelineHtml = canApply ? buildEditorTimelineProcessHtmlFromSteps(normalizedSteps) : ''
  const nextProcessHtml =
    mode === 'append' && htmlToText(currentProcessHtml).trim()
      ? `${currentProcessHtml}${timelineHtml}`
      : timelineHtml
  const currentTextLength = htmlToText(currentProcessHtml).trim().length
  const nextTextLength = htmlToText(nextProcessHtml).trim().length
  return {
    mode,
    canApply,
    normalizedSteps,
    stepCount: normalizedSteps.length,
    minuteTotal: normalizedSteps.reduce((sum, step) => sum + step.minutes, 0),
    currentTextLength,
    nextTextLength,
    nextProcessHtml,
    nextProcessPreviewText: htmlToText(nextProcessHtml).trim().slice(0, 220),
  }
}

export const applyEditorTimelineStepsToForm = (
  form: EditorPlanForm,
  steps: EditorTimelineStep[],
  mode: EditorProcessTimelineApplyMode
): EditorPlanForm => {
  const timelineHtml = buildEditorTimelineProcessHtmlFromSteps(steps)
  const nextContentJson = { ...form.contentJson }
  delete nextContentJson.process

  if (mode === 'append' && htmlToText(form.process).trim()) {
    return {
      ...form,
      process: `${form.process}${timelineHtml}`,
      contentJson: nextContentJson,
    }
  }

  return {
    ...form,
    process: timelineHtml,
    contentJson: nextContentJson,
  }
}

export const moveEditorTimelineSteps = <T extends { id: string }>(
  steps: T[],
  id: string,
  direction: EditorTimelineMoveDirection
): T[] => {
  const currentIndex = steps.findIndex((step) => step.id === id)
  if (currentIndex < 0) {
    return steps
  }
  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (nextIndex < 0 || nextIndex >= steps.length) {
    return steps
  }
  const next = [...steps]
  const [target] = next.splice(currentIndex, 1)
  next.splice(nextIndex, 0, target)
  return next
}

export const reorderEditorTimelineSteps = <T extends { id: string }>(
  steps: T[],
  sourceId: string,
  targetId: string
): T[] => {
  const sourceIndex = steps.findIndex((step) => step.id === sourceId)
  const targetIndex = steps.findIndex((step) => step.id === targetId)
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return steps
  }
  const next = [...steps]
  const [source] = next.splice(sourceIndex, 1)
  const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
  next.splice(adjustedTargetIndex, 0, source)
  return next
}

export const isEditorTimelineStepCollapsedState = (
  collapsedStepIds: string[],
  id: string
): boolean => collapsedStepIds.includes(id)

export const toggleEditorTimelineStepCollapsedState = (
  collapsedStepIds: string[],
  id: string
): string[] =>
  collapsedStepIds.includes(id)
    ? collapsedStepIds.filter((item) => item !== id)
    : [...collapsedStepIds, id]

export const normalizeEditorTimelineStepCollapsedState = (
  collapsedStepIds: string[],
  steps: Array<{ id: string }>
): string[] => {
  const idSet = new Set(steps.map((step) => step.id))
  const next: string[] = []
  for (const id of collapsedStepIds) {
    if (!idSet.has(id) || next.includes(id)) {
      continue
    }
    next.push(id)
  }
  return next
}

export const areAllEditorTimelineStepsCollapsed = (
  collapsedStepIds: string[],
  steps: Array<{ id: string }>
): boolean => {
  if (!steps.length) {
    return false
  }
  const normalized = normalizeEditorTimelineStepCollapsedState(collapsedStepIds, steps)
  return steps.every((step) => normalized.includes(step.id))
}

export const toggleAllEditorTimelineStepCollapsedState = (
  collapsedStepIds: string[],
  steps: Array<{ id: string }>
): string[] => {
  if (areAllEditorTimelineStepsCollapsed(collapsedStepIds, steps)) {
    return []
  }
  return steps.map((step) => step.id)
}

export const isEditorTimelineStepSelectedState = (
  selectedStepIds: string[],
  id: string
): boolean => selectedStepIds.includes(id)

export const toggleEditorTimelineStepSelectedState = (
  selectedStepIds: string[],
  id: string
): string[] =>
  selectedStepIds.includes(id)
    ? selectedStepIds.filter((item) => item !== id)
    : [...selectedStepIds, id]

export const normalizeEditorTimelineStepSelectedState = (
  selectedStepIds: string[],
  steps: Array<{ id: string }>
): string[] => {
  const idSet = new Set(steps.map((step) => step.id))
  const next: string[] = []
  for (const id of selectedStepIds) {
    if (!idSet.has(id) || next.includes(id)) {
      continue
    }
    next.push(id)
  }
  return next
}

export const areAllEditorTimelineStepsSelected = (
  selectedStepIds: string[],
  steps: Array<{ id: string }>
): boolean => {
  if (!steps.length) {
    return false
  }
  const normalized = normalizeEditorTimelineStepSelectedState(selectedStepIds, steps)
  return steps.every((step) => normalized.includes(step.id))
}

export const toggleAllEditorTimelineStepSelectedState = (
  selectedStepIds: string[],
  steps: Array<{ id: string }>
): string[] => {
  if (areAllEditorTimelineStepsSelected(selectedStepIds, steps)) {
    return []
  }
  return steps.map((step) => step.id)
}

export const removeSelectedEditorTimelineSteps = <T extends { id: string }>(
  steps: T[],
  selectedStepIds: string[]
): T[] => {
  const selectedSet = new Set(selectedStepIds)
  if (!selectedSet.size || selectedSet.size >= steps.length) {
    return steps
  }
  return steps.filter((step) => !selectedSet.has(step.id))
}

export const redistributeEditorTimelineSelectedStepMinutes = <T extends { id: string; minutes: number }>(
  steps: T[],
  selectedStepIds: string[]
): T[] => {
  const selectedSet = new Set(selectedStepIds)
  const selectedSteps = steps.filter((step) => selectedSet.has(step.id))
  if (selectedSteps.length < 2) {
    return steps
  }

  const totalMinutes = selectedSteps.reduce(
    (sum, step) => sum + Math.max(0, Math.round(step.minutes || 0)),
    0
  )
  const distributed = allocateEditorTimelineMinutes(
    totalMinutes,
    selectedSteps.map(() => 1)
  )
  let distributedIndex = 0
  return steps.map((step) => {
    if (!selectedSet.has(step.id)) {
      return step
    }
    const minutes = distributed[distributedIndex] ?? 0
    distributedIndex += 1
    return {
      ...step,
      minutes,
    }
  })
}

export const redistributeEditorTimelineSelectedStepMinutesToDuration = <
  T extends { id: string; minutes: number }
>(
  steps: T[],
  selectedStepIds: string[],
  duration: number
): T[] => {
  const selectedSet = new Set(selectedStepIds)
  if (!selectedSet.size) {
    return steps
  }

  const safeDuration = Math.max(0, Math.round(duration || 0))
  const selectedSteps = steps.filter((step) => selectedSet.has(step.id))
  const fixedMinutes = steps
    .filter((step) => !selectedSet.has(step.id))
    .reduce((sum, step) => sum + Math.max(0, Math.round(step.minutes || 0)), 0)
  const selectedTargetTotal = Math.max(0, safeDuration - fixedMinutes)
  const selectedWeights = selectedSteps.map((step) => Math.max(0, Math.round(step.minutes || 0)))
  const hasPositiveWeight = selectedWeights.some((weight) => weight > 0)
  const distributed = allocateEditorTimelineMinutes(
    selectedTargetTotal,
    hasPositiveWeight ? selectedWeights : selectedSteps.map(() => 1)
  )

  let distributedIndex = 0
  return steps.map((step) => {
    if (!selectedSet.has(step.id)) {
      return step
    }
    const minutes = distributed[distributedIndex] ?? 0
    distributedIndex += 1
    return {
      ...step,
      minutes,
    }
  })
}

export const adjustEditorTimelineSelectedStepMinutes = <
  T extends { id: string; minutes: number }
>(
  steps: T[],
  selectedStepIds: string[],
  deltaMinutes: number
): T[] => {
  const selectedSet = new Set(selectedStepIds)
  if (!selectedSet.size || !deltaMinutes) {
    return steps
  }
  return steps.map((step) => {
    if (!selectedSet.has(step.id)) {
      return step
    }
    return {
      ...step,
      minutes: Math.max(0, Math.round((step.minutes || 0) + deltaMinutes)),
    }
  })
}

export const autofillEditorTimelineDraftStepLabels = <
  T extends { id: string; label: string }
>(
  steps: T[],
  selectedStepIds: string[]
): T[] => {
  const selectedSet = new Set(selectedStepIds)
  return steps.map((step, index) => {
    if (selectedSet.size > 0 && !selectedSet.has(step.id)) {
      return step
    }
    if (step.label.trim()) {
      return step
    }
    return {
      ...step,
      label: `环节${index + 1}`,
    }
  })
}

const splitEditorTimelinePreviewDiffLines = (html: string): string[] =>
  htmlToText(html)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)

export const buildEditorTimelineApplyPreviewDiff = (
  currentProcessHtml: string,
  nextProcessHtml: string
): EditorTimelineApplyPreviewDiff => {
  const beforeLines = splitEditorTimelinePreviewDiffLines(currentProcessHtml)
  const afterLines = splitEditorTimelinePreviewDiffLines(nextProcessHtml)

  const beforeMatchCounts = new Map<string, number>()
  for (const line of beforeLines) {
    beforeMatchCounts.set(line, (beforeMatchCounts.get(line) || 0) + 1)
  }
  const afterMatchCounts = new Map<string, number>()
  for (const line of afterLines) {
    afterMatchCounts.set(line, (afterMatchCounts.get(line) || 0) + 1)
  }

  const before: EditorTimelinePreviewDiffSegment[] = beforeLines.map((line, index) => {
    const count = afterMatchCounts.get(line) || 0
    if (count > 0) {
      afterMatchCounts.set(line, count - 1)
      return {
        key: `before-${index}-${line}`,
        text: line,
        changed: false,
      }
    }
    return {
      key: `before-${index}-${line}`,
      text: line,
      changed: true,
    }
  })

  const after: EditorTimelinePreviewDiffSegment[] = afterLines.map((line, index) => {
    const count = beforeMatchCounts.get(line) || 0
    if (count > 0) {
      beforeMatchCounts.set(line, count - 1)
      return {
        key: `after-${index}-${line}`,
        text: line,
        changed: false,
      }
    }
    return {
      key: `after-${index}-${line}`,
      text: line,
      changed: true,
    }
  })

  const changedCount = before.filter((item) => item.changed).length + after.filter((item) => item.changed).length
  return {
    before,
    after,
    changedCount,
  }
}

export const cloneEditorTimelineDraftSteps = (
  steps: EditorTimelineDraftStep[]
): EditorTimelineDraftStep[] =>
  steps.map((step) => ({
    id: step.id,
    label: step.label,
    minutes: step.minutes,
  }))

export const hasEditorTimelineDraftStepChanges = (
  previous: EditorTimelineDraftStep[],
  next: EditorTimelineDraftStep[]
): boolean => {
  if (previous.length !== next.length) {
    return true
  }
  for (let index = 0; index < previous.length; index += 1) {
    const prevStep = previous[index]
    const nextStep = next[index]
    if (!nextStep) {
      return true
    }
    if (
      prevStep.id !== nextStep.id
      || prevStep.label !== nextStep.label
      || prevStep.minutes !== nextStep.minutes
    ) {
      return true
    }
  }
  return false
}

export const pushEditorTimelineDraftUndoStack = (
  undoStack: EditorTimelineDraftStep[][],
  previous: EditorTimelineDraftStep[],
  next: EditorTimelineDraftStep[],
  limit = 40
): EditorTimelineDraftStep[][] => {
  if (!hasEditorTimelineDraftStepChanges(previous, next)) {
    return undoStack
  }
  const nextStack = [...undoStack, cloneEditorTimelineDraftSteps(previous)]
  if (nextStack.length <= limit) {
    return nextStack
  }
  return nextStack.slice(nextStack.length - limit)
}

export const applyEditorProcessTimeline = (
  form: EditorPlanForm,
  preset: EditorProcessTimelinePreset,
  mode: EditorProcessTimelineApplyMode
): EditorPlanForm => {
  return applyEditorTimelineStepsToForm(
    form,
    buildEditorTimelineStepsFromPreset(form.duration, preset),
    mode
  )
}

export const mapEditorMissingLabelsToFocusSections = (labels: string[]): EditorSectionKey[] => {
  const sections: EditorSectionKey[] = []
  for (const label of labels) {
    const section = EDITOR_LABEL_TO_SECTION_KEY[label]
    if (!section || sections.includes(section)) {
      continue
    }
    sections.push(section)
  }
  return sections
}

export const buildEditorDraftDiffSummary = (
  current: EditorPlanForm,
  draft: EditorLocalDraft | null
): EditorDraftDiffSummary => {
  if (!draft) {
    return { changedCount: 0, items: [] }
  }

  const items: EditorDraftDiffItem[] = []

  for (const field of EDITOR_DRAFT_DIFF_FIELDS) {
    const currentNormalized = normalizeDraftFieldValue(current, field)
    const draftNormalized = normalizeDraftFieldValue(draft.form, field)
    if (currentNormalized === draftNormalized) {
      continue
    }

    items.push({
      field: field.key,
      label: field.label,
      currentPreview: previewDraftFieldValue(currentNormalized),
      draftPreview: previewDraftFieldValue(draftNormalized),
    })
  }

  return {
    changedCount: items.length,
    items,
  }
}

export const buildEditorCompletionSummary = (
  form: EditorPlanForm
): EditorCompletionSummary => {
  const missingLabels: string[] = []
  let filledCount = 0

  for (const field of EDITOR_COMPLETION_FIELDS) {
    if (isEditorCompletionFieldFilled(form, field)) {
      filledCount += 1
      continue
    }
    missingLabels.push(field.label)
  }

  const totalCount = EDITOR_COMPLETION_FIELDS.length
  const score = Math.round((filledCount / Math.max(1, totalCount)) * 100)
  return {
    score,
    filledCount,
    totalCount,
    missingLabels,
  }
}

export const buildEditorSectionCompletion = (
  form: EditorPlanForm
): EditorSectionCompletionItem[] =>
  EDITOR_SECTION_ORDER.map((section) => {
    const fields = EDITOR_SECTION_COMPLETION_FIELDS[section]
    let filledCount = 0
    const requiredMissingLabels: string[] = []

    for (const field of fields) {
      const filled = isEditorCompletionFieldFilled(form, field)
      if (filled) {
        filledCount += 1
      } else if (field.required) {
        requiredMissingLabels.push(field.label)
      }
    }

    const totalCount = fields.length
    const status: EditorSectionCompletionItem['status'] =
      filledCount === 0 ? 'empty' : filledCount === totalCount ? 'complete' : 'partial'

    return {
      section,
      label: resolveEditorSectionLabel(section),
      filledCount,
      totalCount,
      requiredMissingLabels,
      status,
      progress: Math.round((filledCount / Math.max(1, totalCount)) * 100),
    }
  })

export const resolveNextIncompleteEditorSection = (
  items: EditorSectionCompletionItem[]
): EditorSectionKey | null => {
  for (const item of items) {
    if (item.requiredMissingLabels.length > 0) {
      return item.section
    }
  }
  return null
}

export const resolveActiveEditorSectionFromViewport = (
  positions: EditorSectionViewportPosition[],
  current: EditorSectionKey | null,
  anchor = 160
): EditorSectionKey | null => {
  if (!positions.length) {
    return current
  }
  const safeAnchor = Number.isFinite(anchor) ? anchor : 160
  const ordered = [...positions].sort((a, b) => a.top - b.top)
  const passed = ordered.filter((item) => item.top <= safeAnchor)
  if (passed.length > 0) {
    return passed[passed.length - 1].section
  }
  return ordered[0]?.section ?? current
}

export const sumEditorProcessMinutes = (processHtml: string): number => {
  const text = htmlToText(processHtml)
  const regex = /(\d+)\s*分钟/g
  let total = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    total += Number(match[1]) || 0
  }
  return total
}

export const buildEditorQualityTips = (form: EditorPlanForm): EditorQualityTip[] => {
  const tips: EditorQualityTip[] = []
  const objectivesLength = htmlToText(form.objectives).trim().length
  const processLength = htmlToText(form.process).trim().length
  const reflectionLength = htmlToText(form.reflection).trim().length
  const processMinutesTotal = sumEditorProcessMinutes(form.process)

  if (objectivesLength > 0 && objectivesLength < 20) {
    tips.push({
      level: 'warning',
      message: '教学目标建议不少于20字，便于评估学习达成度。',
    })
  }
  if (processLength > 0 && processLength < 40) {
    tips.push({
      level: 'warning',
      message: '教学过程建议包含关键环节与时间安排。',
    })
  }
  if (processMinutesTotal > 0 && form.duration > 0) {
    const diff = Math.abs(processMinutesTotal - form.duration)
    if (diff >= 10) {
      tips.push({
        level: 'warning',
        message: `教学过程时间合计约${processMinutesTotal}分钟，与课时长度${form.duration}分钟存在偏差。`,
      })
    }
  }
  if (!form.methods.trim() && !form.resources.trim()) {
    tips.push({
      level: 'suggestion',
      message: '建议补充教学方法或教学资源，提升可执行性。',
    })
  }
  if (reflectionLength === 0) {
    tips.push({
      level: 'suggestion',
      message: '建议补充教学反思，便于课后复盘改进。',
    })
  }

  return tips
}

export const buildEditorExportPrecheck = (
  completion: EditorCompletionSummary,
  qualityTips: EditorQualityTip[]
): EditorExportPrecheckReport => {
  const requiredMissing = completion.missingLabels.filter((label) =>
    EDITOR_REQUIRED_COMPLETION_LABELS.has(label)
  )
  const blockingIssues =
    requiredMissing.length > 0 ? [`缺少必填内容：${requiredMissing.join('、')}`] : []
  const warningIssues = qualityTips.map((item) => item.message)

  return {
    passed: blockingIssues.length === 0,
    blockingIssues,
    warningIssues,
    focusSections: mapEditorMissingLabelsToFocusSections(requiredMissing),
  }
}

export const buildEditorExportPrecheckFixActions = (
  completion: EditorCompletionSummary,
  qualityTips: EditorQualityTip[]
): EditorExportPrecheckFixAction[] => {
  const actions: EditorExportPrecheckFixAction[] = []
  const pushUnique = (action: EditorExportPrecheckFixAction) => {
    if (actions.some((item) => item.key === action.key)) {
      return
    }
    actions.push(action)
  }

  for (const label of completion.missingLabels) {
    if (label === '教案标题') {
      pushUnique({ key: 'fill-title', label: '补全教案标题占位', section: 'basic' })
    } else if (label === '课程名称') {
      pushUnique({ key: 'fill-course-name', label: '补全课程名称占位', section: 'basic' })
    } else if (label === '授课班级') {
      pushUnique({ key: 'fill-class-name', label: '补全授课班级占位', section: 'basic' })
    } else if (label === '课时长度') {
      pushUnique({ key: 'fill-duration', label: '补全课时长度默认值', section: 'basic' })
    } else if (label === '教学目标') {
      pushUnique({ key: 'fill-objectives', label: '补全教学目标段落', section: 'objectives' })
    } else if (label === '教学过程') {
      pushUnique({ key: 'fill-process', label: '补全教学过程段落', section: 'process' })
    } else if (label === '教学反思') {
      pushUnique({ key: 'fill-reflection', label: '补全教学反思段落', section: 'reflection' })
    }
  }

  for (const tip of qualityTips) {
    if (tip.message.includes('教学目标建议不少于20字')) {
      pushUnique({ key: 'enhance-objectives', label: '扩展教学目标表述', section: 'objectives' })
    } else if (tip.message.includes('教学过程建议包含关键环节与时间安排')) {
      pushUnique({ key: 'enhance-process', label: '补全教学过程时间结构', section: 'process' })
    } else if (tip.message.includes('教学过程时间合计约')) {
      pushUnique({
        key: 'align-duration-with-process',
        label: '将课时长度对齐为教学过程分钟合计',
        section: 'basic',
      })
    } else if (tip.message.includes('建议补充教学方法或教学资源')) {
      pushUnique({ key: 'fill-methods-resources', label: '补全教学方法与资源', section: 'basic' })
    } else if (tip.message.includes('建议补充教学反思')) {
      pushUnique({ key: 'fill-reflection', label: '补全教学反思段落', section: 'reflection' })
    }
  }

  return actions
}

export const applyEditorExportPrecheckFix = (
  form: EditorPlanForm,
  actionKey: string
): EditorPlanForm => {
  const next = {
    ...form,
    contentJson: { ...form.contentJson },
  } as EditorPlanForm

  switch (actionKey) {
    case 'fill-title':
      if (!next.title.trim()) {
        next.title = '未命名教案（请修改）'
      }
      break
    case 'fill-course-name':
      if (!next.courseName.trim()) {
        next.courseName = '待补充课程名称'
      }
      break
    case 'fill-class-name':
      if (!next.className.trim()) {
        next.className = '待补充授课班级'
      }
      break
    case 'fill-duration':
      if (next.duration <= 0) {
        next.duration = 45
      }
      break
    case 'align-duration-with-process': {
      const processMinutes = sumEditorProcessMinutes(next.process)
      if (processMinutes > 0) {
        next.duration = processMinutes
      }
      break
    }
    case 'fill-objectives':
      if (!htmlToText(next.objectives).trim()) {
        next.objectives = '<p>【待补充】请填写本节课的知识目标、能力目标与素养目标。</p>'
      }
      break
    case 'enhance-objectives':
      if (htmlToText(next.objectives).trim().length < 20) {
        next.objectives =
          '<p>通过本节课学习，学生能够理解核心概念，完成基础应用任务，并能说明关键思路。</p>'
      }
      break
    case 'fill-process':
      if (!htmlToText(next.process).trim()) {
        next.process = '<p>导入（5分钟）→ 新知讲解（25分钟）→ 任务练习（10分钟）→ 总结反馈（5分钟）。</p>'
        delete next.contentJson.process
      }
      break
    case 'enhance-process':
      if (htmlToText(next.process).trim().length < 40) {
        next.process =
          '<p>导入（5分钟）明确任务，讲解（25分钟）拆解关键步骤，练习（10分钟）巩固应用，总结（5分钟）回顾要点。</p>'
        delete next.contentJson.process
      }
      break
    case 'fill-methods-resources':
      if (!next.methods.trim()) {
        next.methods = '讲授法、任务驱动法'
      }
      if (!next.resources.trim()) {
        next.resources = 'PPT、案例材料'
      }
      break
    case 'fill-reflection':
      if (!htmlToText(next.reflection).trim()) {
        next.reflection = '<p>【待补充】记录本课教学效果、学生反馈与后续改进措施。</p>'
      }
      break
    default:
      break
  }

  return next
}

export const shouldPersistLocalDraftOnLeave = (
  hasUnsavedChanges: boolean,
  isSaving: boolean
): boolean => hasUnsavedChanges && !isSaving

export const shouldPromptUnsavedChanges = (
  hasUnsavedChanges: boolean,
  isSaving: boolean
): boolean => hasUnsavedChanges && !isSaving

export const buildTemplateUpdatePayload = (
  form: EditorPlanForm,
  titleOverride?: string
): Partial<TeachingPlan> => {
  const payload = buildPlanPayload(form)
  return {
    ...payload,
    title: titleOverride?.trim() || payload.title,
  }
}

export const resolveTemplateEditSubmission = (
  form: EditorPlanForm,
  titleOverride: string,
  shouldSubmit: boolean
): Partial<TeachingPlan> | null => {
  if (!shouldSubmit) {
    return null
  }
  return buildTemplateUpdatePayload(form, titleOverride)
}
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { usePlanStore } from '../stores/plan'
import { usePlanTemplateStore } from '../stores/planTemplate'
import BaseInput from '../components/ui/BaseInput.vue'
import EditorLayoutTabs from '../components/editor/EditorLayoutTabs.vue'
import TemplateEditTabs from '../components/editor/TemplateEditTabs.vue'
import { normalizeTemplateTags } from '../stores/planTemplate'
import {
  type CoursewareAsset,
  type DeliveryPlanDetail,
  type TeachingPlanLessonDetail,
  type TraceabilityValidationResult,
  createCoursewareAsset,
  deleteCoursewareAsset,
  getDeliveryPlan,
  getTeachingPlanLesson,
  listCoursewareAssets,
  updateCoursewareAsset,
  updateTeachingPlanLesson,
  publishTeachingPlanLesson,
  validateTraceability,
} from '../api/academic'

const TipTapEditor = defineAsyncComponent(() => import('../components/TipTapEditor.vue'))

type EditorShortcutAction = 'save' | 'export' | 'publish' | 'openHelp' | 'insertTable' | 'deleteTable'
type EditorShortcutKey = 'S' | 'E' | 'P' | 'K' | 'D' | 'R' | 'H' | 'T' | 'G'
type EditorShortcutScope = 'global' | 'editor'

interface EditorShortcutConfig {
  key: EditorShortcutKey
  shift: boolean
}

type TipTapShortcutConfig = {
  insertTable: EditorShortcutConfig
  deleteTable: EditorShortcutConfig
}

interface EditorShortcutActionMeta {
  id: EditorShortcutAction
  label: string
  hint: string
  scope: EditorShortcutScope
  requiresEditing?: boolean
}

interface EditorShortcutConflictGroup {
  signature: string
  actions: EditorShortcutAction[]
}

interface EditorShortcutScopeSection {
  id: EditorShortcutScope
  label: string
  description: string
}

const SHORTCUT_ACTIONS: readonly EditorShortcutActionMeta[] = [
  { id: 'save', label: '保存草稿', hint: '默认：Ctrl / Cmd + S', scope: 'global' },
  { id: 'export', label: '导出 Word（编辑页）', hint: '默认：Ctrl / Cmd + Shift + E', scope: 'global', requiresEditing: true },
  { id: 'publish', label: '发布教案（草稿状态）', hint: '默认：Ctrl / Cmd + Shift + P', scope: 'global', requiresEditing: true },
  { id: 'openHelp', label: '打开快捷键帮助', hint: '默认：Ctrl / Cmd + Shift + K', scope: 'global' },
  { id: 'insertTable', label: '插入表格（编辑器）', hint: '默认：Ctrl / Cmd + Shift + T', scope: 'editor' },
  { id: 'deleteTable', label: '删除表格（编辑器）', hint: '默认：Ctrl / Cmd + Shift + G', scope: 'editor' },
] as const

const SHORTCUT_SCOPE_SECTIONS: readonly EditorShortcutScopeSection[] = [
  { id: 'global', label: '全局快捷键', description: '在编辑页任意位置生效，用于保存、导出、发布等操作。' },
  { id: 'editor', label: '编辑器内快捷键', description: '仅在富文本输入区域内触发，用于快速编辑内容。' },
] as const

const SHORTCUT_KEY_OPTIONS: readonly EditorShortcutKey[] = ['S', 'E', 'P', 'K', 'D', 'R', 'H', 'T', 'G'] as const

const DEFAULT_EDITOR_SHORTCUT_CONFIG: Record<EditorShortcutAction, EditorShortcutConfig> = {
  save: { key: 'S', shift: false },
  export: { key: 'E', shift: true },
  publish: { key: 'P', shift: true },
  openHelp: { key: 'K', shift: true },
  insertTable: { key: 'T', shift: true },
  deleteTable: { key: 'G', shift: true },
}

const EDITOR_SHORTCUT_STORAGE_KEY = 'editor-shortcut-config-v1'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const templateStore = usePlanTemplateStore()
let localDraftPersistTimer: ReturnType<typeof setTimeout> | null = null

const resolveSingleQueryValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }
  return ''
}

const planId = computed(() => route.params.id as string)
const isEditing = computed(() => !!planId.value)
const editorSource = computed(() => resolveSingleQueryValue(route.query.source))
const isLessonEditorMode = computed(() => isEditing.value && editorSource.value === 'lesson')
const lastSaved = ref('')
const isLessonSaving = ref(false)
const lessonStatus = ref<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT')
const lessonContext = reactive({
  bookId: '',
  lessonType: '',
  weekNo: null as number | null,
  weekday: '',
  period: '',
  lessonDate: '',
  deliveryPlanId: null as string | null,
  deliveryPlanWeekId: null as string | null,
  courseStandardTopicRefs: [] as string[],
  ideologicalElements: '',
  integrationMethod: '',
  difficulty: '',
  teachingAids: '',
})
const lessonTraceabilityResult = ref<TraceabilityValidationResult | null>(null)
const isLessonTraceabilityChecking = ref(false)
const isLessonTopicLoading = ref(false)
const lessonHeaderTeacherName = ref('')
const lessonHeaderCourseName = ref('')
const lessonTopicSearch = ref('')
const lessonTopicCandidates = ref<Array<{ id: string; title: string; moduleName: string }>>([])
const lessonWeekTopicLinkMap = ref<Record<number, string[]>>({})
const lessonCourseOfferingId = ref<string | null>(null)
const lessonCoursewareAssets = ref<CoursewareAsset[]>([])
const isLessonCoursewareLoading = ref(false)
const isLessonCoursewareSubmitting = ref(false)
const isLessonCoursewareBatchUpdating = ref(false)
const deletingLessonCoursewareAssetId = ref('')
const editingLessonCoursewareAssetId = ref('')
const autofillingLessonCoursewareAssetId = ref('')
const selectedLessonCoursewareAssetIds = ref<string[]>([])
const lessonCoursewareForm = reactive({
  title: '',
  fileName: '',
  fileUrl: '',
  chapterRef: '',
  tagsText: '',
  ideologicalElementsText: '',
})
const lessonCoursewareBatchForm = reactive({
  chapterRef: '',
  tagsText: '',
  ideologicalElementsText: '',
})
const savedDraftSignature = ref('')
const localDraftMessage = ref('')
const localDraftImportInputRef = ref<HTMLInputElement | null>(null)
const localDraftSearch = ref('')
const localDraftHistory = ref<EditorLocalDraft[]>([])
const selectedLocalDraftSavedAt = ref('')
const showDraftDialog = ref(false)
const showImportPreviewDialog = ref(false)
const localDraftImportCandidates = ref<EditorLocalDraftImportCandidate[]>([])
const localDraftImportSearch = ref('')
const selectedImportDraftSavedAt = ref<string[]>([])
const localDraftImportMode = ref<EditorLocalDraftMergeMode>('prefer-imported')
const localDraftImportFieldSelections = ref<EditorLocalDraftImportFieldSelections>({})
const showOnlyConflictImportDrafts = ref(false)
const showOnlySelectedImportDrafts = ref(false)
const applyPresetToSelectedConflictOnly = ref(true)
const expandedImportConflictSavedAt = ref<string[]>([])
const contentSource = ref<EditorContentSource>('new')
const showProgressAssistantDialog = ref(false)
const showShortcutDialog = ref(false)
const shortcutConfigMessage = ref('')
const shortcutConfig = ref<Record<EditorShortcutAction, EditorShortcutConfig>>({
  ...DEFAULT_EDITOR_SHORTCUT_CONFIG,
})
const shortcutDraftConfig = ref<Record<EditorShortcutAction, EditorShortcutConfig>>({
  ...DEFAULT_EDITOR_SHORTCUT_CONFIG,
})
const showMobileActions = ref(false)
const showTemplatePanel = ref(false)
const isFocusMode = ref(false)
const collapsedEditorSections = ref<EditorCollapsibleSectionKey[]>([])
const templateSearch = ref('')
const selectedTemplateId = ref('')
const templateTitle = ref('')
const selectedTagFilter = ref('')
const templateTagInput = ref('')
const templateDraftTags = ref<string[]>([])
const showTemplateEditDialog = ref(false)
const editingTemplateId = ref('')
const templateEditTitle = ref('')
const templateEditTagInput = ref('')
const templateEditTags = ref<string[]>([])
const templateEditActiveTab = ref<TemplateEditTabKey>('basic')
const selectedLessonSkeletonPreset = ref<EditorLessonSkeletonPreset>('lecture')
const selectedProcessTimelinePreset = ref<EditorProcessTimelinePreset>('balanced')
const processTimelineDraftSteps = ref<EditorTimelineDraftStep[]>([])
const selectedProcessTimelineDraftStepIds = ref<string[]>([])
const collapsedProcessTimelineDraftStepIds = ref<string[]>([])
const processTimelineDraftUndoStack = ref<EditorTimelineDraftStep[][]>([])
const processTimelineDraftRedoStack = ref<EditorTimelineDraftStep[][]>([])
const isSyncingProcessTimelineDraftHistory = ref(false)
const processTimelineDraftHistoryAnchor = ref<EditorTimelineDraftStep[]>([])
const timelineStepIdSeed = ref(0)
const draggingProcessTimelineDraftStepId = ref<string | null>(null)
const dragOverProcessTimelineDraftStepId = ref<string | null>(null)
const canUseTimelineDrag = ref(true)
const showTimelineApplyPreviewDialog = ref(false)
const timelineApplyPreviewMode = ref<EditorProcessTimelineApplyMode>('replace')
const lessonSkeletonPresetManuallySelected = ref(false)
const isDraftPersistenceReady = ref(false)
const PRESET_TEMPLATE_TAGS = ['导入', '探究', '复习', '实验', '评价'] as const
const lessonSkeletonOptions = resolveEditorLessonSkeletonOptions()
const processTimelineOptions = resolveEditorProcessTimelineOptions()
const showOutlineDialog = ref(false)
const activeEditorSection = ref<EditorSectionKey>('basic')
const activeEditorLayoutTab = ref<EditorLayoutTabKey>('basic')
let editorSectionSyncRafId: number | null = null

const cloneShortcutConfig = (
  config: Record<EditorShortcutAction, EditorShortcutConfig>
): Record<EditorShortcutAction, EditorShortcutConfig> => ({
  save: { ...config.save },
  export: { ...config.export },
  publish: { ...config.publish },
  openHelp: { ...config.openHelp },
  insertTable: { ...config.insertTable },
  deleteTable: { ...config.deleteTable },
})

const tiptapShortcutConfig = computed<TipTapShortcutConfig>(() => ({
  insertTable: { ...shortcutConfig.value.insertTable },
  deleteTable: { ...shortcutConfig.value.deleteTable },
}))

const toShortcutSignature = (config: EditorShortcutConfig): string =>
  `${config.shift ? 'Shift+' : ''}${config.key}`

const formatShortcutDisplay = (config: EditorShortcutConfig): string =>
  `Ctrl / Cmd + ${config.shift ? 'Shift + ' : ''}${config.key}`

const resolveShortcutActionLabel = (action: EditorShortcutAction): string =>
  SHORTCUT_ACTIONS.find((item) => item.id === action)?.label || action

const isEditorShortcutKey = (value: string): value is EditorShortcutKey =>
  SHORTCUT_KEY_OPTIONS.includes(value as EditorShortcutKey)

const formatShortcutSignature = (signature: string): string => {
  const shift = signature.startsWith('Shift+')
  const rawKey = shift ? signature.slice('Shift+'.length) : signature
  const key = rawKey.toUpperCase()
  if (!isEditorShortcutKey(key)) {
    return `Ctrl / Cmd + ${shift ? 'Shift + ' : ''}${rawKey}`
  }
  return formatShortcutDisplay({ key, shift })
}

const normalizeShortcutConfig = (value: unknown): Record<EditorShortcutAction, EditorShortcutConfig> | null => {
  if (!value || typeof value !== 'object') {
    return null
  }
  const record = value as Record<string, unknown>
  const actions: EditorShortcutAction[] = ['save', 'export', 'publish', 'openHelp', 'insertTable', 'deleteTable']
  const next = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)

  for (const action of actions) {
    const item = record[action]
    if (!item || typeof item !== 'object') {
      return null
    }
    const shortcutItem = item as Record<string, unknown>
    const key = typeof shortcutItem.key === 'string' ? shortcutItem.key.toUpperCase() : ''
    if (!isEditorShortcutKey(key)) {
      return null
    }
    if (typeof shortcutItem.shift !== 'boolean') {
      return null
    }
    next[action] = { key, shift: shortcutItem.shift }
  }

  return next
}

const loadShortcutConfigFromStorage = () => {
  if (typeof window === 'undefined') {
    shortcutConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
    shortcutDraftConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
    return
  }
  const raw = window.localStorage.getItem(EDITOR_SHORTCUT_STORAGE_KEY)
  if (!raw) {
    shortcutConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
    shortcutDraftConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
    return
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    const normalized = normalizeShortcutConfig(parsed)
    if (!normalized) {
      shortcutConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
      shortcutDraftConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
      return
    }
    shortcutConfig.value = cloneShortcutConfig(normalized)
    shortcutDraftConfig.value = cloneShortcutConfig(normalized)
  } catch {
    shortcutConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
    shortcutDraftConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
  }
}

const loadEditorViewPreferenceFromStorage = () => {
  if (typeof window === 'undefined') {
    return
  }
  const parsed = parseEditorViewPreference(
    window.localStorage.getItem(EDITOR_VIEW_PREFERENCE_STORAGE_KEY)
  )
  if (!parsed) {
    return
  }
  isFocusMode.value = parsed.focusMode
  collapsedEditorSections.value = [...parsed.collapsedSections]
  activeEditorLayoutTab.value = parsed.activeLayoutTab
}

const persistEditorViewPreference = () => {
  if (typeof window === 'undefined') {
    return
  }
  const payload = serializeEditorViewPreference({
    focusMode: isFocusMode.value,
    collapsedSections: collapsedEditorSections.value,
    activeLayoutTab: activeEditorLayoutTab.value,
  })
  window.localStorage.setItem(EDITOR_VIEW_PREFERENCE_STORAGE_KEY, payload)
}

const shortcutConflictGroups = computed<EditorShortcutConflictGroup[]>(() => {
  const map = new Map<string, EditorShortcutAction[]>()
  for (const action of SHORTCUT_ACTIONS) {
    const signature = toShortcutSignature(shortcutDraftConfig.value[action.id])
    const current = map.get(signature) || []
    map.set(signature, [...current, action.id])
  }
  return [...map.entries()]
    .filter(([, actions]) => actions.length > 1)
    .map(([signature, actions]) => ({ signature, actions }))
})

const shortcutActionSections = computed(() =>
  SHORTCUT_SCOPE_SECTIONS.map((section) => ({
    ...section,
    actions: SHORTCUT_ACTIONS.filter((action) => action.scope === section.id),
  }))
)

const hasShortcutConflicts = computed(() => shortcutConflictGroups.value.length > 0)
const shortcutConflictActionSet = computed(
  () =>
    new Set<EditorShortcutAction>(
      shortcutConflictGroups.value.flatMap((group) => group.actions)
    )
)

const isShortcutActionConflicted = (action: EditorShortcutAction): boolean =>
  shortcutConflictActionSet.value.has(action)

const isFormValid = computed(() => {
  return form.title.trim() && 
         form.courseName.trim() && 
         form.className.trim() && 
         form.duration > 0
})

const form = reactive({
  title: '',
  courseName: '',
  className: '',
  duration: 90,
  methods: '',
  resources: '',
  objectives: '<p></p>',
  keyPoints: '<p></p>',
  process: '<p></p>',
  blackboard: '<p></p>',
  reflection: '<p></p>',
  contentJson: {},
})

const durationText = computed({
  get: () => (form.duration > 0 ? String(form.duration) : ''),
  set: (value: string) => {
    const parsed = Number.parseInt(value, 10)
    form.duration = Number.isFinite(parsed) ? parsed : 0
  },
})

const createDefaultEditorForm = (): EditorPlanForm => ({
  title: '',
  courseName: '',
  className: '',
  duration: 90,
  methods: '',
  resources: '',
  objectives: '<p></p>',
  keyPoints: '<p></p>',
  process: '<p></p>',
  blackboard: '<p></p>',
  reflection: '<p></p>',
  contentJson: {},
})

const templateEditForm = reactive<EditorPlanForm>(createDefaultEditorForm())

const updateSavedDraftSignature = () => {
  savedDraftSignature.value = buildEditorDraftSignature(form as EditorPlanForm)
}

const hasUnsavedDraft = computed(() =>
  hasEditorDraftChanges(form as EditorPlanForm, savedDraftSignature.value)
)

const isEditorSaving = computed(() => planStore.isSaving || isLessonSaving.value)
const currentDocumentStatus = computed<'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | undefined>(() =>
  isLessonEditorMode.value ? lessonStatus.value : planStore.currentPlan?.status
)
const canPublishCurrentDocument = computed(() =>
  isEditing.value && currentDocumentStatus.value === 'DRAFT'
)
const editorPageTitle = computed(() => {
  if (!isEditing.value) {
    return '新建教案'
  }
  return isLessonEditorMode.value ? '编辑单次课教案' : '编辑教案'
})
const publishButtonText = computed(() =>
  isLessonEditorMode.value ? '发布单次课' : '发布教案'
)
const lessonWeekNoText = computed({
  get: () => (lessonContext.weekNo ? String(lessonContext.weekNo) : ''),
  set: (value: string) => {
    const parsed = Number.parseInt(value, 10)
    lessonContext.weekNo = Number.isFinite(parsed) && parsed > 0 ? parsed : null
  },
})
const lessonTopicRefSet = computed(() => new Set(lessonContext.courseStandardTopicRefs))
const filteredLessonTopicCandidates = computed(() => {
  const keyword = lessonTopicSearch.value.trim().toLowerCase()
  if (!keyword) {
    return lessonTopicCandidates.value
  }
  return lessonTopicCandidates.value.filter((item) => {
    const haystack = `${item.moduleName} ${item.title} ${item.id}`.toLowerCase()
    return haystack.includes(keyword)
  })
})
const orphanLessonTopicRefs = computed(() => {
  const validTopicIds = new Set(lessonTopicCandidates.value.map((item) => item.id))
  return lessonContext.courseStandardTopicRefs.filter((topicId) => !validTopicIds.has(topicId))
})
const currentWeekLinkedTopicIds = computed(() => {
  if (lessonContext.weekNo === null) {
    return []
  }
  return lessonWeekTopicLinkMap.value[lessonContext.weekNo] || []
})
const currentWeekLinkedTopicSet = computed(() => new Set(currentWeekLinkedTopicIds.value))
const selectedLessonCoursewareAssets = computed(() => {
  const selectedIdSet = new Set(selectedLessonCoursewareAssetIds.value)
  return lessonCoursewareAssets.value.filter((asset) => selectedIdSet.has(asset.id))
})
const isAllLessonCoursewareSelected = computed(
  () =>
    lessonCoursewareAssets.value.length > 0
    && selectedLessonCoursewareAssetIds.value.length === lessonCoursewareAssets.value.length
)
const lessonWarningGroups = computed(() => {
  const warnings = lessonTraceabilityResult.value?.warnings || []
  const groups = new Map<string, { key: string; label: string; items: string[] }>()
  for (const warning of warnings) {
    const key = warning.includes('课件附件')
      ? 'courseware'
      : warning.includes('思政')
        ? 'ideology'
        : warning.includes('授课计划') || warning.includes('课程标准')
          ? 'traceability'
          : 'other'
    const label = key === 'courseware'
      ? '课件附件'
      : key === 'ideology'
        ? '思政一致性'
        : key === 'traceability'
          ? '链路一致性'
          : '其他告警'
    if (!groups.has(key)) {
      groups.set(key, { key, label, items: [] })
    }
    groups.get(key)!.items.push(warning)
  }
  return [...groups.values()]
})

const resolveLessonWarningFixChecklist = (warnings: string[]) => {
  const items: string[] = []
  if (warnings.some((item) => item.includes('课件附件有'))) {
    items.push(`自动：可执行“课件附件缺失字段一键补齐”（当前附件 ${lessonCoursewareAssets.value.length} 条）`)
  }
  if (warnings.some((item) => item.includes('未关联任何课件附件'))) {
    items.push('手动：请先新增至少一个课件附件并补充章节/标签')
  }
  if (warnings.some((item) => item.includes('思政元素'))) {
    items.push('手动：核对“课程思政元素”与授课计划周次描述一致')
  }
  if (warnings.some((item) => item.includes('融入方式'))) {
    items.push('手动：核对“融入方式”与授课计划周次描述一致')
  }
  if (warnings.some((item) => item.includes('课程标准'))) {
    items.push('手动：核对“课程标准条目引用”与周次绑定关系')
  }
  return items
}
const lessonWarningFixChecklist = computed(() =>
  resolveLessonWarningFixChecklist(lessonTraceabilityResult.value?.warnings || [])
)
const lessonWarningHasCoursewareAutofix = computed(() =>
  (lessonTraceabilityResult.value?.warnings || []).some((item) => item.includes('课件附件有'))
)

const editorStatusText = computed(() => {
  if (isEditorSaving.value) {
    return '保存中...'
  }
  if (hasUnsavedDraft.value) {
    return '未保存更改'
  }
  return lastSaved.value ? `最后保存: ${lastSaved.value}` : '未保存'
})

const contentSourceLabel = computed(() => resolveEditorContentSourceLabel(contentSource.value))
const editorCompletionSummary = computed(() =>
  buildEditorCompletionSummary(form as EditorPlanForm)
)
const editorSectionCompletionItems = computed(() =>
  buildEditorSectionCompletion(form as EditorPlanForm)
)
const editorLayoutTabs = computed<EditorLayoutTabSummary[]>(() =>
  buildEditorLayoutTabSummaries(editorSectionCompletionItems.value)
)
const templateEditTabs = computed<TemplateEditTabSummary[]>(() =>
  TEMPLATE_EDIT_TABS.map((tab) => {
    const filledCount = tab.fields.reduce(
      (sum, field) => sum + (isEditorPlanFieldEmpty(templateEditForm, field) ? 0 : 1),
      0
    )
    return {
      ...tab,
      filledCount,
      totalCount: tab.fields.length,
    }
  })
)
const nextIncompleteTemplateEditTab = computed<TemplateEditTabMeta | null>(
  () => templateEditTabs.value.find((tab) => tab.filledCount < tab.totalCount) || null
)
const nextIncompleteEditorSection = computed(() =>
  resolveNextIncompleteEditorSection(editorSectionCompletionItems.value)
)
const processMinutesTotal = computed(() => sumEditorProcessMinutes(form.process))
const processDurationDelta = computed(() => {
  if (processMinutesTotal.value <= 0 || form.duration <= 0) {
    return 0
  }
  return processMinutesTotal.value - form.duration
})
const hasProcessDurationMismatch = computed(() =>
  processMinutesTotal.value > 0 && form.duration > 0 && Math.abs(processDurationDelta.value) >= 10
)
const processTimelineDraftMinutesTotal = computed(() =>
  processTimelineDraftSteps.value.reduce((sum, item) => sum + Math.max(0, Math.round(item.minutes || 0)), 0)
)
const processTimelineDraftDurationDelta = computed(() => {
  if (processTimelineDraftMinutesTotal.value <= 0 || form.duration <= 0) {
    return 0
  }
  return processTimelineDraftMinutesTotal.value - form.duration
})
const hasProcessTimelineDraftMismatch = computed(() =>
  processTimelineDraftMinutesTotal.value > 0 && form.duration > 0 && Math.abs(processTimelineDraftDurationDelta.value) >= 10
)
const editorOutlineItems = computed(() =>
  editorSectionCompletionItems.value.map((item) => ({
    section: item.section,
    label: item.label,
    status: item.status,
    requiredMissingCount: item.requiredMissingLabels.length,
    progress: item.progress,
  }))
)
const editorQualityTips = computed(() =>
  buildEditorQualityTips(form as EditorPlanForm)
)
const editorExportPrecheck = computed(() =>
  buildEditorExportPrecheck(editorCompletionSummary.value, editorQualityTips.value)
)
const editorExportPrecheckFixActions = computed(() =>
  buildEditorExportPrecheckFixActions(editorCompletionSummary.value, editorQualityTips.value)
)
const recommendedLessonSkeletonPreset = computed(() =>
  recommendEditorLessonSkeletonPreset(form.courseName)
)
const recommendedLessonSkeletonLabel = computed(() =>
  resolveEditorLessonSkeletonLabel(recommendedLessonSkeletonPreset.value)
)
const shouldRenderTemplatePanel = computed(() =>
  shouldShowEditorTemplatePanel(showTemplatePanel.value, isFocusMode.value)
)
const isAllCollapsibleSectionsCollapsed = computed(() =>
  EDITOR_COLLAPSIBLE_SECTIONS.every((section) => collapsedEditorSections.value.includes(section))
)
const resolveEditorSectionLabelForView = (section: EditorSectionKey): string =>
  resolveEditorSectionLabel(section)
const resolveEditorLayoutTabLabelForView = (tab: EditorLayoutTabKey): string =>
  EDITOR_LAYOUT_TABS.find((item) => item.id === tab)?.label || tab
const isActiveEditorSectionForView = (section: EditorSectionKey): boolean =>
  activeEditorSection.value === section
const isProcessTimelineDraftStepCollapsed = (id: string): boolean =>
  isEditorTimelineStepCollapsedState(collapsedProcessTimelineDraftStepIds.value, id)
const isAllProcessTimelineDraftStepsCollapsed = computed(() =>
  areAllEditorTimelineStepsCollapsed(
    collapsedProcessTimelineDraftStepIds.value,
    processTimelineDraftSteps.value
  )
)
const isProcessTimelineDraftStepSelected = (id: string): boolean =>
  isEditorTimelineStepSelectedState(selectedProcessTimelineDraftStepIds.value, id)
const selectedProcessTimelineDraftStepCount = computed(() =>
  selectedProcessTimelineDraftStepIds.value.length
)
const canUndoProcessTimelineDraft = computed(() =>
  processTimelineDraftUndoStack.value.length > 0
)
const canRedoProcessTimelineDraft = computed(() =>
  processTimelineDraftRedoStack.value.length > 0
)
const isAllProcessTimelineDraftStepsSelected = computed(() =>
  areAllEditorTimelineStepsSelected(
    selectedProcessTimelineDraftStepIds.value,
    processTimelineDraftSteps.value
  )
)
const processTimelineDraftSignature = computed(() =>
  JSON.stringify(
    processTimelineDraftSteps.value.map((step) => ({
      id: step.id,
      label: step.label,
      minutes: step.minutes,
    }))
  )
)
const timelineApplyPreview = computed(() =>
  buildEditorTimelineApplyPreview(
    form.process,
    processTimelineDraftSteps.value,
    timelineApplyPreviewMode.value
  )
)
const timelineApplyPreviewDiff = computed(() =>
  buildEditorTimelineApplyPreviewDiff(
    form.process,
    timelineApplyPreview.value.nextProcessHtml
  )
)

const syncTimelineDragCapability = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return
  }
  canUseTimelineDrag.value = !window.matchMedia('(pointer: coarse)').matches
}

const collectEditorSectionViewportPositions = (): EditorSectionViewportPosition[] => {
  if (typeof document === 'undefined') {
    return []
  }
  return EDITOR_SECTION_ORDER.map((section) => {
    const elementId = resolveEditorSectionElementId(section)
    const element = document.getElementById(elementId)
    if (!element || element.offsetParent === null) {
      return null
    }
    return {
      section,
      top: element.getBoundingClientRect().top,
    }
  }).filter((item): item is EditorSectionViewportPosition => item !== null)
}

const syncActiveEditorSectionByViewport = () => {
  const nextSection = resolveActiveEditorSectionFromViewport(
    collectEditorSectionViewportPositions(),
    activeEditorSection.value,
    180
  )
  if (nextSection) {
    activeEditorSection.value = nextSection
    activeEditorLayoutTab.value = resolveEditorLayoutTabBySection(nextSection)
  }
}

const scheduleSyncActiveEditorSectionByViewport = () => {
  if (typeof window === 'undefined' || editorSectionSyncRafId !== null) {
    return
  }
  editorSectionSyncRafId = window.requestAnimationFrame(() => {
    editorSectionSyncRafId = null
    syncActiveEditorSectionByViewport()
  })
}

const handleEditorViewportChange = () => {
  scheduleSyncActiveEditorSectionByViewport()
  syncTimelineDragCapability()
}

const currentLocalDraft = computed<EditorLocalDraft | null>(() => localDraftHistory.value[0] ?? null)

const orderedLocalDraftHistory = computed(() =>
  sortEditorLocalDraftHistoryForView(localDraftHistory.value)
)

const pinnedDraftCount = computed(() =>
  localDraftHistory.value.filter((item) => item.pinned).length
)

const unpinnedDraftCount = computed(() =>
  localDraftHistory.value.filter((item) => !item.pinned).length
)

const filteredLocalDraftHistory = computed(() =>
  filterEditorLocalDraftHistory(orderedLocalDraftHistory.value, localDraftSearch.value)
)

const selectedLocalDraft = computed<EditorLocalDraft | null>(() => {
  const useFiltered = showDraftDialog.value
  const sourceList = useFiltered ? filteredLocalDraftHistory.value : orderedLocalDraftHistory.value

  if (!sourceList.length) {
    return null
  }

  if (!selectedLocalDraftSavedAt.value) {
    return sourceList[0]
  }

  return (
    sourceList.find((item) => item.savedAt === selectedLocalDraftSavedAt.value) ??
    sourceList[0]
  )
})

const selectedLocalDraftDiff = computed(() =>
  buildEditorDraftDiffSummary(form as EditorPlanForm, selectedLocalDraft.value)
)

const localDraftImportPreparedDrafts = computed(() =>
  buildEditorLocalDraftImportPreparedDrafts(
    localDraftHistory.value,
    localDraftImportCandidates.value,
    selectedImportDraftSavedAt.value,
    localDraftImportMode.value,
    localDraftImportFieldSelections.value
  )
)

const localDraftImportConflictDiffItems = computed(() =>
  buildEditorLocalDraftImportConflictDiffItems(localDraftHistory.value, localDraftImportCandidates.value)
)

const filteredLocalDraftImportCandidates = computed(() => {
  const filtered = filterEditorLocalDraftImportCandidates(localDraftImportCandidates.value, {
    onlyConflict: showOnlyConflictImportDrafts.value,
    onlySelected: showOnlySelectedImportDrafts.value,
    selectedSavedAt: selectedImportDraftSavedAt.value,
  })
  return searchEditorLocalDraftImportCandidates(
    filtered,
    localDraftImportSearch.value,
    localDraftImportConflictDiffItems.value
  )
})

const localDraftImportConflictCount = computed(() =>
  localDraftImportCandidates.value.filter((item) => item.conflict).length
)

const localDraftImportPreview = computed(() =>
  buildEditorLocalDraftImportPreview(
    localDraftHistory.value,
    localDraftImportPreparedDrafts.value.importedDrafts,
    LOCAL_EDITOR_DRAFT_HISTORY_LIMIT,
    localDraftImportPreparedDrafts.value.effectiveMode
  )
)

const localDraftImportPreviewMessage = computed(() =>
  buildEditorLocalDraftImportPreviewMessage(localDraftImportPreview.value)
)

const localDraftImportConflictItemMap = computed(() => {
  const items = buildEditorLocalDraftImportConflictItems(
    localDraftHistory.value,
    localDraftImportCandidates.value
  )
  return new Map(items.map((item) => [item.savedAt, item]))
})

const localDraftImportConflictDiffItemMap = computed(() =>
  new Map(localDraftImportConflictDiffItems.value.map((item) => [item.savedAt, item]))
)

const localDraftImportConflictDetailItemMap = computed(() => {
  const items = buildEditorLocalDraftImportConflictDetailItems(
    localDraftHistory.value,
    localDraftImportCandidates.value
  )
  return new Map(items.map((item) => [item.savedAt, item]))
})

const formatLocalDraftImportConflictDiffText = (savedAt: string): string => {
  const item = localDraftImportConflictDiffItemMap.value.get(savedAt)
  if (!item) {
    return '差异：0 项'
  }
  if (item.changedCount === 0) {
    return '差异：0 项'
  }

  const previewLabels = item.fields.slice(0, 3)
  const suffix = item.fields.length > 3 ? '等' : ''
  return `差异：${item.changedCount} 项（${previewLabels.join('、')}${suffix}）`
}

const isLocalDraftImportConflictExpanded = (savedAt: string): boolean =>
  expandedImportConflictSavedAt.value.includes(savedAt)

const handleToggleLocalDraftImportConflictExpanded = (savedAt: string) => {
  if (isLocalDraftImportConflictExpanded(savedAt)) {
    expandedImportConflictSavedAt.value = expandedImportConflictSavedAt.value.filter(
      (item) => item !== savedAt
    )
    return
  }
  expandedImportConflictSavedAt.value = [...expandedImportConflictSavedAt.value, savedAt]
}

const resolveLocalDraftImportSelectedFields = (savedAt: string): EditorDraftComparableField[] =>
  localDraftImportFieldSelections.value[savedAt] || []

const handleToggleLocalDraftImportConflictField = (
  savedAt: string,
  field: EditorDraftComparableField
) => {
  const current = resolveLocalDraftImportSelectedFields(savedAt)
  if (current.includes(field)) {
    localDraftImportFieldSelections.value = {
      ...localDraftImportFieldSelections.value,
      [savedAt]: current.filter((item) => item !== field),
    }
    return
  }

  localDraftImportFieldSelections.value = {
    ...localDraftImportFieldSelections.value,
    [savedAt]: [...current, field],
  }
}

const handleSelectAllLocalDraftImportConflictFields = (savedAt: string) => {
  const detail = localDraftImportConflictDetailItemMap.value.get(savedAt)
  if (!detail) {
    return
  }
  localDraftImportFieldSelections.value = {
    ...localDraftImportFieldSelections.value,
    [savedAt]: detail.details.map((item) => item.field),
  }
}

const handleClearLocalDraftImportConflictFields = (savedAt: string) => {
  localDraftImportFieldSelections.value = {
    ...localDraftImportFieldSelections.value,
    [savedAt]: [],
  }
}

const handleApplyLocalDraftImportConflictPreset = (
  preset: EditorLocalDraftImportConflictFieldPreset
) => {
  const conflictItems = pickEditorLocalDraftImportConflictDetailsBySelection(
    [...localDraftImportConflictDetailItemMap.value.values()],
    selectedImportDraftSavedAt.value,
    applyPresetToSelectedConflictOnly.value
  )
  if (!conflictItems.length) {
    return
  }
  const selection = buildEditorLocalDraftImportFieldSelectionsByPreset(conflictItems, preset)
  localDraftImportFieldSelections.value = {
    ...localDraftImportFieldSelections.value,
    ...selection,
  }
}

const resolveLocalDraftDisplayNameForView = (draft: EditorLocalDraft): string =>
  resolveEditorLocalDraftDisplayName(draft)

const localDraftStorageKey = computed(() =>
  buildEditorLocalDraftStorageKey(isEditing.value ? planId.value : null)
)

const formatDraftTimestamp = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString('zh-CN')
}

const handleFocusEditorSection = (section: EditorSectionKey) => {
  if (typeof document === 'undefined') {
    return
  }
  activeEditorSection.value = section
  activeEditorLayoutTab.value = resolveEditorLayoutTabBySection(section)
  collapsedEditorSections.value = setEditorSectionCollapsedState(
    collapsedEditorSections.value,
    section,
    false
  )
  const elementId = resolveEditorSectionElementId(section)
  nextTick(() => {
    const target = document.getElementById(elementId)
    if (!target) {
      return
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const handleSelectEditorLayoutTab = (tab: EditorLayoutTabKey) => {
  handleFocusEditorSection(resolveEditorSectionForLayoutTab(tab, activeEditorSection.value))
}

const handleSelectTemplateEditTab = (tab: TemplateEditTabKey) => {
  templateEditActiveTab.value = tab
}

const handleFocusNextIncompleteTemplateEditTab = () => {
  const nextTab = nextIncompleteTemplateEditTab.value
  if (!nextTab) {
    alert('模板各分区已基本完善。')
    return
  }
  templateEditActiveTab.value = nextTab.id
}

const isEditorSectionCollapsedForView = (section: EditorSectionKey): boolean =>
  isEditorSectionCollapsedInState(collapsedEditorSections.value, section)

const handleToggleEditorSectionCollapsed = (section: EditorSectionKey) => {
  collapsedEditorSections.value = toggleEditorSectionCollapsedState(
    collapsedEditorSections.value,
    section
  )
}

const handleCollapseAllEditorSections = () => {
  collapsedEditorSections.value = [...EDITOR_COLLAPSIBLE_SECTIONS]
}

const handleExpandAllEditorSections = () => {
  collapsedEditorSections.value = []
}

const handleToggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
}

const handleFocusNextIncompleteSection = () => {
  if (!nextIncompleteEditorSection.value) {
    alert('必填分区已完成，可继续优化内容质量。')
    return
  }
  handleFocusEditorSection(nextIncompleteEditorSection.value)
}

const handleFocusOutlineSection = (section: EditorSectionKey) => {
  showOutlineDialog.value = false
  handleFocusEditorSection(section)
}

const handleAlignDurationWithProcessMinutes = () => {
  if (processMinutesTotal.value <= 0) {
    alert('未检测到有效分钟数，请先在教学过程中补充“XX分钟”描述。')
    return
  }
  form.duration = processMinutesTotal.value
}

const buildTimelineDraftId = (): string => {
  timelineStepIdSeed.value += 1
  return `timeline-step-${timelineStepIdSeed.value}`
}

const replaceProcessTimelineDraftSteps = (steps: EditorTimelineStep[]) => {
  processTimelineDraftSteps.value = steps.map((step) => ({
    id: buildTimelineDraftId(),
    label: step.label,
    minutes: step.minutes,
  }))
}

const syncProcessTimelineDraftHistoryAnchor = () => {
  processTimelineDraftHistoryAnchor.value = cloneEditorTimelineDraftSteps(
    processTimelineDraftSteps.value
  )
}

const resetProcessTimelineDraftHistory = () => {
  processTimelineDraftUndoStack.value = []
  processTimelineDraftRedoStack.value = []
  syncProcessTimelineDraftHistoryAnchor()
}

const handleResetProcessTimelineDraft = () => {
  draggingProcessTimelineDraftStepId.value = null
  dragOverProcessTimelineDraftStepId.value = null
  selectedProcessTimelineDraftStepIds.value = []
  showTimelineApplyPreviewDialog.value = false
  replaceProcessTimelineDraftSteps(
    buildEditorTimelineStepsFromPreset(form.duration, selectedProcessTimelinePreset.value)
  )
  collapsedProcessTimelineDraftStepIds.value = processTimelineDraftSteps.value
    .slice(1)
    .map((step) => step.id)
}

const handleUndoProcessTimelineDraft = () => {
  if (!processTimelineDraftUndoStack.value.length) {
    return
  }
  const previous = processTimelineDraftUndoStack.value[processTimelineDraftUndoStack.value.length - 1]
  processTimelineDraftUndoStack.value = processTimelineDraftUndoStack.value.slice(
    0,
    processTimelineDraftUndoStack.value.length - 1
  )
  processTimelineDraftRedoStack.value = [
    ...processTimelineDraftRedoStack.value,
    cloneEditorTimelineDraftSteps(processTimelineDraftSteps.value),
  ]
  isSyncingProcessTimelineDraftHistory.value = true
  processTimelineDraftSteps.value = cloneEditorTimelineDraftSteps(previous)
  syncProcessTimelineDraftHistoryAnchor()
  isSyncingProcessTimelineDraftHistory.value = false
}

const handleRedoProcessTimelineDraft = () => {
  if (!processTimelineDraftRedoStack.value.length) {
    return
  }
  const next = processTimelineDraftRedoStack.value[processTimelineDraftRedoStack.value.length - 1]
  processTimelineDraftRedoStack.value = processTimelineDraftRedoStack.value.slice(
    0,
    processTimelineDraftRedoStack.value.length - 1
  )
  processTimelineDraftUndoStack.value = [
    ...processTimelineDraftUndoStack.value,
    cloneEditorTimelineDraftSteps(processTimelineDraftSteps.value),
  ]
  isSyncingProcessTimelineDraftHistory.value = true
  processTimelineDraftSteps.value = cloneEditorTimelineDraftSteps(next)
  syncProcessTimelineDraftHistoryAnchor()
  isSyncingProcessTimelineDraftHistory.value = false
}

const handleAddProcessTimelineDraftStep = () => {
  const nextStep = {
    id: buildTimelineDraftId(),
    label: `环节${processTimelineDraftSteps.value.length + 1}`,
    minutes: 0,
  }
  processTimelineDraftSteps.value = [
    ...processTimelineDraftSteps.value,
    nextStep,
  ]
  collapsedProcessTimelineDraftStepIds.value = collapsedProcessTimelineDraftStepIds.value.filter(
    (id) => id !== nextStep.id
  )
}

const handleRemoveProcessTimelineDraftStep = (id: string) => {
  if (processTimelineDraftSteps.value.length <= 1) {
    return
  }
  processTimelineDraftSteps.value = processTimelineDraftSteps.value.filter((step) => step.id !== id)
  selectedProcessTimelineDraftStepIds.value = selectedProcessTimelineDraftStepIds.value.filter(
    (item) => item !== id
  )
  collapsedProcessTimelineDraftStepIds.value = collapsedProcessTimelineDraftStepIds.value.filter(
    (item) => item !== id
  )
}

const handleToggleProcessTimelineDraftStepCollapsed = (id: string) => {
  collapsedProcessTimelineDraftStepIds.value = toggleEditorTimelineStepCollapsedState(
    collapsedProcessTimelineDraftStepIds.value,
    id
  )
}

const handleToggleAllProcessTimelineDraftStepCollapsed = () => {
  collapsedProcessTimelineDraftStepIds.value = toggleAllEditorTimelineStepCollapsedState(
    collapsedProcessTimelineDraftStepIds.value,
    processTimelineDraftSteps.value
  )
}

const handleToggleProcessTimelineDraftStepSelected = (id: string) => {
  selectedProcessTimelineDraftStepIds.value = toggleEditorTimelineStepSelectedState(
    selectedProcessTimelineDraftStepIds.value,
    id
  )
}

const handleToggleAllProcessTimelineDraftStepSelected = () => {
  selectedProcessTimelineDraftStepIds.value = toggleAllEditorTimelineStepSelectedState(
    selectedProcessTimelineDraftStepIds.value,
    processTimelineDraftSteps.value
  )
}

const handleRemoveSelectedProcessTimelineDraftSteps = () => {
  if (!selectedProcessTimelineDraftStepIds.value.length) {
    return
  }
  if (selectedProcessTimelineDraftStepIds.value.length >= processTimelineDraftSteps.value.length) {
    alert('至少保留一个时间轴环节。')
    return
  }
  processTimelineDraftSteps.value = removeSelectedEditorTimelineSteps(
    processTimelineDraftSteps.value,
    selectedProcessTimelineDraftStepIds.value
  )
  selectedProcessTimelineDraftStepIds.value = []
}

const handleRedistributeSelectedProcessTimelineDraftStepMinutes = () => {
  if (selectedProcessTimelineDraftStepIds.value.length < 2) {
    alert('请至少选择两个环节进行等分。')
    return
  }
  processTimelineDraftSteps.value = redistributeEditorTimelineSelectedStepMinutes(
    processTimelineDraftSteps.value,
    selectedProcessTimelineDraftStepIds.value
  )
}

const handleAdjustSelectedProcessTimelineDraftStepMinutes = (deltaMinutes: number) => {
  if (selectedProcessTimelineDraftStepIds.value.length < 1) {
    alert('请先选择至少一个环节。')
    return
  }
  processTimelineDraftSteps.value = adjustEditorTimelineSelectedStepMinutes(
    processTimelineDraftSteps.value,
    selectedProcessTimelineDraftStepIds.value,
    deltaMinutes
  )
}

const handleAlignSelectedProcessTimelineDraftMinutesWithDuration = () => {
  if (selectedProcessTimelineDraftStepIds.value.length === 0) {
    alert('请先选择至少一个环节。')
    return
  }
  processTimelineDraftSteps.value = redistributeEditorTimelineSelectedStepMinutesToDuration(
    processTimelineDraftSteps.value,
    selectedProcessTimelineDraftStepIds.value,
    form.duration
  )
}

const handleAutofillSelectedProcessTimelineDraftStepLabels = () => {
  processTimelineDraftSteps.value = autofillEditorTimelineDraftStepLabels(
    processTimelineDraftSteps.value,
    selectedProcessTimelineDraftStepIds.value
  )
}

const handleMoveProcessTimelineDraftStep = (id: string, direction: EditorTimelineMoveDirection) => {
  processTimelineDraftSteps.value = moveEditorTimelineSteps(
    processTimelineDraftSteps.value,
    id,
    direction
  )
}

const handleStartProcessTimelineDraftDrag = (id: string, event: DragEvent) => {
  if (!canUseTimelineDrag.value) {
    return
  }
  draggingProcessTimelineDraftStepId.value = id
  dragOverProcessTimelineDraftStepId.value = id
  if (!event.dataTransfer) {
    return
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
}

const handleDragOverProcessTimelineDraftStep = (targetId: string) => {
  if (!canUseTimelineDrag.value || !draggingProcessTimelineDraftStepId.value) {
    return
  }
  dragOverProcessTimelineDraftStepId.value = targetId
}

const handleDropProcessTimelineDraftStep = (targetId: string, event: DragEvent) => {
  if (!canUseTimelineDrag.value) {
    return
  }
  const sourceId = draggingProcessTimelineDraftStepId.value
    || event.dataTransfer?.getData('text/plain')
    || ''
  if (!sourceId) {
    dragOverProcessTimelineDraftStepId.value = null
    return
  }
  processTimelineDraftSteps.value = reorderEditorTimelineSteps(
    processTimelineDraftSteps.value,
    sourceId,
    targetId
  )
  draggingProcessTimelineDraftStepId.value = null
  dragOverProcessTimelineDraftStepId.value = null
}

const handleEndProcessTimelineDraftDrag = () => {
  draggingProcessTimelineDraftStepId.value = null
  dragOverProcessTimelineDraftStepId.value = null
}

const handleAlignProcessTimelineDraftMinutes = () => {
  const aligned = alignEditorTimelineStepsToDuration(processTimelineDraftSteps.value, form.duration)
  processTimelineDraftSteps.value = processTimelineDraftSteps.value.map((step, index) => ({
    ...step,
    minutes: aligned[index]?.minutes ?? step.minutes,
  }))
}

const handleOpenProcessTimelineApplyPreview = (mode: EditorProcessTimelineApplyMode) => {
  timelineApplyPreviewMode.value = mode
  if (!timelineApplyPreview.value.canApply) {
    alert('请先填写至少一个有效时间轴环节。')
    return
  }
  showTimelineApplyPreviewDialog.value = true
}

const handleApplyProcessTimelineDraft = (
  mode: EditorProcessTimelineApplyMode,
  options?: { skipReplaceConfirm?: boolean }
) => {
  const normalizedSteps = normalizeEditorTimelineDraftSteps(processTimelineDraftSteps.value)
  if (!normalizedSteps.length) {
    alert('请先填写至少一个有效时间轴环节。')
    return
  }

  if (!options?.skipReplaceConfirm && mode === 'replace' && htmlToText(form.process).trim()) {
    const confirmed = window.confirm('应用可视化时间轴将替换当前教学过程内容，是否继续？')
    if (!confirmed) {
      return
    }
  }

  const next = applyEditorTimelineStepsToForm(
    form as EditorPlanForm,
    normalizedSteps,
    mode
  )
  Object.assign(form, next)
}

const handleConfirmProcessTimelineApplyPreview = () => {
  if (!timelineApplyPreview.value.canApply) {
    return
  }
  showTimelineApplyPreviewDialog.value = false
  handleApplyProcessTimelineDraft(timelineApplyPreviewMode.value, { skipReplaceConfirm: true })
}

const handleSelectLessonSkeletonPreset = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  const nextPreset = target?.value ?? ''
  if (!lessonSkeletonOptions.some((option) => option.id === nextPreset)) {
    return
  }
  selectedLessonSkeletonPreset.value = nextPreset as EditorLessonSkeletonPreset
  lessonSkeletonPresetManuallySelected.value = true
}

const handleSelectProcessTimelinePreset = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  const nextPreset = target?.value ?? ''
  if (!processTimelineOptions.some((option) => option.id === nextPreset)) {
    return
  }
  selectedProcessTimelinePreset.value = nextPreset as EditorProcessTimelinePreset
  handleResetProcessTimelineDraft()
}

const handleGenerateProcessTimeline = (mode: EditorProcessTimelineApplyMode) => {
  if (form.duration <= 0) {
    alert('请先填写有效的课时长度。')
    handleFocusEditorSection('basic')
    return
  }
  if (mode === 'replace' && htmlToText(form.process).trim()) {
    const confirmed = window.confirm('生成时间轴将替换当前教学过程内容，是否继续？')
    if (!confirmed) {
      return
    }
  }
  const next = applyEditorProcessTimeline(
    form as EditorPlanForm,
    selectedProcessTimelinePreset.value,
    mode
  )
  Object.assign(form, next)
  handleResetProcessTimelineDraft()
}

const handleApplyLessonSkeleton = (mode: EditorLessonSkeletonApplyMode) => {
  if (mode === 'overwrite') {
    const confirmed = window.confirm('覆盖套用将替换当前已填写内容，是否继续？')
    if (!confirmed) {
      return
    }
  }
  const next = applyEditorLessonSkeleton(
    form as EditorPlanForm,
    selectedLessonSkeletonPreset.value,
    mode
  )
  Object.assign(form, next)
}

const handleApplyRecommendedLessonSkeleton = () => {
  selectedLessonSkeletonPreset.value = recommendedLessonSkeletonPreset.value
  lessonSkeletonPresetManuallySelected.value = false
  handleApplyLessonSkeleton('fill-empty')
}

const handleApplyExportPrecheckFix = (action: EditorExportPrecheckFixAction) => {
  const next = applyEditorExportPrecheckFix(form as EditorPlanForm, action.key)
  Object.assign(form, next)
  handleFocusEditorSection(action.section)
}

const handleApplyAllExportPrecheckFixes = () => {
  if (!editorExportPrecheckFixActions.value.length) {
    return
  }
  let nextForm = {
    ...(form as EditorPlanForm),
    contentJson: { ...form.contentJson },
  } as EditorPlanForm
  for (const action of editorExportPrecheckFixActions.value) {
    nextForm = applyEditorExportPrecheckFix(nextForm, action.key)
  }
  Object.assign(form, nextForm)
  const lastAction = editorExportPrecheckFixActions.value[editorExportPrecheckFixActions.value.length - 1]
  if (lastAction) {
    handleFocusEditorSection(lastAction.section)
  }
}

const buildEditorExportPrecheckMessage = (report: EditorExportPrecheckReport): string => {
  const lines: string[] = []
  if (report.blockingIssues.length > 0) {
    lines.push('导出前预检发现以下阻塞项：')
    for (const issue of report.blockingIssues) {
      lines.push(`- ${issue}`)
    }
  } else {
    lines.push('导出前预检通过。')
  }
  if (report.warningIssues.length > 0) {
    lines.push('建议优化：')
    for (const warning of report.warningIssues.slice(0, 3)) {
      lines.push(`- ${warning}`)
    }
  }
  lines.push('是否继续导出？')
  return lines.join('\n')
}

const clearLocalDraft = () => {
  localStorage.removeItem(localDraftStorageKey.value)
  localDraftHistory.value = []
  selectedLocalDraftSavedAt.value = ''
  localDraftMessage.value = ''
}

const writeLocalDraftHistory = (history: EditorLocalDraft[]) => {
  localDraftHistory.value = history
  if (!history.length) {
    localStorage.removeItem(localDraftStorageKey.value)
    return
  }
  localStorage.setItem(localDraftStorageKey.value, serializeEditorLocalDraftHistory(history))
}

const persistLocalDraft = (force = false) => {
  if (!hasUnsavedDraft.value || isEditorSaving.value) {
    return
  }

  const nextHistory = pushEditorLocalDraftHistory(localDraftHistory.value, form as EditorPlanForm)
  writeLocalDraftHistory(nextHistory)
  selectedLocalDraftSavedAt.value = orderedLocalDraftHistory.value[0]?.savedAt || ''
  const latest = orderedLocalDraftHistory.value[0] || null
  const timeLabel = latest ? formatDraftTimestamp(latest.savedAt) : ''
  localDraftMessage.value = force
    ? timeLabel
      ? `已离开前保存本地草稿：${timeLabel}`
      : '已离开前保存本地草稿'
    : timeLabel
      ? `本地草稿已自动保存：${timeLabel}`
      : '本地草稿已自动保存'
}

const schedulePersistLocalDraft = () => {
  if (!isDraftPersistenceReady.value) {
    return
  }

  if (localDraftPersistTimer) {
    clearTimeout(localDraftPersistTimer)
  }

  localDraftPersistTimer = setTimeout(() => {
    persistLocalDraft()
  }, 600)
}

const restoreLocalDraftIfNeeded = (): boolean => {
  const draftHistory = parseEditorLocalDraftHistory(localStorage.getItem(localDraftStorageKey.value))
  localDraftHistory.value = draftHistory
  selectedLocalDraftSavedAt.value = sortEditorLocalDraftHistoryForView(draftHistory)[0]?.savedAt || ''
  const draft = sortEditorLocalDraftHistoryForView(draftHistory)[0] ?? null
  if (!draft) {
    return false
  }

  const timeLabel = formatDraftTimestamp(draft.savedAt) || '未知时间'
  const message = isEditing.value
    ? `检测到本地未保存草稿（${timeLabel}），是否恢复？`
    : `检测到上次未完成草稿（${timeLabel}），是否恢复？`

  if (!window.confirm(message)) {
    return false
  }

  Object.assign(form, draft.form)
  localDraftMessage.value = `已恢复本地草稿：${timeLabel}`
  contentSource.value = 'local'
  return true
}

const refreshLocalDraft = () => {
  localDraftHistory.value = parseEditorLocalDraftHistory(localStorage.getItem(localDraftStorageKey.value))
  if (!orderedLocalDraftHistory.value.length) {
    selectedLocalDraftSavedAt.value = ''
    return
  }
  const selectedExists = orderedLocalDraftHistory.value.some((item) => item.savedAt === selectedLocalDraftSavedAt.value)
  if (!selectedExists) {
    selectedLocalDraftSavedAt.value = orderedLocalDraftHistory.value[0].savedAt
  }
}

const resetLocalDraftImportState = () => {
  showImportPreviewDialog.value = false
  localDraftImportCandidates.value = []
  localDraftImportSearch.value = ''
  selectedImportDraftSavedAt.value = []
  localDraftImportFieldSelections.value = {}
  localDraftImportMode.value = 'prefer-imported'
  showOnlyConflictImportDrafts.value = false
  showOnlySelectedImportDrafts.value = false
  applyPresetToSelectedConflictOnly.value = true
  expandedImportConflictSavedAt.value = []
}

const handleCancelImportPreview = () => {
  resetLocalDraftImportState()
}

const handleCloseDraftDialog = () => {
  showDraftDialog.value = false
  resetLocalDraftImportState()
}

const handleToggleImportDraftSelection = (savedAt: string) => {
  if (selectedImportDraftSavedAt.value.includes(savedAt)) {
    selectedImportDraftSavedAt.value = selectedImportDraftSavedAt.value.filter((item) => item !== savedAt)
    return
  }
  selectedImportDraftSavedAt.value = [...selectedImportDraftSavedAt.value, savedAt]
}

const handleSelectAllImportDrafts = () => {
  selectedImportDraftSavedAt.value = selectEditorLocalDraftImportSavedAtByStrategy(
    localDraftImportCandidates.value,
    'all'
  )
}

const handleSelectConflictImportDrafts = () => {
  selectedImportDraftSavedAt.value = selectEditorLocalDraftImportSavedAtByStrategy(
    localDraftImportCandidates.value,
    'conflict'
  )
}

const handleSelectNewImportDrafts = () => {
  selectedImportDraftSavedAt.value = selectEditorLocalDraftImportSavedAtByStrategy(
    localDraftImportCandidates.value,
    'new'
  )
}

const handleClearImportDraftSelection = () => {
  selectedImportDraftSavedAt.value = selectEditorLocalDraftImportSavedAtByStrategy(
    localDraftImportCandidates.value,
    'none'
  )
}

const handleConfirmImportPreview = () => {
  if (!selectedImportDraftSavedAt.value.length) {
    alert('请至少勾选一条草稿')
    return
  }

  const preview = localDraftImportPreview.value
  writeLocalDraftHistory(preview.mergedHistory)
  localDraftSearch.value = ''
  selectedLocalDraftSavedAt.value =
    sortEditorLocalDraftHistoryForView(preview.mergedHistory)[0]?.savedAt || ''
  localDraftMessage.value =
    preview.droppedByLimitCount > 0
      ? `草稿导入成功：新增 ${preview.newCount} 条，覆盖 ${preview.overwriteCount} 条，因上限移除 ${preview.droppedByLimitCount} 条`
      : preview.conflictCount > 0 && preview.overwriteCount === 0
        ? `草稿导入成功：新增 ${preview.newCount} 条，保留本地冲突 ${preview.conflictCount} 条`
        : `草稿导入成功：新增 ${preview.newCount} 条，覆盖 ${preview.overwriteCount} 条`
  resetLocalDraftImportState()
}

const handleOpenDraftDialog = () => {
  refreshLocalDraft()
  localDraftSearch.value = ''
  resetLocalDraftImportState()
  showDraftDialog.value = true
}

const handleSelectLocalDraft = (savedAt: string) => {
  selectedLocalDraftSavedAt.value = savedAt
}

const handleToggleLocalDraftPinned = (savedAt: string) => {
  const nextHistory = toggleEditorLocalDraftPinned(localDraftHistory.value, savedAt)
  writeLocalDraftHistory(nextHistory)
}

const handleRenameLocalDraft = (savedAt: string) => {
  const target = localDraftHistory.value.find((item) => item.savedAt === savedAt)
  if (!target) {
    return
  }
  const nextName = window.prompt('请输入新的草稿名称', resolveEditorLocalDraftDisplayName(target))
  if (nextName === null) {
    return
  }
  const nextHistory = renameEditorLocalDraft(localDraftHistory.value, savedAt, nextName)
  writeLocalDraftHistory(nextHistory)
}

const handleExportLocalDrafts = () => {
  if (!localDraftHistory.value.length) {
    alert('暂无可导出的草稿')
    return
  }

  const fileName = buildEditorLocalDraftExportFileName(isEditing.value ? planId.value : null)
  const payload = serializeEditorLocalDraftExportPayload(localDraftHistory.value)
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const triggerImportLocalDrafts = () => {
  localDraftImportInputRef.value?.click()
}

const handleImportLocalDrafts = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) {
    return
  }

  try {
    const raw = await file.text()
    const imported = parseEditorLocalDraftImportPayload(raw)
    if (!imported.length) {
      alert('导入失败：未检测到有效草稿数据')
      return
    }

    const candidates = buildEditorLocalDraftImportCandidates(localDraftHistory.value, imported)
    if (!candidates.length) {
      alert('导入失败：未检测到有效草稿数据')
      return
    }

    localDraftImportCandidates.value = candidates
    localDraftImportSearch.value = ''
    selectedImportDraftSavedAt.value = candidates.map((item) => item.draft.savedAt)
    localDraftImportFieldSelections.value = {}
    localDraftImportMode.value = 'prefer-imported'
    showOnlyConflictImportDrafts.value = false
    showOnlySelectedImportDrafts.value = false
    applyPresetToSelectedConflictOnly.value = true
    expandedImportConflictSavedAt.value = []
    showImportPreviewDialog.value = true
  } catch {
    alert('导入失败：请检查文件格式')
  } finally {
    if (input) {
      input.value = ''
    }
  }
}

const handleRestoreLocalDraft = () => {
  if (!selectedLocalDraft.value) {
    return
  }
  Object.assign(form, selectedLocalDraft.value.form)
  const timeLabel = formatDraftTimestamp(selectedLocalDraft.value.savedAt)
  localDraftMessage.value = timeLabel ? `已恢复本地草稿：${timeLabel}` : '已恢复本地草稿'
  contentSource.value = 'local'
  showDraftDialog.value = false
}

const handleClearUnpinnedLocalDrafts = () => {
  const unpinnedCount = unpinnedDraftCount.value
  if (!unpinnedCount) {
    return
  }

  const confirmed = window.confirm(
    buildClearUnpinnedDraftConfirmMessage(unpinnedCount, pinnedDraftCount.value)
  )
  if (!confirmed) {
    return
  }

  const nextHistory = removeUnpinnedEditorLocalDrafts(localDraftHistory.value)
  writeLocalDraftHistory(nextHistory)
  localDraftMessage.value = `已清理 ${unpinnedCount} 条未置顶草稿`
}

const handleClearLocalDraft = () => {
  if (!localDraftHistory.value.length) {
    handleCloseDraftDialog()
    return
  }

  const confirmed = window.confirm(
    buildClearAllDraftConfirmMessage(localDraftHistory.value.length, pinnedDraftCount.value)
  )
  if (!confirmed) {
    return
  }

  clearLocalDraft()
  localDraftSearch.value = ''
  handleCloseDraftDialog()
}

const persistLocalDraftBeforeLeave = () => {
  if (!shouldPersistLocalDraftOnLeave(hasUnsavedDraft.value, isEditorSaving.value)) {
    return
  }
  persistLocalDraft(true)
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  persistLocalDraftBeforeLeave()
  if (!shouldPromptUnsavedChanges(hasUnsavedDraft.value, isEditorSaving.value)) {
    return
  }
  event.preventDefault()
  event.returnValue = ''
}

const confirmLeaveWithUnsavedDraft = (): boolean => {
  if (!shouldPromptUnsavedChanges(hasUnsavedDraft.value, isEditorSaving.value)) {
    return true
  }
  return window.confirm('当前教案有未保存更改，确定离开吗？')
}

const handleOpenShortcutDialog = () => {
  shortcutDraftConfig.value = cloneShortcutConfig(shortcutConfig.value)
  shortcutConfigMessage.value = ''
  showShortcutDialog.value = true
}

const handleResetShortcutDraftToDefault = () => {
  shortcutDraftConfig.value = cloneShortcutConfig(DEFAULT_EDITOR_SHORTCUT_CONFIG)
  shortcutConfigMessage.value = ''
}

const handleSaveShortcutConfig = () => {
  if (hasShortcutConflicts.value) {
    shortcutConfigMessage.value = '存在快捷键冲突，请先调整后再保存。'
    return
  }
  shortcutConfig.value = cloneShortcutConfig(shortcutDraftConfig.value)
  shortcutConfigMessage.value = '快捷键配置已保存'
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EDITOR_SHORTCUT_STORAGE_KEY, JSON.stringify(shortcutConfig.value))
  }
}

const isShortcutActionEnabled = (action: EditorShortcutAction): boolean => {
  if (action === 'insertTable' || action === 'deleteTable') {
    return false
  }
  if (action === 'export') {
    return isEditing.value
  }
  if (action === 'publish') {
    return canPublishCurrentDocument.value
  }
  return true
}

const matchesShortcut = (event: KeyboardEvent, config: EditorShortcutConfig): boolean =>
  event.key.toUpperCase() === config.key && event.shiftKey === config.shift

const runShortcutAction = async (action: EditorShortcutAction) => {
  if (action === 'save') {
    await handleSave()
    return
  }
  if (action === 'openHelp') {
    handleOpenShortcutDialog()
    return
  }
  if (action === 'export') {
    await handleExport()
    return
  }
  if (action === 'publish') {
    await handlePublish()
  }
}

const handleEditorKeyboardShortcuts = async (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showShortcutDialog.value) {
    showShortcutDialog.value = false
    return
  }

  // Alt/Option + 1~4 switches main editor tabs.
  if (!showTemplateEditDialog.value && event.altKey && !event.metaKey && !event.ctrlKey) {
    const targetTab = resolveEditorLayoutTabByShortcutKey(event.key)
    if (targetTab) {
      event.preventDefault()
      handleSelectEditorLayoutTab(targetTab)
      return
    }
  }

  if (event.repeat || !(event.metaKey || event.ctrlKey) || event.altKey) {
    return
  }

  for (const action of SHORTCUT_ACTIONS) {
    if (!isShortcutActionEnabled(action.id)) {
      continue
    }
    if (!matchesShortcut(event, shortcutConfig.value[action.id])) {
      continue
    }
    event.preventDefault()
    await runShortcutAction(action.id)
    return
  }
}

onBeforeRouteLeave((_to, _from, next) => {
  persistLocalDraftBeforeLeave()
  if (confirmLeaveWithUnsavedDraft()) {
    next()
    return
  }
  next(false)
})

onMounted(async () => {
  loadShortcutConfigFromStorage()
  loadEditorViewPreferenceFromStorage()
  contentSource.value = isEditing.value ? 'server' : 'new'
  if (isEditing.value) {
    await loadPlan()
  } else {
    updateSavedDraftSignature()
  }
  restoreLocalDraftIfNeeded()
  handleResetProcessTimelineDraft()
  resetProcessTimelineDraftHistory()
  syncTimelineDragCapability()
  isDraftPersistenceReady.value = true
  await loadTemplates()
  await nextTick()
  syncActiveEditorSectionByViewport()
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleEditorKeyboardShortcuts)
  window.addEventListener('scroll', handleEditorViewportChange, { passive: true })
  window.addEventListener('resize', handleEditorViewportChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('keydown', handleEditorKeyboardShortcuts)
  window.removeEventListener('scroll', handleEditorViewportChange)
  window.removeEventListener('resize', handleEditorViewportChange)
  if (typeof window !== 'undefined' && editorSectionSyncRafId !== null) {
    window.cancelAnimationFrame(editorSectionSyncRafId)
    editorSectionSyncRafId = null
  }
  if (localDraftPersistTimer) {
    clearTimeout(localDraftPersistTimer)
    localDraftPersistTimer = null
  }
})

const resetLessonContext = () => {
  lessonStatus.value = 'DRAFT'
  lessonHeaderTeacherName.value = ''
  lessonHeaderCourseName.value = ''
  lessonContext.bookId = ''
  lessonContext.lessonType = ''
  lessonContext.weekNo = null
  lessonContext.weekday = ''
  lessonContext.period = ''
  lessonContext.lessonDate = ''
  lessonContext.deliveryPlanId = null
  lessonContext.deliveryPlanWeekId = null
  lessonContext.courseStandardTopicRefs = []
  lessonContext.ideologicalElements = ''
  lessonContext.integrationMethod = ''
  lessonContext.difficulty = ''
  lessonContext.teachingAids = ''
  lessonTraceabilityResult.value = null
  lessonTopicSearch.value = ''
  lessonTopicCandidates.value = []
  lessonWeekTopicLinkMap.value = {}
  lessonCourseOfferingId.value = null
  lessonCoursewareAssets.value = []
  selectedLessonCoursewareAssetIds.value = []
  isLessonCoursewareBatchUpdating.value = false
  deletingLessonCoursewareAssetId.value = ''
  editingLessonCoursewareAssetId.value = ''
  autofillingLessonCoursewareAssetId.value = ''
  lessonCoursewareForm.title = ''
  lessonCoursewareForm.fileName = ''
  lessonCoursewareForm.fileUrl = ''
  lessonCoursewareForm.chapterRef = ''
  lessonCoursewareForm.tagsText = ''
  lessonCoursewareForm.ideologicalElementsText = ''
  lessonCoursewareBatchForm.chapterRef = ''
  lessonCoursewareBatchForm.tagsText = ''
  lessonCoursewareBatchForm.ideologicalElementsText = ''
}

const mapLessonToEditorPlan = (lesson: TeachingPlanLessonDetail) => ({
  title: lesson.title || '',
  courseName: lesson.book?.courseOffering?.course?.name || '',
  className: lesson.className || lesson.book?.courseOffering?.className || '',
  duration: lesson.duration || 90,
  methods: lesson.methods || '',
  resources: lesson.teachingAids || '',
  objectives: lesson.objectives || '',
  keyPoints: lesson.keyPoints || '',
  process: lesson.outline || '',
  blackboard: '',
  reflection: lesson.reflection || '',
  contentJson: lesson.contentJson || {},
})

const extractLessonTopicCandidates = (
  deliveryPlan: DeliveryPlanDetail | null | undefined
): Array<{ id: string; title: string; moduleName: string }> => {
  const modules = deliveryPlan?.courseStandard?.modules || []
  return modules.flatMap((module) =>
    (module.topics || []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      moduleName: module.name,
    }))
  )
}

const syncLessonTopicRefsByWeek = (deliveryPlan: DeliveryPlanDetail | null | undefined) => {
  if (!deliveryPlan?.weeks || lessonContext.weekNo === null || lessonContext.courseStandardTopicRefs.length > 0) {
    return
  }
  const currentWeek = deliveryPlan.weeks.find((week) => week.weekNo === lessonContext.weekNo)
  if (currentWeek && Array.isArray(currentWeek.linkedStandardTopicIds) && currentWeek.linkedStandardTopicIds.length > 0) {
    lessonContext.courseStandardTopicRefs = Array.from(new Set(currentWeek.linkedStandardTopicIds))
  }
}

const loadLessonTopicCandidates = async () => {
  if (!lessonContext.deliveryPlanId) {
    lessonTopicCandidates.value = []
    lessonWeekTopicLinkMap.value = {}
    return
  }

  isLessonTopicLoading.value = true
  try {
    const deliveryPlan = await getDeliveryPlan(lessonContext.deliveryPlanId)
    lessonTopicCandidates.value = extractLessonTopicCandidates(deliveryPlan)
    lessonWeekTopicLinkMap.value = Object.fromEntries(
      (deliveryPlan.weeks || []).map((week) => [week.weekNo, Array.isArray(week.linkedStandardTopicIds) ? week.linkedStandardTopicIds : []])
    )
    syncLessonTopicRefsByWeek(deliveryPlan)
  } catch {
    lessonTopicCandidates.value = []
    lessonWeekTopicLinkMap.value = {}
  } finally {
    isLessonTopicLoading.value = false
  }
}

const handleToggleLessonTopicRef = (topicId: string) => {
  if (lessonContext.courseStandardTopicRefs.includes(topicId)) {
    lessonContext.courseStandardTopicRefs = lessonContext.courseStandardTopicRefs.filter((id) => id !== topicId)
    return
  }
  lessonContext.courseStandardTopicRefs = [...lessonContext.courseStandardTopicRefs, topicId]
}

const handleSelectAllFilteredLessonTopics = () => {
  const merged = new Set(lessonContext.courseStandardTopicRefs)
  filteredLessonTopicCandidates.value.forEach((item) => merged.add(item.id))
  lessonContext.courseStandardTopicRefs = Array.from(merged)
}

const handleClearAllLessonTopicRefs = () => {
  lessonContext.courseStandardTopicRefs = []
}

const resolveCoursewareMissingFields = (asset: CoursewareAsset): string[] => {
  const missing: string[] = []
  if (!asset.chapterRef?.trim()) {
    missing.push('章节')
  }
  if (!asset.tags || asset.tags.length === 0) {
    missing.push('标签')
  }
  if (!asset.ideologicalElements || asset.ideologicalElements.length === 0) {
    missing.push('思政标签')
  }
  return missing
}

const parseCommaSeparatedValues = (value: string): string[] =>
  value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)

const resolveLessonCoursewareFallbackIdeologicalTags = (): string[] => {
  const tags = parseCommaSeparatedValues(lessonContext.ideologicalElements)
  return tags.length > 0 ? tags : ['课程思政']
}

const resolveLessonCoursewareFallbackChapter = (): string =>
  lessonContext.weekNo ? `第${lessonContext.weekNo}周` : '未标注章节'

const resetLessonCoursewareForm = () => {
  lessonCoursewareForm.title = ''
  lessonCoursewareForm.fileName = ''
  lessonCoursewareForm.fileUrl = ''
  lessonCoursewareForm.chapterRef = ''
  lessonCoursewareForm.tagsText = ''
  lessonCoursewareForm.ideologicalElementsText = ''
  editingLessonCoursewareAssetId.value = ''
}

const resetLessonCoursewareBatchForm = () => {
  lessonCoursewareBatchForm.chapterRef = ''
  lessonCoursewareBatchForm.tagsText = ''
  lessonCoursewareBatchForm.ideologicalElementsText = ''
}

const handleToggleLessonCoursewareAssetSelection = (assetId: string) => {
  if (selectedLessonCoursewareAssetIds.value.includes(assetId)) {
    selectedLessonCoursewareAssetIds.value = selectedLessonCoursewareAssetIds.value.filter((id) => id !== assetId)
    return
  }
  selectedLessonCoursewareAssetIds.value = [...selectedLessonCoursewareAssetIds.value, assetId]
}

const handleToggleAllLessonCoursewareAssetSelection = () => {
  if (isAllLessonCoursewareSelected.value) {
    selectedLessonCoursewareAssetIds.value = []
    return
  }
  selectedLessonCoursewareAssetIds.value = lessonCoursewareAssets.value.map((asset) => asset.id)
}

const handleClearLessonCoursewareAssetSelection = () => {
  selectedLessonCoursewareAssetIds.value = []
}

const handleApplyLessonCoursewareBatchUpdate = async (options: { onlyMissing: boolean }) => {
  if (selectedLessonCoursewareAssets.value.length === 0) {
    alert('请先选择至少一个课件附件')
    return
  }

  const chapterInput = lessonCoursewareBatchForm.chapterRef.trim()
  const tagsInput = parseCommaSeparatedValues(lessonCoursewareBatchForm.tagsText)
  const ideologicalInput = parseCommaSeparatedValues(lessonCoursewareBatchForm.ideologicalElementsText)
  if (!options.onlyMissing && !chapterInput && tagsInput.length === 0 && ideologicalInput.length === 0) {
    alert('请先填写要批量更新的字段')
    return
  }

  isLessonCoursewareBatchUpdating.value = true
  try {
    let updatedCount = 0
    for (const asset of selectedLessonCoursewareAssets.value) {
      const payload: Record<string, unknown> = {}
      if (options.onlyMissing) {
        if (!asset.chapterRef?.trim()) {
          payload.chapterRef = chapterInput || resolveLessonCoursewareFallbackChapter()
        }
        if ((asset.tags || []).length === 0) {
          payload.tags = tagsInput.length > 0 ? tagsInput : ['课件']
        }
        if ((asset.ideologicalElements || []).length === 0) {
          payload.ideologicalElements = ideologicalInput.length > 0
            ? ideologicalInput
            : resolveLessonCoursewareFallbackIdeologicalTags()
        }
      } else {
        if (chapterInput) {
          payload.chapterRef = chapterInput
        }
        if (tagsInput.length > 0) {
          payload.tags = tagsInput
        }
        if (ideologicalInput.length > 0) {
          payload.ideologicalElements = ideologicalInput
        }
      }

      if (Object.keys(payload).length === 0) {
        continue
      }
      await updateCoursewareAsset(asset.id, payload)
      updatedCount += 1
    }

    if (updatedCount === 0) {
      alert(options.onlyMissing ? '所选附件没有可补齐字段' : '未检测到可更新内容')
      return
    }
    await loadLessonCoursewareAssets()
    await runLessonTraceabilityCheck({ silent: true })
    if (options.onlyMissing) {
      alert(`批量补齐完成，共更新 ${updatedCount} 条附件`)
    } else {
      alert(`批量更新完成，共更新 ${updatedCount} 条附件`)
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const message = err?.response?.data?.message || err?.message || '批量更新课件附件失败'
    alert(message)
  } finally {
    isLessonCoursewareBatchUpdating.value = false
  }
}

const loadLessonCoursewareAssets = async () => {
  if (!isLessonEditorMode.value || !planId.value) {
    lessonCoursewareAssets.value = []
    return
  }

  isLessonCoursewareLoading.value = true
  try {
    const data = await listCoursewareAssets({
      teachingPlanLessonId: planId.value,
      limit: 100,
    })
    lessonCoursewareAssets.value = data.items
    const validIdSet = new Set(data.items.map((item) => item.id))
    selectedLessonCoursewareAssetIds.value = selectedLessonCoursewareAssetIds.value.filter((id) => validIdSet.has(id))
  } catch {
    lessonCoursewareAssets.value = []
    selectedLessonCoursewareAssetIds.value = []
  } finally {
    isLessonCoursewareLoading.value = false
  }
}

const handleCreateLessonCoursewareAsset = async () => {
  if (!isLessonEditorMode.value || !planId.value) {
    return
  }
  if (!lessonCoursewareForm.title.trim() || !lessonCoursewareForm.fileName.trim() || !lessonCoursewareForm.fileUrl.trim()) {
    alert('请先填写附件标题、文件名和文件地址')
    return
  }

  const editingAssetId = editingLessonCoursewareAssetId.value
  isLessonCoursewareSubmitting.value = true
  try {
    const payload = {
      title: lessonCoursewareForm.title.trim(),
      fileName: lessonCoursewareForm.fileName.trim(),
      fileUrl: lessonCoursewareForm.fileUrl.trim(),
      courseOfferingId: lessonCourseOfferingId.value || undefined,
      deliveryPlanWeekId: lessonContext.deliveryPlanWeekId || undefined,
      teachingPlanLessonId: planId.value,
      chapterRef: lessonCoursewareForm.chapterRef.trim() || undefined,
      tags: parseCommaSeparatedValues(lessonCoursewareForm.tagsText),
      ideologicalElements: parseCommaSeparatedValues(lessonCoursewareForm.ideologicalElementsText),
    }
    if (editingAssetId) {
      await updateCoursewareAsset(editingAssetId, payload)
    } else {
      await createCoursewareAsset(payload)
    }
    await loadLessonCoursewareAssets()
    resetLessonCoursewareForm()
    await runLessonTraceabilityCheck({ silent: true })
    alert(editingAssetId ? '课件附件已更新' : '课件附件已添加')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const message = err?.response?.data?.message || err?.message || '保存课件附件失败'
    alert(message)
  } finally {
    isLessonCoursewareSubmitting.value = false
  }
}

const handleEditLessonCoursewareAsset = (asset: CoursewareAsset) => {
  editingLessonCoursewareAssetId.value = asset.id
  lessonCoursewareForm.title = asset.title || ''
  lessonCoursewareForm.fileName = asset.fileName || ''
  lessonCoursewareForm.fileUrl = asset.fileUrl || ''
  lessonCoursewareForm.chapterRef = asset.chapterRef || ''
  lessonCoursewareForm.tagsText = (asset.tags || []).join(', ')
  lessonCoursewareForm.ideologicalElementsText = (asset.ideologicalElements || []).join(', ')
}

const handleCancelEditLessonCoursewareAsset = () => {
  resetLessonCoursewareForm()
}

const handleAutofillLessonCoursewareAsset = async (asset: CoursewareAsset) => {
  const missingFields = resolveCoursewareMissingFields(asset)
  if (missingFields.length === 0) {
    return
  }

  const lessonIdeologicalDefaults = parseCommaSeparatedValues(lessonContext.ideologicalElements)
  autofillingLessonCoursewareAssetId.value = asset.id
  try {
    await updateCoursewareAsset(asset.id, {
      chapterRef: asset.chapterRef?.trim() || (lessonContext.weekNo ? `第${lessonContext.weekNo}周` : '未标注章节'),
      tags: asset.tags.length > 0 ? asset.tags : ['课件'],
      ideologicalElements:
        asset.ideologicalElements.length > 0
          ? asset.ideologicalElements
          : lessonIdeologicalDefaults.length > 0
            ? lessonIdeologicalDefaults
            : ['课程思政'],
    })
    await loadLessonCoursewareAssets()
    await runLessonTraceabilityCheck({ silent: true })
    alert(`已补齐：${missingFields.join('、')}`)
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const message = err?.response?.data?.message || err?.message || '课件附件自动补齐失败'
    alert(message)
  } finally {
    autofillingLessonCoursewareAssetId.value = ''
  }
}

const handleAutofillAllMissingLessonCoursewareAssets = async () => {
  if (lessonCoursewareAssets.value.length === 0) {
    alert('暂无可处理的课件附件')
    return
  }
  selectedLessonCoursewareAssetIds.value = lessonCoursewareAssets.value.map((asset) => asset.id)
  await handleApplyLessonCoursewareBatchUpdate({ onlyMissing: true })
}

const handleDeleteLessonCoursewareAsset = async (assetId: string) => {
  if (!assetId) {
    return
  }
  if (!window.confirm('确定删除该课件附件吗？删除后将从映证链路中移除。')) {
    return
  }

  deletingLessonCoursewareAssetId.value = assetId
  try {
    await deleteCoursewareAsset(assetId)
    await loadLessonCoursewareAssets()
    if (editingLessonCoursewareAssetId.value === assetId) {
      resetLessonCoursewareForm()
    }
    await runLessonTraceabilityCheck({ silent: true })
    alert('课件附件已删除')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const message = err?.response?.data?.message || err?.message || '删除课件附件失败'
    alert(message)
  } finally {
    deletingLessonCoursewareAssetId.value = ''
  }
}

const handleFocusLessonCoursewareSection = () => {
  if (typeof document === 'undefined') {
    return
  }
  const element = document.getElementById('lesson-courseware-traceability')
  if (!element) {
    return
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const handleOpenLessonWarningWorkbench = (tab: 'standards' | 'delivery' | 'courseware') => {
  if (!isLessonEditorMode.value || !planId.value) {
    return
  }
  const query: Record<string, string> = {
    source: 'editor-lesson-warning',
    tab,
    lessonId: planId.value,
  }
  if (lessonContext.deliveryPlanId) {
    query.deliveryPlanId = lessonContext.deliveryPlanId
  }
  if (lessonContext.bookId) {
    query.bookId = lessonContext.bookId
  }
  if (lessonCourseOfferingId.value) {
    query.courseOfferingId = lessonCourseOfferingId.value
  }
  if (lessonContext.weekNo) {
    query.weekNo = String(lessonContext.weekNo)
  }
  router.push({
    path: '/workbench',
    query,
  })
}

const scrollToLessonField = (fieldId: string) => {
  if (typeof document === 'undefined') {
    return
  }
  const element = document.getElementById(fieldId)
  if (!element) {
    return
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const input = element.querySelector('input, textarea, select') as HTMLElement | null
  input?.focus()
}

const buildLessonPublishWarningMessage = (warnings: string[]) => {
  const lines: string[] = [`映证预检发现 ${warnings.length} 条告警：`]
  for (const warning of warnings) {
    lines.push(`- ${warning}`)
  }
  const checklist = resolveLessonWarningFixChecklist(warnings)
  if (checklist.length > 0) {
    lines.push('', '建议优先处理：')
    for (const item of checklist) {
      lines.push(`- ${item}`)
    }
  }
  lines.push('', '可在告警区点击“去处理”快速定位或跳转工作台。')
  lines.push('是否继续发布？')
  return lines.join('\n')
}

const handleApplyLessonWarningAutofix = async () => {
  if (!lessonWarningHasCoursewareAutofix.value) {
    alert('当前告警暂无可自动修复项')
    return
  }
  if (lessonCoursewareAssets.value.length === 0) {
    alert('暂无课件附件可自动修复，请先新增课件附件')
    handleFocusLessonCoursewareSection()
    return
  }
  await handleAutofillAllMissingLessonCoursewareAssets()
}

const handleResolveLessonWarning = async (warning: string) => {
  if (warning.includes('课件附件')) {
    if (warning.includes('未关联任何课件附件') && lessonCoursewareAssets.value.length === 0) {
      const openWorkbench = window.confirm('当前单次课尚未关联课件附件，是否前往“教学链路 > 课件附件”补充素材？')
      if (openWorkbench) {
        handleOpenLessonWarningWorkbench('courseware')
        return
      }
    }
    handleFocusLessonCoursewareSection()
    if (
      warning.includes('缺少章节标注')
      || warning.includes('缺少标签')
      || warning.includes('缺少思政标签')
    ) {
      const confirmed = window.confirm('检测到课件附件字段缺失，是否立即执行一键补齐？')
      if (confirmed) {
        await handleAutofillAllMissingLessonCoursewareAssets()
      }
    }
    return
  }

  if (warning.includes('思政元素')) {
    if (warning.includes('授课计划')) {
      const openWorkbench = window.confirm('该告警涉及授课计划周次配置，是否前往“教学链路 > 授课计划”处理？')
      if (openWorkbench) {
        handleOpenLessonWarningWorkbench('delivery')
        return
      }
    }
    scrollToLessonField('lesson-field-ideology')
    return
  }

  if (warning.includes('融入方式')) {
    if (warning.includes('授课计划')) {
      const openWorkbench = window.confirm('该告警涉及授课计划周次配置，是否前往“教学链路 > 授课计划”处理？')
      if (openWorkbench) {
        handleOpenLessonWarningWorkbench('delivery')
        return
      }
    }
    scrollToLessonField('lesson-field-integration')
    return
  }

  if (warning.includes('课程标准')) {
    const openWorkbench = window.confirm('该告警通常需要在“教学链路 > 课程标准”或“授课计划”中核对，是否前往工作台？')
    if (openWorkbench) {
      handleOpenLessonWarningWorkbench('standards')
      return
    }
    scrollToLessonField('lesson-field-topic-refs')
    return
  }

  if (warning.includes('授课计划') || warning.includes('周次')) {
    const openWorkbench = window.confirm('该告警通常需要在“教学链路 > 授课计划”中处理，是否前往工作台？')
    if (openWorkbench) {
      handleOpenLessonWarningWorkbench('delivery')
      return
    }
    scrollToLessonField('lesson-field-week-no')
    return
  }

  scrollToLessonField('lesson-field-week-no')
}

const buildTraceabilityValidationSummary = (result: TraceabilityValidationResult): string => {
  if (result.blockers.length > 0) {
    return `映证阻断项：\n${result.blockers.join('\n')}`
  }
  if (result.warnings.length > 0) {
    return `映证告警项：\n${result.warnings.join('\n')}`
  }
  return '映证校验通过，无阻断项和告警项。'
}

const runLessonTraceabilityCheck = async (options?: { silent?: boolean }) => {
  if (!isLessonEditorMode.value || !planId.value) {
    return null
  }

  isLessonTraceabilityChecking.value = true
  try {
    const result = await validateTraceability({
      type: 'teaching-plan-lesson',
      id: planId.value,
    })
    lessonTraceabilityResult.value = result
    if (!options?.silent) {
      alert(buildTraceabilityValidationSummary(result))
    }
    return result
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string }
    const message = err?.response?.data?.message || err?.message || '映证校验失败'
    lessonTraceabilityResult.value = {
      passed: false,
      blockers: [message],
      warnings: [],
    }
    if (!options?.silent) {
      alert(message)
    }
    return null
  } finally {
    isLessonTraceabilityChecking.value = false
  }
}

const handleRunLessonTraceabilityCheck = async () => {
  await runLessonTraceabilityCheck()
}

const loadPlan = async () => {
  try {
    if (isLessonEditorMode.value) {
      const lesson = await getTeachingPlanLesson(planId.value)
      const mapped = mapFetchedPlanToForm(mapLessonToEditorPlan(lesson) as any)
      lessonStatus.value = lesson.status
      lessonContext.bookId = lesson.bookId
      lessonContext.lessonType = lesson.lessonType || ''
      lessonContext.weekNo = lesson.weekNo || null
      lessonContext.weekday = lesson.weekday || ''
      lessonContext.period = lesson.period || ''
      lessonContext.lessonDate = lesson.lessonDate ? String(lesson.lessonDate).slice(0, 10) : ''
      lessonHeaderTeacherName.value = lesson.book?.teacherName || ''
      lessonHeaderCourseName.value = lesson.book?.courseOffering?.course?.name || ''
      lessonContext.deliveryPlanId = lesson.deliveryPlanId || null
      lessonContext.deliveryPlanWeekId = lesson.deliveryPlanWeekId || null
      lessonContext.courseStandardTopicRefs = lesson.courseStandardTopicRefs || []
      lessonContext.ideologicalElements = lesson.ideologicalElements || ''
      lessonContext.integrationMethod = lesson.integrationMethod || ''
      lessonContext.difficulty = lesson.difficulty || ''
      lessonContext.teachingAids = lesson.teachingAids || ''
      lessonCourseOfferingId.value = lesson.book?.courseOfferingId || null
      Object.assign(form, mapped)
      contentSource.value = 'server'
      updateSavedDraftSignature()
      if (lesson.updatedAt) {
        lastSaved.value = new Date(lesson.updatedAt).toLocaleString('zh-CN')
      }
      await loadLessonTopicCandidates()
      await loadLessonCoursewareAssets()
      await runLessonTraceabilityCheck({ silent: true })
      return
    }

    resetLessonContext()
    lessonTraceabilityResult.value = null
    const plan = await planStore.fetchPlan(planId.value)
    const mapped = mapFetchedPlanToForm(plan)
    Object.assign(form, mapped)
    contentSource.value = 'server'
    updateSavedDraftSignature()
    
    if (plan.updatedAt) {
      lastSaved.value = new Date(plan.updatedAt).toLocaleString('zh-CN')
    }
  } catch (error) {
    console.error('加载教案失败:', error)
    alert('加载教案失败')
    router.push('/')
  }
}

watch(
  () => buildEditorDraftSignature(form as EditorPlanForm),
  () => {
    schedulePersistLocalDraft()
  }
)

watch(
  () => form.courseName,
  () => {
    if (lessonSkeletonPresetManuallySelected.value) {
      return
    }
    selectedLessonSkeletonPreset.value = recommendedLessonSkeletonPreset.value
  },
  { immediate: true }
)

watch(
  () => lessonContext.deliveryPlanId,
  async () => {
    if (!isLessonEditorMode.value) {
      return
    }
    await loadLessonTopicCandidates()
  }
)

watch(
  () => lessonContext.weekNo,
  (weekNo) => {
    if (!isLessonEditorMode.value || weekNo === null || lessonContext.courseStandardTopicRefs.length > 0) {
      return
    }
    const linked = lessonWeekTopicLinkMap.value[weekNo] || []
    if (linked.length > 0) {
      lessonContext.courseStandardTopicRefs = Array.from(new Set(linked))
    }
  }
)

watch(
  [isFocusMode, collapsedEditorSections, activeEditorLayoutTab],
  () => {
    persistEditorViewPreference()
  },
  { deep: true }
)

watch(
  [showTemplatePanel, isFocusMode, collapsedEditorSections, showOutlineDialog],
  () => {
    nextTick(() => {
      scheduleSyncActiveEditorSectionByViewport()
    })
  },
  { deep: true }
)

watch(
  processTimelineDraftSignature,
  () => {
    if (isSyncingProcessTimelineDraftHistory.value) {
      return
    }
    processTimelineDraftUndoStack.value = pushEditorTimelineDraftUndoStack(
      processTimelineDraftUndoStack.value,
      processTimelineDraftHistoryAnchor.value,
      processTimelineDraftSteps.value
    )
    processTimelineDraftRedoStack.value = []
    syncProcessTimelineDraftHistoryAnchor()
  }
)

watch(
  () => processTimelineDraftSteps.value.map((step) => step.id),
  () => {
    selectedProcessTimelineDraftStepIds.value = normalizeEditorTimelineStepSelectedState(
      selectedProcessTimelineDraftStepIds.value,
      processTimelineDraftSteps.value
    )
    collapsedProcessTimelineDraftStepIds.value = normalizeEditorTimelineStepCollapsedState(
      collapsedProcessTimelineDraftStepIds.value,
      processTimelineDraftSteps.value
    )
  }
)

watch(filteredLocalDraftHistory, (nextHistory) => {
  if (!showDraftDialog.value) {
    return
  }

  if (!nextHistory.length) {
    selectedLocalDraftSavedAt.value = ''
    return
  }

  const selectedExists = nextHistory.some((item) => item.savedAt === selectedLocalDraftSavedAt.value)
  if (!selectedExists) {
    selectedLocalDraftSavedAt.value = nextHistory[0].savedAt
  }
})

const handleSave = async () => {
  if (!isFormValid.value) {
    alert('请填写所有必填字段')
    return
  }
  
  try {
    const data = buildPlanPayload(form)
    
    if (isEditing.value) {
      if (isLessonEditorMode.value) {
        isLessonSaving.value = true
        const lesson = await updateTeachingPlanLesson(planId.value, {
          title: data.title,
          lessonType: lessonContext.lessonType || undefined,
          className: data.className,
          weekNo: lessonContext.weekNo || undefined,
          weekday: lessonContext.weekday || undefined,
          period: lessonContext.period || undefined,
          lessonDate: lessonContext.lessonDate ? `${lessonContext.lessonDate}T00:00:00.000Z` : undefined,
          duration: data.duration,
          objectives: data.objectives,
          keyPoints: data.keyPoints,
          difficulty: lessonContext.difficulty || undefined,
          outline: data.process,
          reflection: data.reflection,
          methods: data.methods,
          teachingAids: lessonContext.teachingAids || data.resources || undefined,
          contentJson: data.contentJson,
          ideologicalElements: lessonContext.ideologicalElements || undefined,
          integrationMethod: lessonContext.integrationMethod || undefined,
          deliveryPlanId: lessonContext.deliveryPlanId || undefined,
          deliveryPlanWeekId: lessonContext.deliveryPlanWeekId || undefined,
          courseStandardTopicRefs: lessonContext.courseStandardTopicRefs,
        })
        lessonStatus.value = lesson.status
      } else {
        await planStore.updatePlan(planId.value, data)
      }
    } else {
      const result = await planStore.createPlan(data)
      clearLocalDraft()
      if (result?.id) {
        // Redirect to edit page after creation
        router.replace(`/editor/${result.id}`)
      }
    }

    if (isEditing.value) {
      clearLocalDraft()
    }
    updateSavedDraftSignature()
    
    lastSaved.value = new Date().toLocaleString('zh-CN')
    if (isLessonEditorMode.value) {
      await runLessonTraceabilityCheck({ silent: true })
    }
  } catch (error: any) {
    alert('保存失败: ' + (error?.response?.data?.message || error.message || '未知错误'))
  } finally {
    isLessonSaving.value = false
  }
}

const loadTemplates = async () => {
  try {
    await templateStore.fetchTemplates({
      page: 1,
      limit: 50,
      search: templateSearch.value.trim() || undefined,
      tag: selectedTagFilter.value || undefined,
    })
  } catch (error) {
    console.error('加载模板失败:', error)
  }
}

const handleSearchTemplates = async () => {
  await loadTemplates()
}

const handleSaveAsTemplate = async () => {
  if (!form.title.trim() && !templateTitle.value.trim()) {
    alert('请先填写教案标题或模板标题')
    return
  }

  try {
    const payload = buildPlanPayload(form as EditorPlanForm)
    await templateStore.createTemplate({
      ...payload,
      title: templateTitle.value.trim() || `${form.title.trim()} 模板`,
      tags: templateDraftTags.value,
    })
    templateTitle.value = ''
    templateDraftTags.value = []
    templateTagInput.value = ''
    await loadTemplates()
    alert('模板保存成功')
  } catch (error: any) {
    alert('模板保存失败: ' + (error.message || '未知错误'))
  }
}

const handleApplyTemplate = async () => {
  const selected = templateStore.templates.find((item) => item.id === selectedTemplateId.value)
  if (!selected) {
    alert('请先选择模板')
    return
  }
  const confirmed = confirm('套用模板将覆盖当前表单内容，是否继续？')
  const nextForm = applyTemplateWithConfirmation(form as EditorPlanForm, selected, confirmed)
  if (nextForm === form) {
    return
  }
  Object.assign(form, nextForm)
  alert('模板已覆盖当前教案内容')
}

const handleDeleteTemplate = async () => {
  if (!selectedTemplateId.value) {
    alert('请先选择模板')
    return
  }
  if (!confirm('确定删除该模板吗？')) {
    return
  }

  try {
    await templateStore.deleteTemplate(selectedTemplateId.value)
    selectedTemplateId.value = ''
    await loadTemplates()
    alert('模板已删除')
  } catch (error: any) {
    alert('删除模板失败: ' + (error.message || '未知错误'))
  }
}

const handleOpenTemplateEditor = async () => {
  if (!selectedTemplateId.value) {
    alert('请先选择模板')
    return
  }
  try {
    const detail = await templateStore.fetchTemplate(selectedTemplateId.value)
    const mapped = mapFetchedPlanToForm(detail)
    Object.assign(templateEditForm, mapped)
    templateEditTitle.value = detail.title || mapped.title
    templateEditTags.value = normalizeTemplateTags(detail.tags)
    templateEditTagInput.value = ''
    editingTemplateId.value = selectedTemplateId.value
    templateEditActiveTab.value = 'basic'
    showTemplateEditDialog.value = true
  } catch (error: any) {
    alert('加载模板详情失败: ' + (error.message || '未知错误'))
  }
}

const handleSaveTemplateEdits = async () => {
  if (!editingTemplateId.value) {
    return
  }
  const payload = resolveTemplateEditSubmission(templateEditForm, templateEditTitle.value, true)
  if (!payload) {
    return
  }
  try {
    await templateStore.updateTemplate(editingTemplateId.value, {
      ...payload,
      tags: templateEditTags.value,
    })
    showTemplateEditDialog.value = false
    editingTemplateId.value = ''
    templateEditActiveTab.value = 'basic'
    await loadTemplates()
    alert('模板修改成功')
  } catch (error: any) {
    alert('模板修改失败: ' + (error.message || '未知错误'))
  }
}

const handleCancelTemplateEdit = () => {
  const payload = resolveTemplateEditSubmission(templateEditForm, templateEditTitle.value, false)
  if (payload === null) {
    showTemplateEditDialog.value = false
    editingTemplateId.value = ''
    Object.assign(templateEditForm, createDefaultEditorForm())
    templateEditTitle.value = ''
    templateEditTags.value = []
    templateEditTagInput.value = ''
    templateEditActiveTab.value = 'basic'
  }
}

const handleAddCreateTag = (rawTag: string) => {
  templateDraftTags.value = normalizeTemplateTags([...templateDraftTags.value, rawTag])
  templateTagInput.value = ''
}

const handleRemoveCreateTag = (tag: string) => {
  templateDraftTags.value = templateDraftTags.value.filter((item) => item !== tag)
}

const handleAddEditTag = (rawTag: string) => {
  templateEditTags.value = normalizeTemplateTags([...templateEditTags.value, rawTag])
  templateEditTagInput.value = ''
}

const handleRemoveEditTag = (tag: string) => {
  templateEditTags.value = templateEditTags.value.filter((item) => item !== tag)
}

const handleSelectTagFilter = async (tag: string) => {
  selectedTagFilter.value = tag
  await loadTemplates()
}

const closeMobileActions = () => {
  showMobileActions.value = false
}

const handleMobileToggleTemplatePanel = () => {
  showTemplatePanel.value = !showTemplatePanel.value
  closeMobileActions()
}

const handleMobileToggleFocusMode = () => {
  handleToggleFocusMode()
  closeMobileActions()
}

const handleMobileOpenDraftDialog = () => {
  closeMobileActions()
  handleOpenDraftDialog()
}

const handleMobileOpenShortcutDialog = () => {
  closeMobileActions()
  handleOpenShortcutDialog()
}

const handleMobileOpenOutlineDialog = () => {
  closeMobileActions()
  showOutlineDialog.value = true
}

const handleMobileFocusNextIncompleteSection = () => {
  closeMobileActions()
  handleFocusNextIncompleteSection()
}

const handleMobileSave = async () => {
  await handleSave()
  closeMobileActions()
}

const handleMobileExport = async () => {
  await handleExport()
  closeMobileActions()
}

const handleMobilePublish = async () => {
  await handlePublish()
  closeMobileActions()
}

const handlePublish = async () => {
  const confirmText = isLessonEditorMode.value
    ? '确定要发布这个单次课教案吗？发布前会执行映证校验。'
    : '确定要发布这个教案吗？发布后所有人都可以查看。'

  if (!confirm(confirmText)) {
    return
  }
  
  try {
    if (isLessonEditorMode.value) {
      let validation = await runLessonTraceabilityCheck({ silent: true })
      if (!validation) {
        return
      }
      if (validation.blockers.length > 0) {
        alert(`发布已阻断：\n${validation.blockers.join('\n')}`)
        return
      }
      if (validation.warnings.length > 0) {
        const hasCoursewareAutofix = validation.warnings.some((item) => item.includes('课件附件有'))
        if (hasCoursewareAutofix && lessonCoursewareAssets.value.length > 0) {
          const autofixConfirmed = window.confirm(
            '检测到课件附件存在可自动补齐字段，是否先执行自动补齐并重新校验？'
          )
          if (autofixConfirmed) {
            await handleAutofillAllMissingLessonCoursewareAssets()
            validation = await runLessonTraceabilityCheck({ silent: true })
            if (!validation) {
              return
            }
            if (validation.blockers.length > 0) {
              alert(`发布已阻断：\n${validation.blockers.join('\n')}`)
              return
            }
          }
        }
      }
      if (validation.warnings.length > 0) {
        const confirmed = window.confirm(buildLessonPublishWarningMessage(validation.warnings))
        if (!confirmed) {
          return
        }
      }

      isLessonSaving.value = true
      const lesson = await publishTeachingPlanLesson(planId.value)
      lessonStatus.value = lesson.status
      alert('单次课教案已发布！')
      return
    }

    await planStore.publishPlan(planId.value)
    alert('教案已发布！')
  } catch (error: any) {
    alert('发布失败: ' + (error?.response?.data?.message || error.message || '未知错误'))
  } finally {
    isLessonSaving.value = false
  }
}

const handleExport = async () => {
  const precheck = editorExportPrecheck.value
  if (!precheck.passed || precheck.warningIssues.length > 0) {
    const confirmed = window.confirm(buildEditorExportPrecheckMessage(precheck))
    if (!confirmed) {
      if (!precheck.passed && precheck.focusSections.length > 0) {
        handleFocusEditorSection(precheck.focusSections[0])
      }
      return
    }
  }

  try {
    const token = localStorage.getItem('token')
    const exportUrl = isLessonEditorMode.value
      ? `/api/export/word/${planId.value}?sourceType=teaching-plan-lesson`
      : `/api/export/word/${planId.value}`

    const response = await fetch(exportUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('导出失败')
    }
    
    // 下载文件
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form.title}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    alert('导出失败: ' + (error.message || '未知错误'))
  }
}
</script>
