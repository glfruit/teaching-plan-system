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
              <h1 class="text-base sm:text-lg font-semibold text-slate-800 truncate">{{ isEditing ? '编辑教案' : '新建教案' }}</h1>
              <p class="hidden lg:block text-xs text-[#647269] truncate">{{ contentSourceLabel }} · {{ editorStatusText }}</p>
              <p v-if="localDraftMessage" class="hidden xl:block text-[11px] text-emerald-600 truncate max-w-[24rem]">{{ localDraftMessage }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Desktop Buttons -->
            <div class="hidden sm:flex items-center gap-3">
              <button
                @click="showTemplatePanel = !showTemplatePanel"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium"
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
                v-if="isEditing && planStore.currentPlan?.status === 'DRAFT'"
                @click="handlePublish"
                :disabled="planStore.isSaving"
                class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                发布
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
                :disabled="planStore.isSaving || !isFormValid"
                class="px-4 py-2 bg-[#647269] text-white rounded hover:bg-[#55645b] transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                {{ planStore.isSaving ? '保存中...' : '保存' }}
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
        :class="showTemplatePanel ? '' : 'mx-auto w-full max-w-4xl'"
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
          </div>
          <button
            @click="showProgressAssistantDialog = true"
            class="h-10 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            查看编写助手
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
        class="editor-layout-shell grid grid-cols-1 gap-4 lg:gap-6"
        :class="showTemplatePanel ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1 lg:justify-items-center'"
      >
      <aside
        v-if="showTemplatePanel"
        aria-label="模板工作台"
        class="editor-template-panel bg-white rounded shadow-sm border border-slate-100 p-4 sm:p-6 lg:sticky lg:top-24"
      >
        <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-1">模板工作台</h2>
        <p class="text-xs text-slate-500 mb-4">可检索、套用与维护个人模板</p>
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>
          <div class="mb-4">
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

          <div class="space-y-4">
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
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学过程</label>
              <TipTapEditor
                v-model="templateEditForm.process"
                v-model:modelJson="templateEditForm.contentJson.process"
                :shortcut-config="tiptapShortcutConfig"
              />
            </div>
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
            <div class="flex items-center justify-end gap-2">
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
      </div>

      <div
        class="min-w-0 space-y-4 sm:space-y-6"
        :class="showTemplatePanel ? '' : 'w-full max-w-4xl'"
      >
      <!-- Basic Info -->
      <section id="editor-section-basic" class="bg-white rounded shadow-sm border border-slate-100 p-4 sm:p-6">
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

      <!-- Teaching Objectives -->
      <section id="editor-section-objectives" class="bg-white rounded shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          教学目标
        </h2>
        
        <TipTapEditor
          v-model="form.objectives"
          v-model:modelJson="form.contentJson.objectives"
          :shortcut-config="tiptapShortcutConfig"
        />
      </section>

      <!-- Key Points -->
      <section id="editor-section-keypoints" class="bg-white rounded shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          重点难点
        </h2>
        
        <TipTapEditor
          v-model="form.keyPoints"
          v-model:modelJson="form.contentJson.keyPoints"
          :shortcut-config="tiptapShortcutConfig"
        />
      </section>

      <!-- Teaching Process -->
      <section id="editor-section-process" class="bg-white rounded shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          教学过程
        </h2>
        
        <TipTapEditor
          v-model="form.process"
          v-model:modelJson="form.contentJson.process"
          :shortcut-config="tiptapShortcutConfig"
        />
      </section>

      <!-- Blackboard Design -->
      <section id="editor-section-blackboard" class="bg-white rounded shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          板书设计
        </h2>
        
        <TipTapEditor
          v-model="form.blackboard"
          v-model:modelJson="form.contentJson.blackboard"
          :shortcut-config="tiptapShortcutConfig"
        />
      </section>

      <!-- Teaching Reflection -->
      <section id="editor-section-reflection" class="bg-white rounded shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          教学反思
        </h2>
        
        <TipTapEditor
          v-model="form.reflection"
          v-model:modelJson="form.contentJson.reflection"
          :shortcut-config="tiptapShortcutConfig"
        />
      </section>
      </div>
      </div>
    </main>

    <div class="mobile-quick-actions sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#d9e1dc] bg-white/95 backdrop-blur">
      <div class="max-w-6xl mx-auto px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] grid grid-cols-1 gap-2">
        <button
          @click="handleMobileToggleTemplatePanel"
          class="h-10 rounded border text-sm font-medium transition-colors"
          :class="showTemplatePanel ? 'border-[#647269] bg-[#eef4f0] text-[#1f3128]' : 'border-[#d1ddd5] bg-white text-[#435549]'"
        >
          模板库
        </button>
        <button
          @click="handleMobileSave"
          :disabled="planStore.isSaving || !isFormValid"
          class="h-10 rounded bg-[#647269] text-white text-sm font-medium disabled:opacity-50"
        >
          {{ planStore.isSaving ? '保存中...' : '保存草稿' }}
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
            @click="handleMobileToggleTemplatePanel"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
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
            v-if="isEditing"
            @click="handleMobileExport"
            class="w-full h-11 rounded border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            导出 Word
          </button>
          <button
            v-if="isEditing && planStore.currentPlan?.status === 'DRAFT'"
            @click="handleMobilePublish"
            :disabled="planStore.isSaving"
            class="w-full h-11 rounded bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
          >
            发布教案
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

type EditorLessonSkeletonDefinition = {
  label: string
  description: string
  patch: Partial<EditorPlanForm>
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

export const buildEditorQualityTips = (form: EditorPlanForm): EditorQualityTip[] => {
  const tips: EditorQualityTip[] = []
  const objectivesLength = htmlToText(form.objectives).trim().length
  const processLength = htmlToText(form.process).trim().length
  const reflectionLength = htmlToText(form.reflection).trim().length

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
      }
      break
    case 'enhance-process':
      if (htmlToText(next.process).trim().length < 40) {
        next.process =
          '<p>导入（5分钟）明确任务，讲解（25分钟）拆解关键步骤，练习（10分钟）巩固应用，总结（5分钟）回顾要点。</p>'
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { usePlanStore } from '../stores/plan'
import { usePlanTemplateStore } from '../stores/planTemplate'
import TipTapEditor from '../components/TipTapEditor.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { normalizeTemplateTags } from '../stores/planTemplate'

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

const planId = computed(() => route.params.id as string)
const isEditing = computed(() => !!planId.value)
const lastSaved = ref('')
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
const selectedLessonSkeletonPreset = ref<EditorLessonSkeletonPreset>('lecture')
const lessonSkeletonPresetManuallySelected = ref(false)
const isDraftPersistenceReady = ref(false)
const PRESET_TEMPLATE_TAGS = ['导入', '探究', '复习', '实验', '评价'] as const
const lessonSkeletonOptions = resolveEditorLessonSkeletonOptions()

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

const editorStatusText = computed(() => {
  if (planStore.isSaving) {
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
const resolveEditorSectionLabelForView = (section: EditorSectionKey): string =>
  resolveEditorSectionLabel(section)

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
  const elementId = resolveEditorSectionElementId(section)
  const target = document.getElementById(elementId)
  if (!target) {
    return
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  if (!hasUnsavedDraft.value || planStore.isSaving) {
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
  if (!shouldPersistLocalDraftOnLeave(hasUnsavedDraft.value, planStore.isSaving)) {
    return
  }
  persistLocalDraft(true)
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  persistLocalDraftBeforeLeave()
  if (!shouldPromptUnsavedChanges(hasUnsavedDraft.value, planStore.isSaving)) {
    return
  }
  event.preventDefault()
  event.returnValue = ''
}

const confirmLeaveWithUnsavedDraft = (): boolean => {
  if (!shouldPromptUnsavedChanges(hasUnsavedDraft.value, planStore.isSaving)) {
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
    return isEditing.value && planStore.currentPlan?.status === 'DRAFT'
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
  contentSource.value = isEditing.value ? 'server' : 'new'
  if (isEditing.value) {
    await loadPlan()
  } else {
    updateSavedDraftSignature()
  }
  restoreLocalDraftIfNeeded()
  isDraftPersistenceReady.value = true
  await loadTemplates()
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleEditorKeyboardShortcuts)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('keydown', handleEditorKeyboardShortcuts)
  if (localDraftPersistTimer) {
    clearTimeout(localDraftPersistTimer)
    localDraftPersistTimer = null
  }
})

const loadPlan = async () => {
  try {
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
      await planStore.updatePlan(planId.value, data)
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
  } catch (error: any) {
    alert('保存失败: ' + (error.message || '未知错误'))
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

const handleMobileOpenDraftDialog = () => {
  closeMobileActions()
  handleOpenDraftDialog()
}

const handleMobileOpenShortcutDialog = () => {
  closeMobileActions()
  handleOpenShortcutDialog()
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
  if (!confirm('确定要发布这个教案吗？发布后所有人都可以查看。')) {
    return
  }
  
  try {
    await planStore.publishPlan(planId.value)
    alert('教案已发布！')
  } catch (error: any) {
    alert('发布失败: ' + (error.message || '未知错误'))
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
    const response = await fetch(`/api/export/word/${planId.value}`, {
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
