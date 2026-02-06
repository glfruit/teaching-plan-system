<template>
  <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
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

    <!-- Editor Content -->
    <div class="p-4">
      <EditorContent :editor="editor" class="prose max-w-none min-h-[200px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})
</script>
