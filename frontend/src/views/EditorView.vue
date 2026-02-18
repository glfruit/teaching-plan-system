<template>
  <div class="min-h-screen bg-warm-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <router-link
              to="/"
              class="p-2 hover:bg-warm-100 rounded-lg transition-colors text-warm-600 hover:text-warm-800"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            
            <div>
              <h1 class="text-base sm:text-lg font-semibold text-slate-800">{{ isEditing ? '编辑教案' : '新建教案' }}</h1>
              <p class="text-[11px] sm:text-xs text-[#647269] hidden sm:block">{{ contentSourceLabel }}</p>
              <p class="text-xs sm:text-sm text-slate-500 hidden sm:block">{{ editorStatusText }}</p>
              <p v-if="localDraftMessage" class="text-[11px] text-emerald-600 hidden sm:block">{{ localDraftMessage }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Desktop Buttons -->
            <div class="hidden sm:flex items-center gap-3">
              <button
                @click="showTemplatePanel = !showTemplatePanel"
                class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                {{ showTemplatePanel ? '收起模板' : '模板库' }}
              </button>

              <button
                v-if="isEditing"
                @click="handleExport"
                class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                导出 Word
              </button>
              
              <button
                v-if="isEditing && planStore.currentPlan?.status === 'DRAFT'"
                @click="handlePublish"
                :disabled="planStore.isSaving"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                发布
              </button>

              <button
                @click="handleOpenDraftDialog"
                class="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                草稿箱
              </button>
              
              <button
                @click="handleSave"
                :disabled="planStore.isSaving || !isFormValid"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
              >
                {{ planStore.isSaving ? '保存中...' : '保存' }}
              </button>
            </div>

            <button
              @click="showMobileActions = true"
              class="sm:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl border border-[#d1ddd5] bg-white text-slate-600"
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
        class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm sm:text-base"
      >
        {{ planStore.error }}
      </div>

      <div class="editor-layout-shell grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
      <aside
        v-if="showTemplatePanel"
        aria-label="模板工作台"
        class="editor-template-panel bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:sticky lg:top-24"
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
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                @click="handleSearchTemplates"
                class="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
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
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                @click="handleSaveAsTemplate"
                :disabled="templateStore.isSaving"
                class="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                保存模板
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="tag in PRESET_TEMPLATE_TAGS"
                :key="`create-${tag}`"
                @click="handleAddCreateTag(tag)"
                class="px-2 py-1 text-xs text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
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
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                @click="handleAddCreateTag(templateTagInput)"
                class="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                添加
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in templateDraftTags"
                :key="`draft-${tag}`"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
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
              class="flex-1 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">请选择模板</option>
              <option v-for="item in templateStore.templates" :key="item.id" :value="item.id">
                {{ item.title }}（{{ item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('zh-CN') : '新建' }}）
              </option>
            </select>
            <button
              @click="handleApplyTemplate"
              class="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              套用并覆盖
            </button>
            <button
              @click="handleOpenTemplateEditor"
              class="px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              编辑模板
            </button>
            <button
              @click="handleDeleteTemplate"
              class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              删除模板
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              @click="handleSelectTagFilter('')"
              :class="[
                'px-2 py-1 text-xs rounded-full border',
                selectedTagFilter ? 'text-slate-700 border-slate-300' : 'text-blue-700 border-blue-300 bg-blue-50',
              ]"
            >
              全部
            </button>
            <button
              v-for="tag in PRESET_TEMPLATE_TAGS"
              :key="`filter-${tag}`"
              @click="handleSelectTagFilter(tag)"
              :class="[
                'px-2 py-1 text-xs rounded-full border',
                selectedTagFilter === tag
                  ? 'text-blue-700 border-blue-300 bg-blue-50'
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
        <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800">编辑模板</h3>
            <button
              @click="handleCancelTemplateEdit"
              class="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
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
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">课程名称</label>
              <input
                v-model="templateEditForm.courseName"
                type="text"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">授课班级</label>
              <input
                v-model="templateEditForm.className"
                type="text"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">课时长度（分钟）</label>
              <input
                v-model.number="templateEditForm.duration"
                type="number"
                min="1"
                max="300"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学方法</label>
              <input
                v-model="templateEditForm.methods"
                type="text"
                placeholder="例如：讲授法、案例教学"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">教学资源</label>
              <input
                v-model="templateEditForm.resources"
                type="text"
                placeholder="例如：PPT、视频、实验设备"
                class="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                class="px-2 py-1 text-xs text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
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
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                @click="handleAddEditTag(templateEditTagInput)"
                class="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                添加
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in templateEditTags"
                :key="`edit-chip-${tag}`"
                class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
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
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">重点难点</label>
              <TipTapEditor
                v-model="templateEditForm.keyPoints"
                v-model:modelJson="templateEditForm.contentJson.keyPoints"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学过程</label>
              <TipTapEditor
                v-model="templateEditForm.process"
                v-model:modelJson="templateEditForm.contentJson.process"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">板书设计</label>
              <TipTapEditor
                v-model="templateEditForm.blackboard"
                v-model:modelJson="templateEditForm.contentJson.blackboard"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">教学反思</label>
              <TipTapEditor
                v-model="templateEditForm.reflection"
                v-model:modelJson="templateEditForm.contentJson.reflection"
              />
            </div>
            <div class="flex items-center justify-end gap-2">
              <button
                @click="handleCancelTemplateEdit"
                class="px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                @click="handleSaveTemplateEdits"
                :disabled="templateStore.isSaving"
                class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="min-w-0 space-y-4 sm:space-y-6">
      <!-- Basic Info -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          基本信息
        </h2>
        
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
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          教学目标
        </h2>
        
        <TipTapEditor v-model="form.objectives" v-model:modelJson="form.contentJson.objectives" />
      </section>

      <!-- Key Points -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          重点难点
        </h2>
        
        <TipTapEditor v-model="form.keyPoints" v-model:modelJson="form.contentJson.keyPoints" />
      </section>

      <!-- Teaching Process -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          教学过程
        </h2>
        
        <TipTapEditor v-model="form.process" v-model:modelJson="form.contentJson.process" />
      </section>

      <!-- Blackboard Design -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          板书设计
        </h2>
        
        <TipTapEditor v-model="form.blackboard" v-model:modelJson="form.contentJson.blackboard" />
      </section>

      <!-- Teaching Reflection -->
      <section class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          教学反思
        </h2>
        
        <TipTapEditor v-model="form.reflection" v-model:modelJson="form.contentJson.reflection" />
      </section>
      </div>
      </div>
    </main>

    <div class="mobile-quick-actions sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[#d9e1dc] bg-white/95 backdrop-blur">
      <div class="max-w-6xl mx-auto px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] grid grid-cols-1 gap-2">
        <button
          @click="handleMobileToggleTemplatePanel"
          class="h-10 rounded-xl border text-sm font-medium transition-colors"
          :class="showTemplatePanel ? 'border-[#647269] bg-[#eef4f0] text-[#1f3128]' : 'border-[#d1ddd5] bg-white text-[#435549]'"
        >
          模板库
        </button>
        <button
          @click="handleMobileSave"
          :disabled="planStore.isSaving || !isFormValid"
          class="h-10 rounded-xl bg-[#647269] text-white text-sm font-medium disabled:opacity-50"
        >
          {{ planStore.isSaving ? '保存中...' : '保存草稿' }}
        </button>
        <button
          @click="showMobileActions = true"
          class="h-10 rounded-xl border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
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
      <div class="absolute bottom-0 inset-x-0 rounded-t-2xl bg-white border-t border-[#d9e1dc] px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div class="w-10 h-1.5 bg-[#d1ddd5] rounded-full mx-auto mb-3"></div>
        <p class="text-sm font-semibold text-[#33463c] mb-3">更多操作</p>
        <div class="space-y-2">
          <button
            @click="handleMobileToggleTemplatePanel"
            class="w-full h-11 rounded-xl border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            {{ showTemplatePanel ? '收起模板库' : '打开模板库' }}
          </button>
          <button
            @click="handleMobileOpenDraftDialog"
            class="w-full h-11 rounded-xl border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            草稿箱
          </button>
          <button
            v-if="isEditing"
            @click="handleMobileExport"
            class="w-full h-11 rounded-xl border border-[#d1ddd5] bg-white text-[#435549] text-sm font-medium"
          >
            导出 Word
          </button>
          <button
            v-if="isEditing && planStore.currentPlan?.status === 'DRAFT'"
            @click="handleMobilePublish"
            :disabled="planStore.isSaving"
            class="w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
          >
            发布教案
          </button>
          <button
            @click="closeMobileActions"
            class="w-full h-11 rounded-xl bg-[#f4f7f5] text-[#435549] text-sm font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDraftDialog"
      class="fixed inset-0 z-40 bg-slate-900/45 p-4 overflow-y-auto"
      @click.self="showDraftDialog = false"
    >
      <div class="max-w-md mx-auto mt-10 rounded-2xl border border-slate-200 bg-white shadow-xl p-5 sm:p-6">
        <h3 class="text-base font-semibold text-slate-800">本地草稿箱</h3>
        <p class="mt-1 text-xs text-slate-500">用于恢复未保存内容，数据仅保存在当前浏览器。</p>
        <div v-if="currentLocalDraft" class="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-[#2f5f4f]">
          <p>共 {{ localDraftHistory.length }} 条本地草稿</p>
          <div class="mt-2 max-h-36 overflow-auto space-y-1">
            <button
              v-for="item in localDraftHistory"
              :key="item.savedAt"
              @click="handleSelectLocalDraft(item.savedAt)"
              class="w-full text-left px-2 py-1.5 rounded-lg border transition-colors"
              :class="
                selectedLocalDraftSavedAt === item.savedAt
                  ? 'border-emerald-300 bg-white text-emerald-700'
                  : 'border-transparent bg-emerald-50/50 text-[#2f5f4f] hover:bg-white'
              "
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-medium leading-5">
                  {{ resolveLocalDraftDisplayNameForView(item) }}
                </span>
                <span class="text-[10px] text-slate-500 whitespace-nowrap">
                  {{ formatDraftTimestamp(item.savedAt) || item.savedAt }}
                </span>
              </div>
              <p class="mt-0.5 text-[10px] text-slate-500">
                {{ item.snapshot.courseName || '未填课程' }} · {{ item.snapshot.className || '未填班级' }}
              </p>
            </button>
          </div>
          <p class="mt-2">当前选择：{{ selectedLocalDraft ? (formatDraftTimestamp(selectedLocalDraft.savedAt) || selectedLocalDraft.savedAt) : '无' }}</p>
          <p class="mt-1">与当前内容差异：{{ selectedLocalDraftDiff.changedCount }} 项</p>
          <div
            v-if="selectedLocalDraftDiff.changedCount > 0"
            class="mt-2 max-h-36 overflow-auto space-y-1 rounded-lg border border-emerald-100 bg-white/70 p-2"
          >
            <div
              v-for="item in selectedLocalDraftDiff.items"
              :key="item.field"
              class="rounded-md border border-emerald-100 bg-white px-2 py-1.5"
            >
              <p class="text-xs font-medium text-[#2f5f4f]">{{ item.label }}</p>
              <p class="text-[11px] text-slate-500">当前：{{ item.currentPreview }}</p>
              <p class="text-[11px] text-[#2f5f4f]">草稿：{{ item.draftPreview }}</p>
            </div>
          </div>
          <p v-else class="mt-2 text-xs text-[#2f5f4f]">所选草稿与当前编辑内容一致</p>
          <p class="mt-1">恢复后内容来源将变更为：本地草稿</p>
        </div>
        <div v-else class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          暂无本地草稿
        </div>
        <div class="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            @click="handleRestoreLocalDraft"
            :disabled="!currentLocalDraft"
            class="h-10 rounded-xl bg-[#647269] text-white text-sm font-medium disabled:opacity-50"
          >
            恢复草稿
          </button>
          <button
            @click="handleClearLocalDraft"
            :disabled="!currentLocalDraft"
            class="h-10 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium disabled:opacity-50"
          >
            清空草稿
          </button>
          <button
            @click="showDraftDialog = false"
            class="h-10 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium sm:col-span-2"
          >
            关闭
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
}

export type EditorLocalDraftHistoryPayload = {
  version: number
  drafts: EditorLocalDraft[]
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
  }
}

export const resolveEditorLocalDraftDisplayName = (draft: EditorLocalDraft): string =>
  draft.snapshot?.displayName?.trim() || buildEditorLocalDraftDisplayName(draft.form)

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
  }

  const normalized = history
    .map((item) => parseEditorLocalDraftItem(item))
    .filter((item): item is EditorLocalDraft => Boolean(item))

  const nextSignature = buildEditorDraftSignature(form)
  const firstSignature = normalized[0] ? buildEditorDraftSignature(normalized[0].form) : null

  if (firstSignature === nextSignature) {
    return [nextDraft, ...normalized.slice(1)].slice(0, Math.max(1, limit))
  }

  return [nextDraft, ...normalized].slice(0, Math.max(1, limit))
}

export const parseEditorLocalDraft = (raw: string | null | undefined): EditorLocalDraft | null => {
  const history = parseEditorLocalDraftHistory(raw)
  return history[0] ?? null
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
const localDraftHistory = ref<EditorLocalDraft[]>([])
const selectedLocalDraftSavedAt = ref('')
const showDraftDialog = ref(false)
const contentSource = ref<EditorContentSource>('new')
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
const isDraftPersistenceReady = ref(false)
const PRESET_TEMPLATE_TAGS = ['导入', '探究', '复习', '实验', '评价'] as const

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

const currentLocalDraft = computed<EditorLocalDraft | null>(() => localDraftHistory.value[0] ?? null)

const selectedLocalDraft = computed<EditorLocalDraft | null>(() => {
  if (!localDraftHistory.value.length) {
    return null
  }

  if (!selectedLocalDraftSavedAt.value) {
    return localDraftHistory.value[0]
  }

  return (
    localDraftHistory.value.find((item) => item.savedAt === selectedLocalDraftSavedAt.value) ??
    localDraftHistory.value[0]
  )
})

const selectedLocalDraftDiff = computed(() =>
  buildEditorDraftDiffSummary(form as EditorPlanForm, selectedLocalDraft.value)
)

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

const clearLocalDraft = () => {
  localStorage.removeItem(localDraftStorageKey.value)
  localDraftHistory.value = []
  selectedLocalDraftSavedAt.value = ''
  localDraftMessage.value = ''
}

const persistLocalDraft = (force = false) => {
  if (!hasUnsavedDraft.value || planStore.isSaving) {
    return
  }

  const nextHistory = pushEditorLocalDraftHistory(localDraftHistory.value, form as EditorPlanForm)
  const raw = serializeEditorLocalDraftHistory(nextHistory)
  localStorage.setItem(localDraftStorageKey.value, raw)
  localDraftHistory.value = parseEditorLocalDraftHistory(raw)
  selectedLocalDraftSavedAt.value = localDraftHistory.value[0]?.savedAt || ''
  const latest = localDraftHistory.value[0] || null
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
  selectedLocalDraftSavedAt.value = draftHistory[0]?.savedAt || ''
  const draft = draftHistory[0] ?? null
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
  if (!localDraftHistory.value.length) {
    selectedLocalDraftSavedAt.value = ''
    return
  }
  const selectedExists = localDraftHistory.value.some((item) => item.savedAt === selectedLocalDraftSavedAt.value)
  if (!selectedExists) {
    selectedLocalDraftSavedAt.value = localDraftHistory.value[0].savedAt
  }
}

const handleOpenDraftDialog = () => {
  refreshLocalDraft()
  showDraftDialog.value = true
}

const handleSelectLocalDraft = (savedAt: string) => {
  selectedLocalDraftSavedAt.value = savedAt
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

const handleClearLocalDraft = () => {
  clearLocalDraft()
  showDraftDialog.value = false
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

onBeforeRouteLeave((_to, _from, next) => {
  persistLocalDraftBeforeLeave()
  if (confirmLeaveWithUnsavedDraft()) {
    next()
    return
  }
  next(false)
})

onMounted(async () => {
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
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
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
