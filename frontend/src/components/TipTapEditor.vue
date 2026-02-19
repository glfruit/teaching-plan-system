<template>
  <div class="tiptap-warm-shell border border-[#e9dbc3] rounded overflow-hidden bg-[#fffaf2] shadow-[0_10px_28px_-20px_rgba(124,78,36,0.7)]">
    <div v-if="operationMessage" class="px-3 py-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-200">
      {{ operationMessage }}
    </div>
    <!-- Image Dialog -->
    <div v-if="showImageDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showImageDialog = false">
      <div class="bg-white rounded p-6 w-full max-w-md mx-4 shadow-lg">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">插入图片</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-2">图片 URL</label>
          <input
            v-model="imageUrl"
            type="text"
            placeholder="https://example.com/image.jpg"
            class="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#647269] focus:border-[#647269]"
            @keyup.enter="addImage"
          />
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            @click="showImageDialog = false"
            class="px-4 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 rounded transition-colors"
          >
            取消
          </button>
          <button
            @click="addImage"
            class="px-4 py-2 bg-[#647269] text-white rounded hover:bg-[#55645b] transition-colors"
          >
            插入
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="tiptap-warm-toolbar flex items-center gap-1 p-2 border-b border-[#e9dbc3] bg-[#f8f1e6] flex-wrap">
      <!-- Text Style -->
      <div class="flex items-center gap-0.5">
        <button
          @click="editor?.chain().focus().toggleBold().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('bold') }"
          class="editor-toolbar-btn"
          title="粗体"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4z" />
            <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
          </svg>
        </button>
        
        <button
          @click="editor?.chain().focus().toggleItalic().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('italic') }"
          class="editor-toolbar-btn"
          title="斜体"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 4h-9m4 16h-9M14 4L10 20" />
          </svg>
        </button>
        
        <button
          @click="editor?.chain().focus().toggleUnderline().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('underline') }"
          class="editor-toolbar-btn"
          title="下划线"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
            <path d="M4 21h16" />
          </svg>
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Headings -->
      <div class="flex items-center gap-0.5">
        <button
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
          class="editor-toolbar-btn text-sm font-bold"
          title="标题 1"
        >
          H1
        </button>
        
        <button
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
          class="editor-toolbar-btn text-sm font-bold"
          title="标题 2"
        >
          H2
        </button>
        
        <button
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }"
          class="editor-toolbar-btn text-sm font-bold"
          title="标题 3"
        >
          H3
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Lists -->
      <div class="flex items-center gap-0.5">
        <button
          @click="editor?.chain().focus().toggleBulletList().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('bulletList') }"
          class="editor-toolbar-btn"
          title="无序列表"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </button>
        
        <button
          @click="editor?.chain().focus().toggleOrderedList().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('orderedList') }"
          class="editor-toolbar-btn"
          title="有序列表"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 6h11M10 12h11M10 18h11M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </button>
        
        <button
          @click="editor?.chain().focus().toggleBlockquote().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('blockquote') }"
          class="editor-toolbar-btn"
          title="引用"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
          </svg>
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Image -->
      <div class="flex items-center gap-0.5">
        <button
          @click="showImageDialog = true"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="插入图片"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Table -->
      <div class="flex items-center gap-0.5">
        <button
          @click="showTableTools = !showTableTools"
          :disabled="!editor"
          class="editor-toolbar-btn text-xs font-medium"
          :title="showTableTools ? '收起表格工具' : '展开表格工具'"
        >
          {{ showTableTools ? '收起表格' : '表格工具' }}
        </button>
      </div>

      <div v-if="showTableTools" class="flex items-center gap-0.5">
        <button
          @click="insertTable"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('table') }"
          class="editor-toolbar-btn"
          title="插入表格"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>

        <button
          v-if="editor?.isActive('table')"
          @click="deleteTable"
          :disabled="!editor"
          class="editor-toolbar-btn text-red-500 hover:bg-red-50"
          title="删除表格"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </button>

        <template v-if="editor?.isActive('table')">
          <div class="w-px h-6 bg-[#d6c2a1] mx-1" />
          <button @click="addColumnBefore" :disabled="!editor" class="editor-toolbar-btn" title="在前添加列">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 3v18M15 3v18M3 12h6M21 12h-6" />
            </svg>
          </button>
          <button @click="addColumnAfter" :disabled="!editor" class="editor-toolbar-btn" title="在后添加列">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 3v18M15 3v18M15 12h6M3 12h6" />
            </svg>
          </button>
          <button @click="deleteColumn" :disabled="!editor" class="editor-toolbar-btn text-red-500 hover:bg-red-50" title="删除列">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 3v18M15 3v18M19 12H5" />
            </svg>
          </button>
          <button @click="addRowBefore" :disabled="!editor" class="editor-toolbar-btn" title="在上添加行">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9h18M3 15h18M12 3v6M12 21v-6" />
            </svg>
          </button>
          <button @click="addRowAfter" :disabled="!editor" class="editor-toolbar-btn" title="在下添加行">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9h18M3 15h18M12 15v6M12 3v6" />
            </svg>
          </button>
          <button @click="deleteRow" :disabled="!editor" class="editor-toolbar-btn text-red-500 hover:bg-red-50" title="删除行">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9h18M3 15h18M19 15V9M5 15V9" />
            </svg>
          </button>
          <button @click="mergeCells" :disabled="!editor" class="editor-toolbar-btn" title="合并单元格">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          </button>
          <button @click="splitCell" :disabled="!editor" class="editor-toolbar-btn" title="拆分单元格">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>
          <button
            @click="toggleHeaderCell"
            :disabled="!editor"
            :class="{ 'is-active': editor?.isActive('tableHeader') }"
            class="editor-toolbar-btn"
            title="切换表头"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
              <path d="M8 6v12M16 6v12" />
            </svg>
          </button>
        </template>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Code -->
      <div class="flex items-center gap-0.5">
        <button
          @click="editor?.chain().focus().toggleCode().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('code') }"
          class="editor-toolbar-btn"
          title="行内代码"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
        
        <button
          @click="editor?.chain().focus().toggleCodeBlock().run()"
          :disabled="!editor"
          :class="{ 'is-active': editor?.isActive('codeBlock') }"
          class="editor-toolbar-btn"
          title="代码块"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9l3 3-3 3M15 15V9" />
          </svg>
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- History -->
      <div class="flex items-center gap-0.5">
        <button
          @click="editor?.chain().focus().undo().run()"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="撤销"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
        </button>
        
        <button
          @click="editor?.chain().focus().redo().run()"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="重做"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
          </svg>
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Teaching Layout -->
      <div class="flex items-center gap-0.5">
        <button
          @click="showTeachingTools = !showTeachingTools"
          :disabled="!editor"
          class="editor-toolbar-btn text-xs font-medium"
          :title="showTeachingTools ? '收起教学块工具' : '展开教学块工具'"
        >
          {{ showTeachingTools ? '收起教学块' : '教学块工具' }}
        </button>
      </div>

      <div v-if="showTeachingTools" class="flex items-center gap-0.5">
        <button
          @click="insertTimelineBlock"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="插入时间轴"
        >
          时间轴
        </button>
        <button
          @click="insertStepCardBlock"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="插入步骤卡"
        >
          步骤卡
        </button>
        <button
          @click="insertGridBlock"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="插入三栏块"
        >
          三栏块
        </button>
        <button
          @click="copyCurrentBlock"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="复制当前块"
        >
          复制块
        </button>
        <button
          @click="deleteCurrentBlock"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="删除当前块"
        >
          删除块
        </button>
        <button
          @click="moveCurrentBlockUp"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="上移当前块"
        >
          上移块
        </button>
        <button
          @click="moveCurrentBlockDown"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="下移当前块"
        >
          下移块
        </button>
      </div>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <button
        @click="toggleAllAdvancedToolGroups"
        :disabled="!editor"
        class="editor-toolbar-btn text-xs font-medium"
        :title="allAdvancedToolGroupsExpanded ? '收起全部工具组' : '展开全部工具组'"
      >
        {{ allAdvancedToolGroupsExpanded ? '收起全部' : '展开全部' }}
      </button>

      <div class="w-px h-6 bg-[#d6c2a1] mx-1" />

      <!-- Clear -->
      <button
        @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
        :disabled="!editor"
        class="editor-toolbar-btn text-red-500 hover:bg-red-50"
        title="清除格式"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </div>

    <TeachingSlashMenu v-if="isSlashMenuOpen" :items="slashMenuItems" @select="onSlashSelect" />

    <!-- Editor Content -->
    <div class="tiptap-warm-content p-4 bg-[#fffdf9]">
      <EditorContent :editor="editor" class="prose max-w-none min-h-[200px]" />
    </div>

    <div class="flex items-center justify-between border-t border-[#e9dbc3] bg-[#fdf7ee] px-3 py-1.5 text-[11px] text-[#7a6b56]">
      <span>字数 {{ editorMetrics.characters }}</span>
      <span>段落 {{ editorMetrics.paragraphs }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JSONContent } from '@tiptap/core'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { watch, ref, computed } from 'vue'
import {
  lessonTimeline,
  activityStepCard,
  goalActivityAssessmentGrid,
  unknownNodePlaceholder,
  insertLessonTimeline,
  insertActivityStepCard,
  insertGoalActivityAssessmentGrid,
  copyCurrentTeachingNode,
  deleteCurrentTeachingNode,
  moveCurrentTeachingNodeUp,
  moveCurrentTeachingNodeDown,
} from './editor-nodes'
import TeachingSlashMenu from './editor-slash/TeachingSlashMenu.vue'
import {
  filterTeachingSlashItems,
  type TeachingSlashItem,
} from './editor-slash/slashItems'

const props = defineProps<{
  modelValue: string
  modelJson?: JSONContent
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:modelJson', value: JSONContent): void
}>()

interface ToolbarVisibilityState {
  table: boolean
  teaching: boolean
}

const TOOLBAR_VISIBILITY_STORAGE_KEY = 'tiptap-toolbar-visibility-v1'
const DEFAULT_TOOLBAR_VISIBILITY: ToolbarVisibilityState = {
  table: false,
  teaching: false,
}

const readToolbarVisibility = (): ToolbarVisibilityState => {
  if (typeof window === 'undefined') {
    return DEFAULT_TOOLBAR_VISIBILITY
  }

  const storage = window.localStorage
  if (!storage || typeof storage.getItem !== 'function') {
    return DEFAULT_TOOLBAR_VISIBILITY
  }

  const raw = storage.getItem(TOOLBAR_VISIBILITY_STORAGE_KEY)
  if (!raw) {
    return DEFAULT_TOOLBAR_VISIBILITY
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ToolbarVisibilityState>
    return {
      table: parsed.table === true,
      teaching: parsed.teaching === true,
    }
  } catch {
    return DEFAULT_TOOLBAR_VISIBILITY
  }
}

const writeToolbarVisibility = (next: ToolbarVisibilityState): void => {
  if (typeof window === 'undefined') {
    return
  }

  const storage = window.localStorage
  if (!storage || typeof storage.setItem !== 'function') {
    return
  }

  storage.setItem(TOOLBAR_VISIBILITY_STORAGE_KEY, JSON.stringify(next))
}

const initialToolbarVisibility = readToolbarVisibility()

const showImageDialog = ref(false)
const imageUrl = ref('')
const slashQuery = ref('')
const slashSelectedIndex = ref(0)
const isSlashMenuOpen = ref(false)
const operationMessage = ref('')
let operationMessageTimer: ReturnType<typeof setTimeout> | null = null
const showTableTools = ref(initialToolbarVisibility.table)
const showTeachingTools = ref(initialToolbarVisibility.teaching)

const slashMenuItems = computed(() => filterTeachingSlashItems(slashQuery.value))

const stripHtmlToText = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const countParagraphs = (html: string): number => {
  const matched = html.match(/<p[\s>]/gi)
  if (matched?.length) {
    return matched.length
  }
  return stripHtmlToText(html) ? 1 : 0
}

const editorMetrics = computed(() => {
  const text = stripHtmlToText(props.modelValue || '')
  return {
    characters: text.replace(/\s+/g, '').length,
    paragraphs: countParagraphs(props.modelValue || ''),
  }
})

watch([showTableTools, showTeachingTools], ([table, teaching]) => {
  writeToolbarVisibility({ table, teaching })
})

const allAdvancedToolGroupsExpanded = computed(
  () => showTableTools.value && showTeachingTools.value
)

const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      allowBase64: true,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    lessonTimeline,
    activityStepCard,
    goalActivityAssessmentGrid,
    unknownNodePlaceholder,
  ],
  content: props.modelJson || props.modelValue,
  onCreate: ({ editor }) => {
    emit('update:modelJson', editor.getJSON())
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    handleKeyDown: (_, event) => {
      if (event.key === '/') {
        isSlashMenuOpen.value = true
        slashQuery.value = ''
        slashSelectedIndex.value = 0
        return false
      }

      if (!isSlashMenuOpen.value) {
        return false
      }

      if (event.key === 'Escape') {
        isSlashMenuOpen.value = false
        return true
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        slashSelectedIndex.value = (slashSelectedIndex.value + 1) % Math.max(slashMenuItems.value.length, 1)
        return true
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        const max = Math.max(slashMenuItems.value.length, 1)
        slashSelectedIndex.value = (slashSelectedIndex.value - 1 + max) % max
        return true
      }

      if (event.key === 'Backspace') {
        if (!slashQuery.value) {
          isSlashMenuOpen.value = false
          return false
        }
        slashQuery.value = slashQuery.value.slice(0, -1)
        slashSelectedIndex.value = 0
        return false
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const item = slashMenuItems.value[slashSelectedIndex.value]
        if (item) {
          onSlashSelect(item)
        }
        return true
      }

      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (/\s/.test(event.key)) {
          isSlashMenuOpen.value = false
          return false
        }
        slashQuery.value += event.key
        slashSelectedIndex.value = 0
      }

      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelJson', editor.getJSON())
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external JSON changes (source of truth)
watch(() => props.modelJson, (newValue) => {
  if (!editor.value || !newValue) {
    return
  }

  if (JSON.stringify(editor.value.getJSON()) !== JSON.stringify(newValue)) {
    editor.value.commands.setContent(newValue, false)
  }
})

// HTML is kept for preview/export compatibility
watch(() => props.modelValue, (newValue) => {
  if (props.modelJson) {
    return
  }
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

// Add image from URL
const addImage = () => {
  if (imageUrl.value) {
    editor.value?.chain().focus().setImage({ src: imageUrl.value }).run()
    imageUrl.value = ''
    showImageDialog.value = false
  }
}

// Insert table
const insertTable = () => {
  showTableTools.value = true
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const toggleAllAdvancedToolGroups = () => {
  const next = !allAdvancedToolGroupsExpanded.value
  showTableTools.value = next
  showTeachingTools.value = next
}

// Delete table
const deleteTable = () => {
  editor.value?.chain().focus().deleteTable().run()
}

// Add column before
const addColumnBefore = () => {
  editor.value?.chain().focus().addColumnBefore().run()
}

// Add column after
const addColumnAfter = () => {
  editor.value?.chain().focus().addColumnAfter().run()
}

// Delete column
const deleteColumn = () => {
  editor.value?.chain().focus().deleteColumn().run()
}

// Add row before
const addRowBefore = () => {
  editor.value?.chain().focus().addRowBefore().run()
}

// Add row after
const addRowAfter = () => {
  editor.value?.chain().focus().addRowAfter().run()
}

// Delete row
const deleteRow = () => {
  editor.value?.chain().focus().deleteRow().run()
}

// Toggle header cell
const toggleHeaderCell = () => {
  editor.value?.chain().focus().toggleHeaderCell().run()
}

// Merge cells
const mergeCells = () => {
  editor.value?.chain().focus().mergeCells().run()
}

// Split cell
const splitCell = () => {
  editor.value?.chain().focus().splitCell().run()
}

const insertTimelineBlock = () => {
  if (editor.value) {
    const ok = insertLessonTimeline(editor.value)
    setOperationFeedback(
      ok,
      '已插入时间轴块，可按 Ctrl/Cmd+Z 撤销。',
      '当前位置不可插入时间轴块，请先调整光标位置后重试。'
    )
  }
}

const insertStepCardBlock = () => {
  if (editor.value) {
    const ok = insertActivityStepCard(editor.value)
    setOperationFeedback(
      ok,
      '已插入步骤卡块，可按 Ctrl/Cmd+Z 撤销。',
      '当前位置不可插入步骤卡块，请先调整光标位置后重试。'
    )
  }
}

const insertGridBlock = () => {
  if (editor.value) {
    const ok = insertGoalActivityAssessmentGrid(editor.value)
    setOperationFeedback(
      ok,
      '已插入三栏块，可按 Ctrl/Cmd+Z 撤销。',
      '当前位置不可插入三栏块，请先调整光标位置后重试。'
    )
  }
}

const onSlashSelect = (item: TeachingSlashItem) => {
  if (editor.value) {
    const slashTokenLength = slashQuery.value.length + 1
    const cursor = editor.value.state.selection.from
    const from = Math.max(1, cursor - slashTokenLength)
    editor.value.chain().focus().deleteRange({ from, to: cursor }).run()
    item.command(editor.value)
    isSlashMenuOpen.value = false
    slashQuery.value = ''
    slashSelectedIndex.value = 0
  }
}

const copyCurrentBlock = () => {
  if (editor.value) {
    const ok = copyCurrentTeachingNode(editor.value)
    setOperationFeedback(ok, '已复制当前教学块，可按 Ctrl/Cmd+Z 撤销。', '未找到可复制的教学块，请先选中目标块。')
  }
}

const deleteCurrentBlock = () => {
  if (editor.value) {
    const ok = deleteCurrentTeachingNode(editor.value)
    setOperationFeedback(ok, '已删除当前教学块，可按 Ctrl/Cmd+Z 撤销。', '未找到可删除的教学块，请先选中目标块。')
  }
}

const moveCurrentBlockUp = () => {
  if (editor.value) {
    const ok = moveCurrentTeachingNodeUp(editor.value)
    setOperationFeedback(ok, '已上移当前教学块，可按 Ctrl/Cmd+Z 撤销。', '无法上移：请先选中教学块，且该块不在首位。')
  }
}

const moveCurrentBlockDown = () => {
  if (editor.value) {
    const ok = moveCurrentTeachingNodeDown(editor.value)
    setOperationFeedback(ok, '已下移当前教学块，可按 Ctrl/Cmd+Z 撤销。', '无法下移：请先选中教学块，且该块不在末位。')
  }
}

const setOperationFeedback = (ok: boolean, successMessage: string, failureMessage: string) => {
  operationMessage.value = ok ? successMessage : failureMessage
  if (operationMessageTimer) {
    clearTimeout(operationMessageTimer)
  }
  operationMessageTimer = setTimeout(() => {
    operationMessage.value = ''
    operationMessageTimer = null
  }, 2400)
}
</script>
