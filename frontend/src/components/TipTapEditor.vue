<template>
  <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
    <div v-if="operationMessage" class="px-3 py-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-200">
      {{ operationMessage }}
    </div>
    <!-- Image Dialog -->
    <div v-if="showImageDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showImageDialog = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">插入图片</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-2">图片 URL</label>
          <input
            v-model="imageUrl"
            type="text"
            placeholder="https://example.com/image.jpg"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @keyup.enter="addImage"
          />
        </div>
        <div class="flex items-center justify-end gap-3">
          <button
            @click="showImageDialog = false"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="addImage"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            插入
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/80 flex-wrap">
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

      <div class="w-px h-6 bg-slate-300 mx-1" />

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

      <div class="w-px h-6 bg-slate-300 mx-1" />

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

      <div class="w-px h-6 bg-slate-300 mx-1" />

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

      <div class="w-px h-6 bg-slate-300 mx-1" />

      <!-- Table -->
      <div class="flex items-center gap-0.5">
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
      </div>

      <div v-if="editor?.isActive('table')" class="flex items-center gap-0.5">
        <div class="w-px h-6 bg-slate-300 mx-1" />
        
        <button
          @click="addColumnBefore"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="在前添加列"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3v18M15 3v18M3 12h6M21 12h-6" />
          </svg>
        </button>
        
        <button
          @click="addColumnAfter"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="在后添加列"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3v18M15 3v18M15 12h6M3 12h6" />
          </svg>
        </button>
        
        <button
          @click="deleteColumn"
          :disabled="!editor"
          class="editor-toolbar-btn text-red-500 hover:bg-red-50"
          title="删除列"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3v18M15 3v18M19 12H5" />
          </svg>
        </button>
        
        <button
          @click="addRowBefore"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="在上添加行"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9h18M3 15h18M12 3v6M12 21v-6" />
          </svg>
        </button>
        
        <button
          @click="addRowAfter"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="在下添加行"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9h18M3 15h18M12 15v6M12 3v6" />
          </svg>
        </button>
        
        <button
          @click="deleteRow"
          :disabled="!editor"
          class="editor-toolbar-btn text-red-500 hover:bg-red-50"
          title="删除行"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9h18M3 15h18M19 15V9M5 15V9" />
          </svg>
        </button>

        <button
          @click="mergeCells"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="合并单元格"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
        </button>

        <button
          @click="splitCell"
          :disabled="!editor"
          class="editor-toolbar-btn"
          title="拆分单元格"
        >
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
      </div>

      <div class="w-px h-6 bg-slate-300 mx-1" />

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

      <div class="w-px h-6 bg-slate-300 mx-1" />

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

      <div class="w-px h-6 bg-slate-300 mx-1" />

      <!-- Teaching Layout -->
      <div class="flex items-center gap-0.5">
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

      <div class="w-px h-6 bg-slate-300 mx-1" />

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
    <div class="p-4">
      <EditorContent :editor="editor" class="prose max-w-none min-h-[200px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JSONContent } from '@tiptap/core'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
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

const showImageDialog = ref(false)
const imageUrl = ref('')
const slashQuery = ref('')
const slashSelectedIndex = ref(0)
const isSlashMenuOpen = ref(false)
const operationMessage = ref('')

const slashMenuItems = computed(() => filterTeachingSlashItems(slashQuery.value))

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
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
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
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
    operationMessage.value = ok ? '' : '当前位置不可插入该块，请先调整光标位置后重试。'
  }
}

const insertStepCardBlock = () => {
  if (editor.value) {
    const ok = insertActivityStepCard(editor.value)
    operationMessage.value = ok ? '' : '当前位置不可插入该块，请先调整光标位置后重试。'
  }
}

const insertGridBlock = () => {
  if (editor.value) {
    const ok = insertGoalActivityAssessmentGrid(editor.value)
    operationMessage.value = ok ? '' : '当前位置不可插入该块，请先调整光标位置后重试。'
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
    copyCurrentTeachingNode(editor.value)
  }
}

const deleteCurrentBlock = () => {
  if (editor.value) {
    deleteCurrentTeachingNode(editor.value)
  }
}

const moveCurrentBlockUp = () => {
  if (editor.value) {
    moveCurrentTeachingNodeUp(editor.value)
  }
}

const moveCurrentBlockDown = () => {
  if (editor.value) {
    moveCurrentTeachingNodeDown(editor.value)
  }
}
</script>
