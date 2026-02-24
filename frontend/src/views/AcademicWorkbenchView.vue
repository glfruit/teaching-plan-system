<template>
  <div class="min-h-screen bg-slate-50">
    <NavBar
      :username="authStore.user?.username || ''"
      :is-admin="authStore.isAdmin"
      @new="router.push('/editor')"
      @logout="handleLogout"
    />

    <main class="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
      <PageHeader
        super-title="Workbench"
        title="课程标准 · 授课计划 · 教案链路"
        subtitle="按模板编写并建立可追溯映证关系"
      />

      <BaseCard
        v-if="workbenchContextHint"
        class="mt-4 border-emerald-200 bg-emerald-50"
        padding="md"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-emerald-800">{{ workbenchContextHint }}</p>
          <button
            type="button"
            @click="clearWorkbenchContext"
            class="h-8 rounded border border-emerald-300 bg-white px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            清除上下文
          </button>
        </div>
      </BaseCard>

      <section class="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="min-h-[44px] rounded border text-sm font-medium"
          :class="activeTab === tab.id ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </section>

      <section id="workbench-section-standards" v-if="activeTab === 'standards'" class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-semibold font-serif text-slate-900">课程标准工作台</h2>
            <div class="flex flex-wrap items-center gap-2">
              <BaseButton variant="secondary" @click="loadStandards">刷新</BaseButton>
              <BaseButton variant="secondary" @click="prepareNewStandard">准备新建</BaseButton>
              <BaseButton variant="secondary" :loading="isSavingStandard" @click="handleSaveStandard">保存当前标准</BaseButton>
              <BaseButton :loading="isCreatingStandard" @click="handleCreateStandard">新建标准</BaseButton>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div class="lg:col-span-2">
              <label class="mb-2 block text-sm font-medium text-slate-700">继续编辑已有课程标准</label>
              <select
                v-model="selectedStandardId"
                class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">未选择（准备新建）</option>
                <option v-for="standard in standards" :key="standard.id" :value="standard.id">{{ standard.title }}</option>
              </select>
            </div>
            <BaseInput v-model="standardForm.title" label="标准标题" placeholder="例如：课程标准（软件技术）" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">课程</label>
              <select v-model="standardForm.courseId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">请选择课程</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.code }} · {{ course.name }}</option>
              </select>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">学期</label>
              <select v-model="standardForm.semesterId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">请选择学期</option>
                <option v-for="semester in semesters" :key="semester.id" :value="semester.id">{{ semester.name }}</option>
              </select>
            </div>
            <BaseInput v-model="standardForm.courseCode" label="课程代码" placeholder="例如：CS101" />
            <BaseInput v-model="standardForm.department" label="开课部门" placeholder="例如：信息工程学院" />
            <BaseInput v-model="standardForm.applicableMajors" label="适用专业" placeholder="多个专业可用逗号分隔" />
            <BaseInput v-model="standardForm.principal" label="制定负责人" placeholder="例如：张老师" />
            <BaseInput v-model="standardForm.revisedAt" label="制(修)订时间" placeholder="例如：2026年3月" />
          </div>

          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">一、课程性质</label>
              <textarea v-model="standardForm.courseNature" rows="4" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">一、课程任务</label>
              <textarea v-model="standardForm.courseTask" rows="4" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">二、核心素养</label>
              <textarea v-model="standardForm.coreLiteracy" rows="4" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">二、课程目标（总体）</label>
              <textarea v-model="standardForm.overallGoal" rows="4" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">课程目标-素质（思政）目标</label>
              <textarea v-model="standardForm.qualityGoal" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">课程目标-能力目标</label>
              <textarea v-model="standardForm.abilityGoal" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-slate-700">课程目标-知识目标</label>
              <textarea v-model="standardForm.knowledgeGoal" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">三、课程结构（模块）</label>
              <textarea v-model="standardForm.moduleStructure" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">三、课程结构（学时安排）</label>
              <textarea v-model="standardForm.hoursArrangement" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">四、课程内容（内容要求）</label>
              <textarea v-model="standardForm.moduleContentRequirements" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">四、课程内容（教学提示）</label>
              <textarea v-model="standardForm.moduleTeachingTips" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">五、教学实施要求</label>
              <textarea v-model="standardForm.teachingRequirements" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">五、教学方式方法建议</label>
              <textarea v-model="standardForm.teachingMethodSuggestions" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">五、考核评价要求</label>
              <textarea v-model="standardForm.assessmentRequirements" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">五、教材编写要求</label>
              <textarea v-model="standardForm.textbookRequirements" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">五、课程资源开发</label>
              <textarea v-model="standardForm.resourcesDevelopment" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">五、教师团队建设</label>
              <textarea v-model="standardForm.teacherTeamBuilding" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-slate-700">五、课程实施场地与设备要求</label>
              <textarea v-model="standardForm.facilitiesRequirements" rows="3" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
            </div>
          </div>

          <div class="mt-6 rounded border border-slate-200">
            <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-sm font-medium text-slate-800">表1 教学选择建议（含思政元素与融入方式）</p>
              <button
                type="button"
                class="h-8 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                @click="handleAddStandardTemplateRow('selection')"
              >
                新增行
              </button>
            </div>
            <div class="grid grid-cols-1 gap-3 border-b border-slate-200 bg-white px-3 py-3 md:grid-cols-3">
              <BaseInput v-model="standardForm.majorLabelOne" label="专业列1标题" placeholder="例如：软件技术" />
              <BaseInput v-model="standardForm.majorLabelTwo" label="专业列2标题" placeholder="例如：计算机应用" />
              <BaseInput v-model="standardForm.majorLabelThree" label="专业列3标题" placeholder="例如：人工智能技术" />
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-xs">
                <thead class="bg-slate-100 text-slate-600">
                  <tr>
                    <th class="px-2 py-2 text-left">模块</th>
                    <th class="px-2 py-2 text-left">序号</th>
                    <th class="px-2 py-2 text-left">主题</th>
                    <th class="px-2 py-2 text-left">建议学时</th>
                    <th class="px-2 py-2 text-left">思政元素</th>
                    <th class="px-2 py-2 text-left">融入方式</th>
                    <th class="px-2 py-2 text-left">{{ standardForm.majorLabelOne || '专业一' }}</th>
                    <th class="px-2 py-2 text-left">{{ standardForm.majorLabelTwo || '专业二' }}</th>
                    <th class="px-2 py-2 text-left">{{ standardForm.majorLabelThree || '专业三' }}</th>
                    <th class="px-2 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in standardForm.selectionSuggestionRows" :key="`selection-row-${index}`" class="border-t border-slate-200">
                    <td class="p-1"><input v-model="row.moduleName" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.topicNo" class="w-12 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.topicName" class="w-32 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.recommendedHours" class="w-16 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.ideologicalElement" class="w-28 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.integrationMethod" class="w-28 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.majorOne" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.majorTwo" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.majorThree" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1">
                      <button type="button" class="h-7 rounded border border-red-200 bg-red-50 px-2 text-[11px] text-red-600" @click="handleRemoveStandardTemplateRow('selection', index)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="border-t border-slate-200 bg-slate-50 px-3 py-3">
              <label class="mb-2 block text-xs font-medium text-slate-700">表1备注</label>
              <textarea
                v-model="standardForm.selectionRemark"
                rows="2"
                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
              />
            </div>
          </div>

          <div class="mt-4 rounded border border-slate-200">
            <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <p class="text-sm font-medium text-slate-800">表2 学时分配建议</p>
              <button
                type="button"
                class="h-8 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                @click="handleAddStandardTemplateRow('hours')"
              >
                新增行
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-xs">
                <thead class="bg-slate-100 text-slate-600">
                  <tr>
                    <th class="px-2 py-2 text-left">模块</th>
                    <th class="px-2 py-2 text-left">序号</th>
                    <th class="px-2 py-2 text-left">主题</th>
                    <th class="px-2 py-2 text-left">建议学时</th>
                    <th class="px-2 py-2 text-left">思政元素</th>
                    <th class="px-2 py-2 text-left">融入方式</th>
                    <th class="px-2 py-2 text-left">{{ standardForm.majorLabelOne || '专业一' }}</th>
                    <th class="px-2 py-2 text-left">{{ standardForm.majorLabelTwo || '专业二' }}</th>
                    <th class="px-2 py-2 text-left">{{ standardForm.majorLabelThree || '专业三' }}</th>
                    <th class="px-2 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in standardForm.hourSuggestionRows" :key="`hours-row-${index}`" class="border-t border-slate-200">
                    <td class="p-1"><input v-model="row.moduleName" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.topicNo" class="w-12 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.topicName" class="w-32 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.recommendedHours" class="w-16 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.ideologicalElement" class="w-28 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.integrationMethod" class="w-28 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.majorOne" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.majorTwo" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1"><input v-model="row.majorThree" class="w-24 rounded border border-slate-300 px-2 py-1" /></td>
                    <td class="p-1">
                      <button type="button" class="h-7 rounded border border-red-200 bg-red-50 px-2 text-[11px] text-red-600" @click="handleRemoveStandardTemplateRow('hours', index)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="grid grid-cols-1 gap-3 border-t border-slate-200 bg-white px-3 py-3 md:grid-cols-3">
              <BaseInput v-model="standardForm.hourTotalMajorOne" :label="`总学时（${standardForm.majorLabelOne || '专业一'}）`" placeholder="例如：64" />
              <BaseInput v-model="standardForm.hourTotalMajorTwo" :label="`总学时（${standardForm.majorLabelTwo || '专业二'}）`" placeholder="例如：64" />
              <BaseInput v-model="standardForm.hourTotalMajorThree" :label="`总学时（${standardForm.majorLabelThree || '专业三'}）`" placeholder="例如：64" />
            </div>
            <div class="border-t border-slate-200 bg-slate-50 px-3 py-3">
              <label class="mb-2 block text-xs font-medium text-slate-700">表2备注</label>
              <textarea
                v-model="standardForm.hourRemark"
                rows="2"
                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
              />
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 rounded border border-slate-200 bg-slate-50 p-3">
            <BaseInput v-model="standardForm.moduleName" label="映证模块名（回填）" placeholder="例如：模块一" />
            <BaseInput v-model="standardForm.topicTitle" label="映证主题名（回填）" placeholder="例如：主题1" />
            <BaseInput v-model="standardForm.topicRecommendedHours" type="number" label="建议学时" placeholder="例如：8" />
            <BaseInput v-model="standardForm.topicIdeologicalElements" label="思政元素（逗号分隔）" placeholder="例如：工匠精神, 职业规范" />
            <BaseInput v-model="standardForm.topicIntegrationMethods" label="融入方式（逗号分隔）" placeholder="例如：案例讨论, 任务驱动" />
            <BaseInput v-model="standardForm.topicApplicableMajors" label="适用专业（逗号分隔）" placeholder="例如：软件技术, 计算机应用" />
            <BaseInput v-model="standardForm.topicObjectiveMapping" label="目标映射（逗号分隔）" placeholder="例如：知识目标1, 能力目标2" />
          </div>
        </BaseCard>

        <BaseCard padding="none" class="overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3">标题</th>
                <th class="text-left px-4 py-3">状态</th>
                <th class="text-left px-4 py-3">课程</th>
                <th class="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="standard in standards" :key="standard.id" class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-800">{{ standard.title }}</td>
                <td class="px-4 py-3">
                  <span class="rounded border px-2 py-0.5 text-xs" :class="documentStatusClass(standard.status)">{{ standard.status }}</span>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ resolveCourseName(standard.courseId) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <BaseButton size="sm" variant="secondary" @click="loadStandardForEditing(standard.id)">编辑</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="runTraceValidation('course-standard', standard.id)">映证校验</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="handlePublishStandard(standard.id)">发布</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="standards.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-slate-400">暂无课程标准</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </section>

      <section id="workbench-section-delivery" v-else-if="activeTab === 'delivery'" class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-semibold font-serif text-slate-900">授课计划工作台</h2>
            <div class="flex flex-wrap items-center gap-2">
              <BaseButton variant="secondary" @click="loadDeliveryPlans">刷新</BaseButton>
              <BaseButton variant="secondary" @click="prepareNewDeliveryPlan">准备新建</BaseButton>
              <BaseButton variant="secondary" :loading="isSavingDeliveryMeta" @click="handleSaveDeliveryPlanMeta">保存计划表头</BaseButton>
              <BaseButton variant="secondary" :loading="isSyncingDeliveryWeeks" @click="handleSyncDeliveryWeekDrafts">同步周次队列</BaseButton>
              <BaseButton :loading="isCreatingDeliveryPlan" @click="handleCreateDeliveryPlan">新建授课计划</BaseButton>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <div class="md:col-span-3 xl:col-span-2">
              <label class="mb-2 block text-sm font-medium text-slate-700">继续编辑已有授课计划</label>
              <select
                v-model="selectedDeliveryPlanId"
                class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">未选择（准备新建）</option>
                <option v-for="delivery in deliveryPlans" :key="delivery.id" :value="delivery.id">{{ delivery.title }}</option>
              </select>
            </div>
            <BaseInput v-model="deliveryForm.title" label="计划标题" placeholder="例如：授课计划（软件技术）" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">开课实例</label>
              <select v-model="deliveryForm.courseOfferingId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">请选择开课实例</option>
                <option v-for="offering in offerings" :key="offering.id" :value="offering.id">{{ offering.className }} · {{ resolveCourseName(offering.courseId) }}</option>
              </select>
            </div>
            <BaseInput :model-value="selectedDeliveryCourseName" label="课程名称（自动）" placeholder="" :disabled="true" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">课程标准</label>
              <select v-model="deliveryForm.courseStandardId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">可选关联</option>
                <option v-for="standard in standards" :key="standard.id" :value="standard.id">{{ standard.title }}</option>
              </select>
            </div>
            <BaseInput v-model="deliveryForm.academicYearTerm" label="学年学期" placeholder="例如：2026-2027学年第一学期" />
            <BaseInput v-model="deliveryForm.teacherName" label="任课教师" placeholder="例如：张老师" />
            <BaseInput v-model="deliveryForm.className" label="授课班级" placeholder="例如：软件2301班" />
            <BaseInput v-model="deliveryForm.theoryHours" label="理论学时" placeholder="例如：32" />
            <BaseInput v-model="deliveryForm.practiceHours" label="实践学时" placeholder="例如：32" />
            <BaseInput v-model="deliveryForm.totalHours" label="总学时" placeholder="例如：64" />
            <BaseInput v-model="deliveryForm.startWeek" label="开课周次" placeholder="例如：第1周" />
            <div class="md:col-span-3 xl:col-span-4">
              <label class="mb-2 block text-sm font-medium text-slate-700">备注</label>
              <textarea
                v-model="deliveryForm.remarks"
                rows="2"
                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                placeholder="可填写教学组织说明、思政融入比例提示等"
              />
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 p-3 md:col-span-3 xl:col-span-4">
              <p class="text-sm font-medium text-slate-700">周次编辑（按周分批编写，加入队列后统一同步）</p>
              <div class="mt-3 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <BaseInput v-model="deliveryForm.sequenceNo" type="number" label="序号" placeholder="1" />
                <BaseInput v-model="deliveryForm.weekNo" type="number" label="周次" placeholder="1" />
                <BaseInput v-model="deliveryForm.hours" type="number" label="学时" placeholder="4" />
                <BaseInput v-model="deliveryForm.grouping" label="分组" placeholder="例如：A组/B组" />
                <BaseInput v-model="deliveryForm.teachingMode" label="上课方式" placeholder="例如：讲授+实训" />
                <BaseInput v-model="deliveryForm.unitOrTask" label="单元或任务" placeholder="例如：绪论与课程导学" />
                <BaseInput v-model="deliveryForm.ideologicalElements" label="思政元素" placeholder="例如：工匠精神" />
                <BaseInput v-model="deliveryForm.integrationMethod" label="融入方式" placeholder="例如：案例讨论" />
                <BaseInput v-model="deliveryForm.theoreticalPoints" label="理论知识点" placeholder="例如：课程目标与学习路径" />
                <BaseInput v-model="deliveryForm.practiceProject" label="实践项目" placeholder="例如：学习任务拆解演练" />
                <BaseInput v-model="deliveryForm.practiceInstructor" label="实践指导教师" placeholder="例如：张老师" />
                <BaseInput v-model="deliveryForm.weekRemarks" label="周次备注" placeholder="例如：含企业案例" />
              </div>
            </div>
            <div class="rounded border border-slate-200 bg-slate-50 p-3 md:col-span-3 xl:col-span-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium text-slate-700">关联课程标准条目</p>
                <p class="text-xs text-slate-500">
                  已选 {{ deliveryForm.linkedStandardTopicIds.length }} / {{ deliveryStandardTopicOptions.length }}
                </p>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  :disabled="deliveryStandardTopicOptions.length === 0"
                  @click="handleSelectAllDeliveryStandardTopics"
                >
                  全选条目
                </button>
                <button
                  type="button"
                  class="h-8 rounded border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                  :disabled="deliveryForm.linkedStandardTopicIds.length === 0"
                  @click="handleClearDeliveryStandardTopics"
                >
                  清空已选
                </button>
                <button
                  type="button"
                  class="h-8 rounded border border-emerald-300 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  @click="handleQueueDeliveryWeekDraft"
                >
                  加入周次队列
                </button>
              </div>
              <div class="mt-3 max-h-40 overflow-y-auto rounded border border-slate-200 bg-white p-2">
                <p v-if="!deliveryForm.courseStandardId" class="px-1 py-2 text-xs text-slate-400">请先选择课程标准</p>
                <p v-else-if="deliveryStandardTopicOptions.length === 0" class="px-1 py-2 text-xs text-slate-400">当前课程标准暂无主题条目</p>
                <label
                  v-for="topic in deliveryStandardTopicOptions"
                  :key="topic.id"
                  class="flex cursor-pointer items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1.5 text-xs hover:bg-slate-50"
                >
                  <span class="text-slate-700">{{ topic.moduleName }} / {{ topic.title }}</span>
                  <input
                    type="checkbox"
                    :checked="deliveryForm.linkedStandardTopicIds.includes(topic.id)"
                    class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                    @change="handleToggleDeliveryStandardTopic(topic.id)"
                  />
                </label>
              </div>
            </div>
            <div class="md:col-span-3 xl:col-span-4 rounded border border-slate-200 bg-white p-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-slate-700">周次草稿队列（{{ deliveryWeekDrafts.length }}）</p>
                <p class="text-xs text-slate-500">每次先加入队列，确认后再同步到授课计划</p>
              </div>
              <div class="mt-3 overflow-x-auto">
                <table class="min-w-full text-xs">
                  <thead class="bg-slate-100 text-slate-600">
                    <tr>
                      <th class="px-2 py-2 text-left">序号</th>
                      <th class="px-2 py-2 text-left">周次</th>
                      <th class="px-2 py-2 text-left">学时</th>
                      <th class="px-2 py-2 text-left">分组</th>
                      <th class="px-2 py-2 text-left">上课方式</th>
                      <th class="px-2 py-2 text-left">单元/任务</th>
                      <th class="px-2 py-2 text-left">思政元素</th>
                      <th class="px-2 py-2 text-left">融入方式</th>
                      <th class="px-2 py-2 text-left">理论知识点</th>
                      <th class="px-2 py-2 text-left">实践项目</th>
                      <th class="px-2 py-2 text-left">实践指导教师</th>
                      <th class="px-2 py-2 text-left">备注</th>
                      <th class="px-2 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="week in deliveryWeekDrafts" :key="`delivery-draft-${week.weekNo}`" class="border-t border-slate-200">
                      <td class="px-2 py-2">{{ week.sequenceNo }}</td>
                      <td class="px-2 py-2">第{{ week.weekNo }}周</td>
                      <td class="px-2 py-2">{{ week.hours }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.grouping || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.teachingMode || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.unitOrTask }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.ideologicalElements || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.integrationMethod || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.theoreticalPoints || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.practiceProject || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.practiceInstructor || '-' }}</td>
                      <td class="px-2 py-2 text-slate-600">{{ week.remarks || '-' }}</td>
                      <td class="px-2 py-2">
                        <div class="flex gap-1">
                          <button type="button" class="h-7 rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700" @click="handleEditDeliveryWeekDraft(week.weekNo)">回填</button>
                          <button type="button" class="h-7 rounded border border-red-200 bg-red-50 px-2 text-[11px] text-red-600" @click="handleRemoveDeliveryWeekDraft(week.weekNo)">删除</button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="deliveryWeekDrafts.length === 0">
                      <td colspan="13" class="px-2 py-6 text-center text-slate-400">暂无周次草稿</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="none" class="overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3">标题</th>
                <th class="text-left px-4 py-3">状态</th>
                <th class="text-left px-4 py-3">开课班级</th>
                <th class="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="delivery in deliveryPlans" :key="delivery.id" class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-800">{{ delivery.title }}</td>
                <td class="px-4 py-3"><span class="rounded border px-2 py-0.5 text-xs" :class="documentStatusClass(delivery.status)">{{ delivery.status }}</span></td>
                <td class="px-4 py-3 text-slate-500">{{ resolveOfferingName(delivery.courseOfferingId) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <BaseButton size="sm" variant="secondary" @click="loadDeliveryPlanForEditing(delivery.id)">编辑</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="runTraceValidation('delivery-plan', delivery.id)">映证校验</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="handlePublishDeliveryPlan(delivery.id)">发布</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="deliveryPlans.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-slate-400">暂无授课计划</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </section>

      <section id="workbench-section-books" v-else-if="activeTab === 'books'" class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-semibold font-serif text-slate-900">教案册（学期级）</h2>
            <div class="flex flex-wrap items-center gap-2">
              <BaseButton variant="secondary" @click="loadBooks">刷新</BaseButton>
              <BaseButton variant="secondary" @click="prepareNewBook">准备新建</BaseButton>
              <BaseButton variant="secondary" :loading="isCreatingBook" @click="handleSaveBook">保存信息表</BaseButton>
              <BaseButton :loading="isCreatingBook" @click="handleCreateBook">新建教案册</BaseButton>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-slate-700">继续编辑已有教案册</label>
              <select
                v-model="selectedBookId"
                class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">未选择（准备新建）</option>
                <option v-for="book in books" :key="book.id" :value="book.id">{{ book.title }}</option>
              </select>
            </div>
            <BaseInput v-model="bookForm.title" label="教案册标题" placeholder="例如：2026秋季教师授课教案" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">开课实例</label>
              <select v-model="bookForm.courseOfferingId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">请选择开课实例</option>
                <option v-for="offering in offerings" :key="offering.id" :value="offering.id">{{ offering.className }} · {{ resolveCourseName(offering.courseId) }}</option>
              </select>
            </div>
            <BaseInput :model-value="selectedBookCourseName" label="授课科目（自动）" placeholder="" :disabled="true" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">学期</label>
              <select v-model="bookForm.semesterId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">请选择学期</option>
                <option v-for="semester in semesters" :key="semester.id" :value="semester.id">{{ semester.name }}</option>
              </select>
            </div>
            <BaseInput v-model="bookForm.teacherName" label="授课教师" placeholder="例如：张老师" />
            <BaseInput v-model="bookForm.teacherTitle" label="职称" placeholder="例如：讲师" />
            <BaseInput v-model="bookForm.teacherUnit" label="教学单位" placeholder="例如：信息工程学院" />
            <BaseInput v-model="bookForm.periodStart" type="date" label="起始日期" placeholder="" />
            <BaseInput v-model="bookForm.periodEnd" type="date" label="结束日期" placeholder="" />
            <BaseInput v-model="bookForm.totalHours" type="number" label="总学时" placeholder="例如：64" />
            <BaseInput v-model="bookForm.theoryHours" type="number" label="理论学时" placeholder="例如：32" />
            <BaseInput v-model="bookForm.practicalHours" type="number" label="实验/实践学时" placeholder="例如：32" />
            <BaseInput v-model="bookForm.weeklyHours" type="number" label="周学时" placeholder="例如：4" />
            <BaseInput v-model="bookForm.assessmentMethod" label="考核方式" placeholder="例如：过程考核+期末考核" />
            <BaseInput v-model="bookForm.targetUnit" label="授课对象单位" placeholder="例如：信息工程学院" />
            <BaseInput v-model="bookForm.targetClass" label="授课对象班级" placeholder="例如：软件2301班" />
            <div class="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">教研室检查情况</label>
                <textarea v-model="bookForm.researchReview" rows="2" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">系（部）检查情况</label>
                <textarea v-model="bookForm.deptReview" rows="2" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" />
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="none" class="overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3">标题</th>
                <th class="text-left px-4 py-3">状态</th>
                <th class="text-left px-4 py-3">开课实例</th>
                <th class="text-left px-4 py-3">学期</th>
                <th class="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book.id" class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-800">{{ book.title }}</td>
                <td class="px-4 py-3"><span class="rounded border px-2 py-0.5 text-xs" :class="documentStatusClass(book.status)">{{ book.status }}</span></td>
                <td class="px-4 py-3 text-slate-500">{{ resolveOfferingName(book.courseOfferingId) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ resolveSemesterName(book.semesterId) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <BaseButton size="sm" variant="secondary" @click="applyBookToForm(book)">编辑</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="books.length === 0">
                <td colspan="5" class="px-4 py-10 text-center text-slate-400">暂无教案册</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </section>

      <section id="workbench-section-lessons" v-else-if="activeTab === 'lessons'" class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold font-serif text-slate-900">单次课教案（No.x）</h2>
            <BaseButton variant="secondary" @click="loadLessons">刷新</BaseButton>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-7 gap-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">教案册</label>
              <select v-model="lessonForm.bookId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">请选择教案册</option>
                <option v-for="book in books" :key="book.id" :value="book.id">{{ book.title }}</option>
              </select>
            </div>
            <BaseInput v-model="lessonForm.lessonNo" type="number" label="No." placeholder="1" />
            <BaseInput v-model="lessonForm.title" label="课题" placeholder="例如：课程导学" />
            <BaseInput v-model="lessonForm.weekNo" type="number" label="周次" placeholder="1" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">授课计划</label>
              <select v-model="lessonForm.deliveryPlanId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">可选关联</option>
                <option v-for="delivery in deliveryPlans" :key="delivery.id" :value="delivery.id">{{ delivery.title }}</option>
              </select>
            </div>
            <BaseInput v-model="lessonForm.ideologicalElements" label="课程思政元素" placeholder="例如：工匠精神" />
            <div class="flex items-end">
              <BaseButton full-width :loading="isCreatingLesson" @click="handleCreateLesson">新建单次课</BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="none" class="overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3">No.</th>
                <th class="text-left px-4 py-3">课题</th>
                <th class="text-left px-4 py-3">状态</th>
                <th class="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lesson in lessons" :key="lesson.id" class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-500">{{ lesson.lessonNo }}</td>
                <td class="px-4 py-3 text-slate-800">{{ lesson.title }}</td>
                <td class="px-4 py-3"><span class="rounded border px-2 py-0.5 text-xs" :class="documentStatusClass(lesson.status)">{{ lesson.status }}</span></td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <BaseButton size="sm" variant="secondary" @click="runTraceValidation('teaching-plan-lesson', lesson.id)">映证校验</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="handlePublishLesson(lesson.id)">发布</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="openEditorFromLesson(lesson.id)">进入编辑器</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="lessons.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-slate-400">暂无单次课教案</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </section>

      <section id="workbench-section-courseware" v-else-if="activeTab === 'courseware'" class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold font-serif text-slate-900">课件附件（轻量映证）</h2>
            <BaseButton variant="secondary" @click="loadCoursewareAssets">刷新</BaseButton>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
            <BaseInput v-model="coursewareForm.title" label="附件标题" placeholder="例如：第1周教学PPT" />
            <BaseInput v-model="coursewareForm.fileName" label="文件名" placeholder="week1.pptx" />
            <BaseInput v-model="coursewareForm.fileUrl" label="文件地址" placeholder="https://.../week1.pptx" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">开课实例</label>
              <select v-model="coursewareForm.courseOfferingId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="">可选</option>
                <option v-for="offering in offerings" :key="offering.id" :value="offering.id">{{ offering.className }} · {{ resolveCourseName(offering.courseId) }}</option>
              </select>
            </div>
            <BaseInput v-model="coursewareForm.chapterRef" label="对应章节" placeholder="例如：模块一-主题1" />
            <div class="flex items-end">
              <BaseButton full-width :loading="isCreatingCourseware" @click="handleCreateCoursewareAsset">上传元数据</BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="none" class="overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3">标题</th>
                <th class="text-left px-4 py-3">文件</th>
                <th class="text-left px-4 py-3">章节</th>
                <th class="text-left px-4 py-3">标签</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in coursewareAssets" :key="asset.id" class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-800">{{ asset.title }}</td>
                <td class="px-4 py-3 text-slate-500">{{ asset.fileName }}</td>
                <td class="px-4 py-3 text-slate-500">{{ asset.chapterRef || '-' }}</td>
                <td class="px-4 py-3 text-slate-500">{{ asset.ideologicalElements.join('、') || '-' }}</td>
              </tr>
              <tr v-if="coursewareAssets.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-slate-400">暂无课件附件记录</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </section>

      <section id="workbench-section-templates" v-else-if="activeTab === 'templates'" class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold font-serif text-slate-900">模板中心（版本化）</h2>
            <BaseButton variant="secondary" @click="loadTemplates">刷新</BaseButton>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">文档类型</label>
              <select v-model="templateForm.docType" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="COURSE_STANDARD">课程标准</option>
                <option value="DELIVERY_PLAN">授课计划</option>
                <option value="TEACHING_PLAN_BOOK">教案册</option>
                <option value="TEACHING_PLAN_LESSON">单次课教案</option>
              </select>
            </div>
            <BaseInput v-model="templateForm.name" label="模板名称" placeholder="例如：高职课程标准模板V1" />
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">范围</label>
              <select v-model="templateForm.scope" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <option value="PERSONAL">个人模板</option>
                <option value="ORG">组织模板</option>
              </select>
            </div>
            <BaseInput v-model="templateForm.description" label="说明" placeholder="模板用途说明" />
            <div class="flex items-end">
              <BaseButton full-width :loading="isCreatingTemplate" @click="handleCreateTemplate">新建模板</BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="none" class="overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="text-left px-4 py-3">名称</th>
                <th class="text-left px-4 py-3">类型</th>
                <th class="text-left px-4 py-3">范围</th>
                <th class="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="template in templates" :key="template.id" class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-800">{{ template.name }}</td>
                <td class="px-4 py-3 text-slate-500">{{ template.docType }}</td>
                <td class="px-4 py-3 text-slate-500">{{ template.scope }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <BaseButton size="sm" variant="secondary" @click="handleCreateTemplateVersion(template.id)">新版本</BaseButton>
                    <BaseButton size="sm" variant="secondary" @click="handlePublishLatestTemplateVersion(template.id)">发布最新</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="templates.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-slate-400">暂无模板定义</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </section>

      <section id="workbench-section-traceability" v-else class="mt-6 space-y-5">
        <BaseCard padding="lg">
          <h2 class="text-lg font-semibold font-serif text-slate-900">映证校验结果</h2>
          <p class="mt-2 text-sm text-slate-500">可在各工作台点击“映证校验”快速验证；这里展示最近一次结果。</p>
          <div class="mt-4 rounded border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-sm text-slate-700">
              通过状态：
              <span :class="lastTraceResult?.passed ? 'text-emerald-700' : 'text-red-600'">
                {{ lastTraceResult ? (lastTraceResult.passed ? '通过' : '未通过') : '尚未执行' }}
              </span>
            </p>
            <div class="mt-3">
              <p class="text-sm font-medium text-red-600">阻断项</p>
              <ul class="mt-1 list-disc pl-5 text-sm text-red-600 space-y-1">
                <li v-for="item in lastTraceResult?.blockers || []" :key="`blocker-${item}`">{{ item }}</li>
                <li v-if="!lastTraceResult || lastTraceResult.blockers.length === 0" class="text-slate-400">无阻断项</li>
              </ul>
            </div>
            <div class="mt-3">
              <p class="text-sm font-medium text-amber-700">告警项</p>
              <ul class="mt-1 list-disc pl-5 text-sm text-amber-700 space-y-1">
                <li v-for="item in lastTraceResult?.warnings || []" :key="`warning-${item}`">{{ item }}</li>
                <li v-if="!lastTraceResult || lastTraceResult.warnings.length === 0" class="text-slate-400">无告警项</li>
              </ul>
            </div>
          </div>
        </BaseCard>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/layout/NavBar.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { useAuthStore } from '../stores/auth'
import {
  type Semester,
  type Course,
  type CourseOffering,
  type CourseStandard,
  type DeliveryPlan,
  type DeliveryPlanDetail,
  type TeachingPlanBook,
  type TeachingPlanLesson,
  type CoursewareAsset,
  type TemplateDefinition,
  type TraceabilityValidationResult,
  listSemesters,
  listCourses,
  listCourseOfferings,
  listCourseStandards,
  createCourseStandard,
  getCourseStandard,
  updateCourseStandard,
  publishCourseStandard,
  listDeliveryPlans,
  createDeliveryPlan,
  getDeliveryPlan,
  updateDeliveryPlan,
  updateDeliveryPlanWeeks,
  publishDeliveryPlan,
  listTeachingPlanBooks,
  createTeachingPlanBook,
  updateTeachingPlanBook,
  listTeachingPlanLessons,
  createTeachingPlanLesson,
  publishTeachingPlanLesson,
  listCoursewareAssets,
  createCoursewareAsset,
  listTemplates,
  createTemplateDefinition,
  createTemplateVersion,
  listTemplateVersions,
  publishTemplateVersion,
  validateTraceability,
} from '../api/academic'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

interface StandardTemplateRow {
  moduleName: string
  topicNo: string
  topicName: string
  recommendedHours: string
  ideologicalElement: string
  integrationMethod: string
  majorOne: string
  majorTwo: string
  majorThree: string
}

interface StandardTemplateContent {
  courseCode: string
  department: string
  applicableMajors: string
  majorLabelOne: string
  majorLabelTwo: string
  majorLabelThree: string
  principal: string
  revisedAt: string
  courseNature: string
  courseTask: string
  coreLiteracy: string
  overallGoal: string
  qualityGoal: string
  abilityGoal: string
  knowledgeGoal: string
  moduleStructure: string
  hoursArrangement: string
  moduleContentRequirements: string
  moduleTeachingTips: string
  teachingRequirements: string
  teachingMethodSuggestions: string
  assessmentRequirements: string
  textbookRequirements: string
  resourcesDevelopment: string
  teacherTeamBuilding: string
  facilitiesRequirements: string
  selectionRemark: string
  hourRemark: string
  hourTotalMajorOne: string
  hourTotalMajorTwo: string
  hourTotalMajorThree: string
  selectionSuggestionRows: StandardTemplateRow[]
  hourSuggestionRows: StandardTemplateRow[]
}

interface DeliveryTemplateMeta {
  academicYearTerm: string
  teacherName: string
  className: string
  theoryHours: string
  practiceHours: string
  totalHours: string
  startWeek: string
  remarks: string
}

interface DeliveryWeekDraft {
  sequenceNo: number
  weekNo: number
  hours: number
  grouping: string
  teachingMode: string
  unitOrTask: string
  ideologicalElements: string
  integrationMethod: string
  theoreticalPoints: string
  practiceProject: string
  practiceInstructor: string
  remarks: string
  linkedStandardTopicIds: string[]
}

const createEmptyStandardTemplateRow = (): StandardTemplateRow => ({
  moduleName: '',
  topicNo: '',
  topicName: '',
  recommendedHours: '',
  ideologicalElement: '',
  integrationMethod: '',
  majorOne: '',
  majorTwo: '',
  majorThree: '',
})

const createDefaultStandardTemplateContent = (): StandardTemplateContent => ({
  courseCode: '',
  department: '',
  applicableMajors: '',
  majorLabelOne: '专业一',
  majorLabelTwo: '专业二',
  majorLabelThree: '专业三',
  principal: '',
  revisedAt: '',
  courseNature: '',
  courseTask: '',
  coreLiteracy: '',
  overallGoal: '',
  qualityGoal: '',
  abilityGoal: '',
  knowledgeGoal: '',
  moduleStructure: '',
  hoursArrangement: '',
  moduleContentRequirements: '',
  moduleTeachingTips: '',
  teachingRequirements: '',
  teachingMethodSuggestions: '',
  assessmentRequirements: '',
  textbookRequirements: '',
  resourcesDevelopment: '',
  teacherTeamBuilding: '',
  facilitiesRequirements: '',
  selectionRemark:
    '打“√”表示建议该专业选学该模块该主题教学内容，思政元素融入学时不得少于总学时的1/3。',
  hourRemark:
    '空白表示建议该专业选学该模块该主题教学学时为0，总学时应与对应专业人才培养方案中课时安排一致。',
  hourTotalMajorOne: '',
  hourTotalMajorTwo: '',
  hourTotalMajorThree: '',
  selectionSuggestionRows: [createEmptyStandardTemplateRow()],
  hourSuggestionRows: [createEmptyStandardTemplateRow()],
})

const createDefaultDeliveryTemplateMeta = (): DeliveryTemplateMeta => ({
  academicYearTerm: '',
  teacherName: '',
  className: '',
  theoryHours: '',
  practiceHours: '',
  totalHours: '',
  startWeek: '',
  remarks: '',
})

const createDefaultDeliveryWeekDraft = (): DeliveryWeekDraft => ({
  sequenceNo: 1,
  weekNo: 1,
  hours: 4,
  grouping: '',
  teachingMode: '',
  unitOrTask: '',
  ideologicalElements: '',
  integrationMethod: '',
  theoreticalPoints: '',
  practiceProject: '',
  practiceInstructor: '',
  remarks: '',
  linkedStandardTopicIds: [],
})

const normalizeStandardTemplateRow = (value: unknown): StandardTemplateRow => {
  if (!value || typeof value !== 'object') {
    return createEmptyStandardTemplateRow()
  }
  const row = value as Record<string, unknown>
  return {
    moduleName: typeof row.moduleName === 'string' ? row.moduleName : '',
    topicNo: typeof row.topicNo === 'string' ? row.topicNo : '',
    topicName: typeof row.topicName === 'string' ? row.topicName : '',
    recommendedHours: typeof row.recommendedHours === 'string' ? row.recommendedHours : '',
    ideologicalElement: typeof row.ideologicalElement === 'string' ? row.ideologicalElement : '',
    integrationMethod: typeof row.integrationMethod === 'string' ? row.integrationMethod : '',
    majorOne: typeof row.majorOne === 'string' ? row.majorOne : '',
    majorTwo: typeof row.majorTwo === 'string' ? row.majorTwo : '',
    majorThree: typeof row.majorThree === 'string' ? row.majorThree : '',
  }
}

const normalizeStandardTemplateContent = (value: unknown): StandardTemplateContent => {
  const defaults = createDefaultStandardTemplateContent()
  if (!value || typeof value !== 'object') {
    return defaults
  }
  const raw = value as Record<string, unknown>
  const readText = (key: keyof StandardTemplateContent): string =>
    typeof raw[key] === 'string' ? (raw[key] as string) : defaults[key]
  const readRows = (key: 'selectionSuggestionRows' | 'hourSuggestionRows'): StandardTemplateRow[] => {
    const source = Array.isArray(raw[key]) ? raw[key] : defaults[key]
    const rows = source
      .map((item) => normalizeStandardTemplateRow(item))
      .filter((row) =>
        Object.values(row).some((field) => field.trim().length > 0)
      )
    return rows.length > 0 ? rows : [createEmptyStandardTemplateRow()]
  }

  return {
    ...defaults,
    courseCode: readText('courseCode'),
    department: readText('department'),
    applicableMajors: readText('applicableMajors'),
    majorLabelOne: readText('majorLabelOne'),
    majorLabelTwo: readText('majorLabelTwo'),
    majorLabelThree: readText('majorLabelThree'),
    principal: readText('principal'),
    revisedAt: readText('revisedAt'),
    courseNature: readText('courseNature'),
    courseTask: readText('courseTask'),
    coreLiteracy: readText('coreLiteracy'),
    overallGoal: readText('overallGoal'),
    qualityGoal: readText('qualityGoal'),
    abilityGoal: readText('abilityGoal'),
    knowledgeGoal: readText('knowledgeGoal'),
    moduleStructure: readText('moduleStructure'),
    hoursArrangement: readText('hoursArrangement'),
    moduleContentRequirements: readText('moduleContentRequirements'),
    moduleTeachingTips: readText('moduleTeachingTips'),
    teachingRequirements: readText('teachingRequirements'),
    teachingMethodSuggestions: readText('teachingMethodSuggestions'),
    assessmentRequirements: readText('assessmentRequirements'),
    textbookRequirements: readText('textbookRequirements'),
    resourcesDevelopment: readText('resourcesDevelopment'),
    teacherTeamBuilding: readText('teacherTeamBuilding'),
    facilitiesRequirements: readText('facilitiesRequirements'),
    selectionRemark: readText('selectionRemark'),
    hourRemark: readText('hourRemark'),
    hourTotalMajorOne: readText('hourTotalMajorOne'),
    hourTotalMajorTwo: readText('hourTotalMajorTwo'),
    hourTotalMajorThree: readText('hourTotalMajorThree'),
    selectionSuggestionRows: readRows('selectionSuggestionRows'),
    hourSuggestionRows: readRows('hourSuggestionRows'),
  }
}

const normalizeDeliveryTemplateMeta = (value: unknown): DeliveryTemplateMeta => {
  const defaults = createDefaultDeliveryTemplateMeta()
  if (!value || typeof value !== 'object') {
    return defaults
  }
  const raw = value as Record<string, unknown>
  const read = (key: keyof DeliveryTemplateMeta): string =>
    typeof raw[key] === 'string' ? (raw[key] as string) : defaults[key]
  return {
    academicYearTerm: read('academicYearTerm'),
    teacherName: read('teacherName'),
    className: read('className'),
    theoryHours: read('theoryHours'),
    practiceHours: read('practiceHours'),
    totalHours: read('totalHours'),
    startWeek: read('startWeek'),
    remarks: read('remarks'),
  }
}

const createCourseStandardTemplateHtml = (payload: StandardTemplateContent): string => {
  const p = (label: string, content: string) => `<p><strong>${label}</strong>${content ? ` ${content}` : ''}</p>`
  const majors = [payload.majorLabelOne, payload.majorLabelTwo, payload.majorLabelThree].filter((item) => item.trim()).join('、')
  return [
    p('课程代码：', payload.courseCode),
    p('开课部门：', payload.department),
    p('适用专业：', payload.applicableMajors || majors),
    p('制定负责人：', payload.principal),
    p('制（修）定时间：', payload.revisedAt),
    '<h2>一、课程性质与任务</h2>',
    p('（一）课程性质：', payload.courseNature),
    p('（二）课程任务：', payload.courseTask),
    '<h2>二、核心素养与课程目标</h2>',
    p('（一）核心素养：', payload.coreLiteracy),
    p('（二）课程目标-总体目标：', payload.overallGoal),
    p('素质（思政）目标：', payload.qualityGoal),
    p('能力目标：', payload.abilityGoal),
    p('知识目标：', payload.knowledgeGoal),
    '<h2>三、课程结构</h2>',
    p('（一）课程模块：', payload.moduleStructure),
    p('（二）学时安排：', payload.hoursArrangement),
    '<h2>四、课程内容</h2>',
    p('内容要求：', payload.moduleContentRequirements),
    p('教学提示：', payload.moduleTeachingTips),
    '<h2>五、教学实施要求与建议</h2>',
    p('（一）教学要求：', payload.teachingRequirements),
    p('（二）教学方式方法建议：', payload.teachingMethodSuggestions),
    p('（三）考核评价要求：', payload.assessmentRequirements),
    p('（四）教材编写要求：', payload.textbookRequirements),
    p('（五）课程资源开发：', payload.resourcesDevelopment),
    p('（六）教师团队建设：', payload.teacherTeamBuilding),
    p('（七）课程实施场地、设施设备要求：', payload.facilitiesRequirements),
    '<h2>附：表格说明</h2>',
    p('表1备注：', payload.selectionRemark),
    p('表2备注：', payload.hourRemark),
    p(`表2总学时（${payload.majorLabelOne || '专业一'}）：`, payload.hourTotalMajorOne),
    p(`表2总学时（${payload.majorLabelTwo || '专业二'}）：`, payload.hourTotalMajorTwo),
    p(`表2总学时（${payload.majorLabelThree || '专业三'}）：`, payload.hourTotalMajorThree),
  ].join('')
}

const tabs = [
  { id: 'standards', label: '课程标准' },
  { id: 'delivery', label: '授课计划' },
  { id: 'books', label: '教案册' },
  { id: 'lessons', label: '单次课教案' },
  { id: 'courseware', label: '课件附件' },
  { id: 'templates', label: '模板中心' },
  { id: 'traceability', label: '映证结果' },
] as const

type TabId = (typeof tabs)[number]['id']

const activeTab = ref<TabId>('standards')

const semesters = ref<Semester[]>([])
const courses = ref<Course[]>([])
const offerings = ref<CourseOffering[]>([])
const standards = ref<CourseStandard[]>([])
const deliveryPlans = ref<DeliveryPlan[]>([])
const books = ref<TeachingPlanBook[]>([])
const lessons = ref<TeachingPlanLesson[]>([])
const coursewareAssets = ref<CoursewareAsset[]>([])
const templates = ref<TemplateDefinition[]>([])

const lastTraceResult = ref<TraceabilityValidationResult | null>(null)

const isCreatingStandard = ref(false)
const isCreatingDeliveryPlan = ref(false)
const isCreatingBook = ref(false)
const isCreatingLesson = ref(false)
const isCreatingCourseware = ref(false)
const isCreatingTemplate = ref(false)
const isSavingStandard = ref(false)
const isSavingDeliveryMeta = ref(false)
const isSyncingDeliveryWeeks = ref(false)

const selectedStandardId = ref('')
const selectedDeliveryPlanId = ref('')
const selectedBookId = ref('')

const standardForm = ref({
  title: '',
  courseId: '',
  semesterId: '',
  courseCode: '',
  department: '',
  applicableMajors: '',
  majorLabelOne: '专业一',
  majorLabelTwo: '专业二',
  majorLabelThree: '专业三',
  principal: '',
  revisedAt: '',
  courseNature: '',
  courseTask: '',
  coreLiteracy: '',
  overallGoal: '',
  qualityGoal: '',
  abilityGoal: '',
  knowledgeGoal: '',
  moduleStructure: '',
  hoursArrangement: '',
  moduleContentRequirements: '',
  moduleTeachingTips: '',
  teachingRequirements: '',
  teachingMethodSuggestions: '',
  assessmentRequirements: '',
  textbookRequirements: '',
  resourcesDevelopment: '',
  teacherTeamBuilding: '',
  facilitiesRequirements: '',
  selectionRemark:
    '打“√”表示建议该专业选学该模块该主题教学内容，思政元素融入学时不得少于总学时的1/3。',
  hourRemark:
    '空白表示建议该专业选学该模块该主题教学学时为0，总学时应与对应专业人才培养方案中课时安排一致。',
  hourTotalMajorOne: '',
  hourTotalMajorTwo: '',
  hourTotalMajorThree: '',
  moduleName: '',
  topicTitle: '',
  topicRecommendedHours: '8',
  topicIdeologicalElements: '工匠精神',
  topicIntegrationMethods: '案例讨论',
  topicApplicableMajors: '软件技术',
  topicObjectiveMapping: '',
  selectionSuggestionRows: [createEmptyStandardTemplateRow()],
  hourSuggestionRows: [createEmptyStandardTemplateRow()],
})

const deliveryForm = ref({
  title: '',
  courseOfferingId: '',
  courseStandardId: '',
  academicYearTerm: '',
  teacherName: '',
  className: '',
  theoryHours: '',
  practiceHours: '',
  totalHours: '',
  startWeek: '',
  remarks: '',
  linkedStandardTopicIds: [] as string[],
  sequenceNo: '1',
  weekNo: '1',
  hours: '4',
  grouping: '',
  teachingMode: '',
  unitOrTask: '',
  ideologicalElements: '',
  integrationMethod: '',
  theoreticalPoints: '',
  practiceProject: '',
  practiceInstructor: '',
  weekRemarks: '',
})

const deliveryWeekDrafts = ref<DeliveryWeekDraft[]>([])

const bookForm = ref({
  title: '',
  courseOfferingId: '',
  semesterId: '',
  teacherName: '',
  teacherTitle: '',
  teacherUnit: '',
  periodStart: '',
  periodEnd: '',
  totalHours: '64',
  theoryHours: '32',
  practicalHours: '32',
  weeklyHours: '4',
  assessmentMethod: '',
  targetUnit: '',
  targetClass: '',
  researchReview: '',
  deptReview: '',
})

const lessonForm = ref({
  bookId: '',
  lessonNo: '1',
  title: '',
  weekNo: '1',
  deliveryPlanId: '',
  ideologicalElements: '',
})

const templateForm = ref({
  docType: 'COURSE_STANDARD' as 'COURSE_STANDARD' | 'DELIVERY_PLAN' | 'TEACHING_PLAN_BOOK' | 'TEACHING_PLAN_LESSON',
  name: '',
  scope: 'PERSONAL' as 'PERSONAL' | 'ORG',
  description: '',
})

const coursewareForm = ref({
  title: '',
  fileName: '',
  fileUrl: '',
  courseOfferingId: '',
  chapterRef: '',
  ideologicalElements: '工匠精神',
})

const courseNameMap = computed(() => new Map(courses.value.map((course) => [course.id, `${course.code} · ${course.name}`])))
const courseByIdMap = computed(() => new Map(courses.value.map((course) => [course.id, course])))
const semesterNameMap = computed(() => new Map(semesters.value.map((semester) => [semester.id, semester.name])))
const offeringByIdMap = computed(() => new Map(offerings.value.map((offering) => [offering.id, offering])))
const offeringNameMap = computed(() =>
  new Map(
    offerings.value.map((offering) => [
      offering.id,
      `${offering.className} · ${courseNameMap.value.get(offering.courseId) || '未知课程'}`,
    ])
  )
)
const selectedDeliveryCourseName = computed(() => {
  const offering = offeringByIdMap.value.get(deliveryForm.value.courseOfferingId)
  if (!offering) {
    return ''
  }
  const course = courseByIdMap.value.get(offering.courseId)
  return course?.name || ''
})
const selectedBookCourseName = computed(() => {
  const offering = offeringByIdMap.value.get(bookForm.value.courseOfferingId)
  if (!offering) {
    return ''
  }
  const course = courseByIdMap.value.get(offering.courseId)
  return course?.name || ''
})
const deliveryStandardTopicOptions = computed(() => {
  const standard = standards.value.find((item) => item.id === deliveryForm.value.courseStandardId)
  if (!standard?.modules?.length) {
    return [] as Array<{ id: string; moduleName: string; title: string }>
  }
  return standard.modules.flatMap((module) =>
    (module.topics || []).map((topic) => ({
      id: topic.id,
      moduleName: module.name,
      title: topic.title,
    }))
  )
})

const isTabId = (value: string): value is TabId => tabs.some((tab) => tab.id === value)
const resolveSingleQueryValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }
  return ''
}
const resolvePositiveQueryNumber = (value: unknown): number | null => {
  const text = resolveSingleQueryValue(value)
  const parsed = Number.parseInt(text, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}
const resolveTabFromQuery = (value: unknown): TabId | null => {
  const tab = resolveSingleQueryValue(value)
  return isTabId(tab) ? tab : null
}
const resolveSectionIdByTab = (tab: TabId): string => `workbench-section-${tab}`
const scrollToWorkbenchSection = (tab: TabId) => {
  if (typeof document === 'undefined') {
    return
  }
  const element = document.getElementById(resolveSectionIdByTab(tab))
  if (!element) {
    return
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const routeContextSource = computed(() => resolveSingleQueryValue(route.query.source))
const routeContextDeliveryPlanId = computed(() => resolveSingleQueryValue(route.query.deliveryPlanId))
const routeContextBookId = computed(() => resolveSingleQueryValue(route.query.bookId))
const routeContextCourseOfferingId = computed(() => resolveSingleQueryValue(route.query.courseOfferingId))
const routeContextWeekNo = computed(() => resolvePositiveQueryNumber(route.query.weekNo))
const routeContextLessonId = computed(() => resolveSingleQueryValue(route.query.lessonId))
const workbenchContextHint = computed(() => {
  if (routeContextSource.value === 'editor-lesson-warning') {
    const parts: string[] = ['已从单次课编辑器跳转至当前工作台，可在此处理映证告警。']
    if (routeContextWeekNo.value) {
      parts.push(`建议先核对第 ${routeContextWeekNo.value} 周关联配置。`)
    }
    if (routeContextLessonId.value) {
      parts.push(`来源单次课 ID：${routeContextLessonId.value}`)
    }
    return parts.join(' ')
  }

  if (routeContextSource.value === 'admin-offering') {
    return '已从管理中心携带开课实例上下文进入工作台，可直接创建或维护对应授课计划。'
  }

  if (routeContextSource.value === 'home-plan-context') {
    return '已从首页携带教案上下文进入工作台，可直接补齐链路映证信息。'
  }

  return ''
})

const applyWorkbenchRouteContext = async () => {
  const nextTab = resolveTabFromQuery(route.query.tab)
  if (nextTab) {
    activeTab.value = nextTab
  }

  if (activeTab.value === 'delivery') {
    const deliveryPlanId = routeContextDeliveryPlanId.value
    if (routeContextCourseOfferingId.value) {
      deliveryForm.value.courseOfferingId = routeContextCourseOfferingId.value
    }
    if (deliveryPlanId) {
      selectedDeliveryPlanId.value = deliveryPlanId
      await loadDeliveryPlanForEditing(deliveryPlanId)
    }
    if (routeContextWeekNo.value) {
      deliveryForm.value.weekNo = String(routeContextWeekNo.value)
    }
  }

  if (activeTab.value === 'books' && routeContextCourseOfferingId.value) {
    bookForm.value.courseOfferingId = routeContextCourseOfferingId.value
  }

  if (activeTab.value === 'lessons') {
    if (routeContextBookId.value) {
      lessonForm.value.bookId = routeContextBookId.value
    }
    if (routeContextDeliveryPlanId.value) {
      lessonForm.value.deliveryPlanId = routeContextDeliveryPlanId.value
    }
    if (routeContextWeekNo.value) {
      lessonForm.value.weekNo = String(routeContextWeekNo.value)
    }
    if (lessonForm.value.bookId) {
      await loadLessons()
    }
  }

  if (activeTab.value === 'courseware' && routeContextCourseOfferingId.value) {
    coursewareForm.value.courseOfferingId = routeContextCourseOfferingId.value
  }

  await nextTick()
  scrollToWorkbenchSection(activeTab.value)
}

const clearWorkbenchContext = () => {
  router.replace({ path: '/workbench' })
}

onMounted(async () => {
  resetBookForm()
  await Promise.all([
    loadSemestersAndCourses(),
    loadStandards(),
    loadDeliveryPlans(),
    loadBooks(),
    loadCoursewareAssets(),
    loadTemplates(),
  ])
  await applyWorkbenchRouteContext()
})

watch(
  () => route.fullPath,
  async () => {
    await applyWorkbenchRouteContext()
  }
)

watch(
  () => selectedStandardId.value,
  async (standardId) => {
    if (!standardId) {
      return
    }
    await loadStandardForEditing(standardId)
  }
)

watch(
  () => selectedDeliveryPlanId.value,
  async (deliveryPlanId) => {
    if (!deliveryPlanId) {
      return
    }
    await loadDeliveryPlanForEditing(deliveryPlanId)
  }
)

watch(
  () => selectedBookId.value,
  (bookId) => {
    if (!bookId) {
      return
    }
    const matched = books.value.find((item) => item.id === bookId)
    if (matched) {
      applyBookToForm(matched)
    }
  }
)

watch(
  () => deliveryForm.value.courseStandardId,
  () => {
    const validTopicIds = new Set(deliveryStandardTopicOptions.value.map((item) => item.id))
    deliveryForm.value.linkedStandardTopicIds = deliveryForm.value.linkedStandardTopicIds.filter((id) =>
      validTopicIds.has(id)
    )
  }
)

watch(
  () => lessonForm.value.bookId,
  async (bookId) => {
    if (!bookId) {
      lessons.value = []
      return
    }
    await loadLessons()
  }
)

watch(
  () => standardForm.value.courseId,
  (courseId) => {
    if (!courseId) {
      return
    }
    const course = courseByIdMap.value.get(courseId)
    if (!course) {
      return
    }
    if (!standardForm.value.courseCode) {
      standardForm.value.courseCode = course.code
    }
    if (!standardForm.value.department && course.department) {
      standardForm.value.department = course.department
    }
    if (!standardForm.value.title) {
      standardForm.value.title = `${course.name}课程标准`
    }
  }
)

watch(
  () => deliveryForm.value.courseOfferingId,
  (offeringId) => {
    if (!offeringId) {
      return
    }
    const offering = offeringByIdMap.value.get(offeringId)
    if (!offering) {
      return
    }
    const course = courseByIdMap.value.get(offering.courseId)
    if (!deliveryForm.value.className) {
      deliveryForm.value.className = offering.className
    }
    if (!deliveryForm.value.title && course) {
      deliveryForm.value.title = `${course.name}授课计划`
    }
    if (!deliveryForm.value.teacherName) {
      deliveryForm.value.teacherName = authStore.user?.username || ''
    }
    if (!deliveryForm.value.totalHours && offering.weeklyHours && offering.totalWeeks) {
      deliveryForm.value.totalHours = String(offering.weeklyHours * offering.totalWeeks)
    }
    if (!deliveryForm.value.startWeek) {
      deliveryForm.value.startWeek = '第1周'
    }
  }
)

watch(
  () => bookForm.value.courseOfferingId,
  (offeringId) => {
    if (!offeringId) {
      return
    }
    const offering = offeringByIdMap.value.get(offeringId)
    if (!offering) {
      return
    }
    const course = courseByIdMap.value.get(offering.courseId)
    if (!bookForm.value.title && course) {
      bookForm.value.title = `${course.name}教师授课教案`
    }
    if (!bookForm.value.targetClass) {
      bookForm.value.targetClass = offering.className
    }
    if (!bookForm.value.semesterId) {
      bookForm.value.semesterId = offering.semesterId
    }
  }
)

const handleToggleDeliveryStandardTopic = (topicId: string) => {
  if (deliveryForm.value.linkedStandardTopicIds.includes(topicId)) {
    deliveryForm.value.linkedStandardTopicIds = deliveryForm.value.linkedStandardTopicIds.filter((id) => id !== topicId)
    return
  }
  deliveryForm.value.linkedStandardTopicIds = [...deliveryForm.value.linkedStandardTopicIds, topicId]
}

const handleSelectAllDeliveryStandardTopics = () => {
  deliveryForm.value.linkedStandardTopicIds = deliveryStandardTopicOptions.value.map((item) => item.id)
}

const handleClearDeliveryStandardTopics = () => {
  deliveryForm.value.linkedStandardTopicIds = []
}

const loadSemestersAndCourses = async () => {
  try {
    const [semesterData, courseData, offeringData] = await Promise.all([
      listSemesters({ limit: 100 }),
      listCourses({ limit: 100 }),
      listCourseOfferings({ limit: 200 }),
    ])
    semesters.value = semesterData.items
    courses.value = courseData.items
    offerings.value = offeringData.items
  } catch (error) {
    console.error('加载基础数据失败', error)
  }
}

const loadStandards = async () => {
  try {
    const data = await listCourseStandards({ limit: 100 })
    standards.value = data.items
    if (selectedStandardId.value && !standards.value.some((item) => item.id === selectedStandardId.value)) {
      selectedStandardId.value = ''
    }
  } catch (error) {
    console.error('加载课程标准失败', error)
  }
}

const loadDeliveryPlans = async () => {
  try {
    const data = await listDeliveryPlans({ limit: 100 })
    deliveryPlans.value = data.items
    if (selectedDeliveryPlanId.value && !deliveryPlans.value.some((item) => item.id === selectedDeliveryPlanId.value)) {
      selectedDeliveryPlanId.value = ''
    }
  } catch (error) {
    console.error('加载授课计划失败', error)
  }
}

const loadBooks = async () => {
  try {
    const data = await listTeachingPlanBooks({ limit: 100 })
    books.value = data.items
    if (selectedBookId.value) {
      const matched = books.value.find((item) => item.id === selectedBookId.value)
      if (matched) {
        applyBookToForm(matched)
      }
    }
  } catch (error) {
    console.error('加载教案册失败', error)
  }
}

const loadLessons = async () => {
  if (!lessonForm.value.bookId) {
    lessons.value = []
    return
  }

  try {
    const data = await listTeachingPlanLessons(lessonForm.value.bookId, { limit: 200 })
    lessons.value = data.items
  } catch (error) {
    console.error('加载单次课教案失败', error)
  }
}

const loadTemplates = async () => {
  try {
    const data = await listTemplates({ limit: 100 })
    templates.value = data.items
  } catch (error) {
    console.error('加载模板失败', error)
  }
}

const loadCoursewareAssets = async () => {
  try {
    const data = await listCoursewareAssets({ limit: 100 })
    coursewareAssets.value = data.items
  } catch (error) {
    console.error('加载课件附件失败', error)
  }
}

const parseCommaSeparatedValues = (value: string): string[] =>
  value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)

const dateInputToIsoUtc = (value: string): string | undefined => {
  const text = value.trim()
  if (!text) {
    return undefined
  }
  return `${text}T00:00:00.000Z`
}

const toOptionalPositiveNumber = (value: string): number | undefined => {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined
  }
  return parsed
}

const buildStandardTemplateContentFromForm = (): StandardTemplateContent => ({
  courseCode: standardForm.value.courseCode,
  department: standardForm.value.department,
  applicableMajors: standardForm.value.applicableMajors,
  majorLabelOne: standardForm.value.majorLabelOne,
  majorLabelTwo: standardForm.value.majorLabelTwo,
  majorLabelThree: standardForm.value.majorLabelThree,
  principal: standardForm.value.principal,
  revisedAt: standardForm.value.revisedAt,
  courseNature: standardForm.value.courseNature,
  courseTask: standardForm.value.courseTask,
  coreLiteracy: standardForm.value.coreLiteracy,
  overallGoal: standardForm.value.overallGoal,
  qualityGoal: standardForm.value.qualityGoal,
  abilityGoal: standardForm.value.abilityGoal,
  knowledgeGoal: standardForm.value.knowledgeGoal,
  moduleStructure: standardForm.value.moduleStructure,
  hoursArrangement: standardForm.value.hoursArrangement,
  moduleContentRequirements: standardForm.value.moduleContentRequirements,
  moduleTeachingTips: standardForm.value.moduleTeachingTips,
  teachingRequirements: standardForm.value.teachingRequirements,
  teachingMethodSuggestions: standardForm.value.teachingMethodSuggestions,
  assessmentRequirements: standardForm.value.assessmentRequirements,
  textbookRequirements: standardForm.value.textbookRequirements,
  resourcesDevelopment: standardForm.value.resourcesDevelopment,
  teacherTeamBuilding: standardForm.value.teacherTeamBuilding,
  facilitiesRequirements: standardForm.value.facilitiesRequirements,
  selectionRemark: standardForm.value.selectionRemark,
  hourRemark: standardForm.value.hourRemark,
  hourTotalMajorOne: standardForm.value.hourTotalMajorOne,
  hourTotalMajorTwo: standardForm.value.hourTotalMajorTwo,
  hourTotalMajorThree: standardForm.value.hourTotalMajorThree,
  selectionSuggestionRows: standardForm.value.selectionSuggestionRows.map((row) => ({ ...row })),
  hourSuggestionRows: standardForm.value.hourSuggestionRows.map((row) => ({ ...row })),
})

const buildDeliveryTemplateMetaFromForm = (): DeliveryTemplateMeta => ({
  academicYearTerm: deliveryForm.value.academicYearTerm,
  teacherName: deliveryForm.value.teacherName,
  className: deliveryForm.value.className,
  theoryHours: deliveryForm.value.theoryHours,
  practiceHours: deliveryForm.value.practiceHours,
  totalHours: deliveryForm.value.totalHours,
  startWeek: deliveryForm.value.startWeek,
  remarks: deliveryForm.value.remarks,
})

const applyStandardTemplateContentToForm = (contentJson: unknown) => {
  const content = normalizeStandardTemplateContent(contentJson)
  standardForm.value.courseCode = content.courseCode
  standardForm.value.department = content.department
  standardForm.value.applicableMajors = content.applicableMajors
  standardForm.value.majorLabelOne = content.majorLabelOne
  standardForm.value.majorLabelTwo = content.majorLabelTwo
  standardForm.value.majorLabelThree = content.majorLabelThree
  standardForm.value.principal = content.principal
  standardForm.value.revisedAt = content.revisedAt
  standardForm.value.courseNature = content.courseNature
  standardForm.value.courseTask = content.courseTask
  standardForm.value.coreLiteracy = content.coreLiteracy
  standardForm.value.overallGoal = content.overallGoal
  standardForm.value.qualityGoal = content.qualityGoal
  standardForm.value.abilityGoal = content.abilityGoal
  standardForm.value.knowledgeGoal = content.knowledgeGoal
  standardForm.value.moduleStructure = content.moduleStructure
  standardForm.value.hoursArrangement = content.hoursArrangement
  standardForm.value.moduleContentRequirements = content.moduleContentRequirements
  standardForm.value.moduleTeachingTips = content.moduleTeachingTips
  standardForm.value.teachingRequirements = content.teachingRequirements
  standardForm.value.teachingMethodSuggestions = content.teachingMethodSuggestions
  standardForm.value.assessmentRequirements = content.assessmentRequirements
  standardForm.value.textbookRequirements = content.textbookRequirements
  standardForm.value.resourcesDevelopment = content.resourcesDevelopment
  standardForm.value.teacherTeamBuilding = content.teacherTeamBuilding
  standardForm.value.facilitiesRequirements = content.facilitiesRequirements
  standardForm.value.selectionRemark = content.selectionRemark
  standardForm.value.hourRemark = content.hourRemark
  standardForm.value.hourTotalMajorOne = content.hourTotalMajorOne
  standardForm.value.hourTotalMajorTwo = content.hourTotalMajorTwo
  standardForm.value.hourTotalMajorThree = content.hourTotalMajorThree
  standardForm.value.selectionSuggestionRows = content.selectionSuggestionRows.map((row) => ({ ...row }))
  standardForm.value.hourSuggestionRows = content.hourSuggestionRows.map((row) => ({ ...row }))
}

const applyDeliveryTemplateMetaToForm = (contentJson: unknown) => {
  const content = normalizeDeliveryTemplateMeta(contentJson)
  deliveryForm.value.academicYearTerm = content.academicYearTerm
  deliveryForm.value.teacherName = content.teacherName
  deliveryForm.value.className = content.className
  deliveryForm.value.theoryHours = content.theoryHours
  deliveryForm.value.practiceHours = content.practiceHours
  deliveryForm.value.totalHours = content.totalHours
  deliveryForm.value.startWeek = content.startWeek
  deliveryForm.value.remarks = content.remarks
}

const handleAddStandardTemplateRow = (kind: 'selection' | 'hours') => {
  if (kind === 'selection') {
    standardForm.value.selectionSuggestionRows = [...standardForm.value.selectionSuggestionRows, createEmptyStandardTemplateRow()]
    return
  }
  standardForm.value.hourSuggestionRows = [...standardForm.value.hourSuggestionRows, createEmptyStandardTemplateRow()]
}

const handleRemoveStandardTemplateRow = (kind: 'selection' | 'hours', index: number) => {
  if (kind === 'selection') {
    if (standardForm.value.selectionSuggestionRows.length <= 1) {
      standardForm.value.selectionSuggestionRows = [createEmptyStandardTemplateRow()]
      return
    }
    standardForm.value.selectionSuggestionRows = standardForm.value.selectionSuggestionRows.filter((_, i) => i !== index)
    return
  }
  if (standardForm.value.hourSuggestionRows.length <= 1) {
    standardForm.value.hourSuggestionRows = [createEmptyStandardTemplateRow()]
    return
  }
  standardForm.value.hourSuggestionRows = standardForm.value.hourSuggestionRows.filter((_, i) => i !== index)
}

const buildCurrentDeliveryWeekDraft = (): DeliveryWeekDraft => ({
  sequenceNo: Math.max(1, Number(deliveryForm.value.sequenceNo) || 1),
  weekNo: Math.max(1, Number(deliveryForm.value.weekNo) || 1),
  hours: Math.max(0, Number(deliveryForm.value.hours) || 0),
  grouping: deliveryForm.value.grouping,
  teachingMode: deliveryForm.value.teachingMode,
  unitOrTask: deliveryForm.value.unitOrTask.trim(),
  ideologicalElements: deliveryForm.value.ideologicalElements,
  integrationMethod: deliveryForm.value.integrationMethod,
  theoreticalPoints: deliveryForm.value.theoreticalPoints,
  practiceProject: deliveryForm.value.practiceProject,
  practiceInstructor: deliveryForm.value.practiceInstructor,
  remarks: deliveryForm.value.weekRemarks,
  linkedStandardTopicIds: [...deliveryForm.value.linkedStandardTopicIds],
})

const clearCurrentDeliveryWeekInputs = () => {
  deliveryForm.value.sequenceNo = String((Number(deliveryForm.value.sequenceNo) || 1) + 1)
  deliveryForm.value.weekNo = String((Number(deliveryForm.value.weekNo) || 1) + 1)
  deliveryForm.value.hours = '4'
  deliveryForm.value.grouping = ''
  deliveryForm.value.teachingMode = ''
  deliveryForm.value.unitOrTask = ''
  deliveryForm.value.ideologicalElements = ''
  deliveryForm.value.integrationMethod = ''
  deliveryForm.value.theoreticalPoints = ''
  deliveryForm.value.practiceProject = ''
  deliveryForm.value.practiceInstructor = ''
  deliveryForm.value.weekRemarks = ''
  deliveryForm.value.linkedStandardTopicIds = []
}

const handleQueueDeliveryWeekDraft = () => {
  const week = buildCurrentDeliveryWeekDraft()
  if (!week.unitOrTask) {
    alert('请先填写“单元或任务”后再加入周次队列')
    return
  }
  const existingIndex = deliveryWeekDrafts.value.findIndex((item) => item.weekNo === week.weekNo)
  if (existingIndex >= 0) {
    deliveryWeekDrafts.value = deliveryWeekDrafts.value.map((item, index) => (index === existingIndex ? week : item))
  } else {
    deliveryWeekDrafts.value = [...deliveryWeekDrafts.value, week].sort((a, b) => a.weekNo - b.weekNo)
  }
  normalizeDeliveryWeekDrafts()
  clearCurrentDeliveryWeekInputs()
}

const handleRemoveDeliveryWeekDraft = (weekNo: number) => {
  deliveryWeekDrafts.value = deliveryWeekDrafts.value.filter((item) => item.weekNo !== weekNo)
  normalizeDeliveryWeekDrafts()
}

const handleEditDeliveryWeekDraft = (weekNo: number) => {
  const target = deliveryWeekDrafts.value.find((item) => item.weekNo === weekNo)
  if (!target) {
    return
  }
  deliveryForm.value.sequenceNo = String(target.sequenceNo)
  deliveryForm.value.weekNo = String(target.weekNo)
  deliveryForm.value.hours = String(target.hours)
  deliveryForm.value.grouping = target.grouping
  deliveryForm.value.teachingMode = target.teachingMode
  deliveryForm.value.unitOrTask = target.unitOrTask
  deliveryForm.value.ideologicalElements = target.ideologicalElements
  deliveryForm.value.integrationMethod = target.integrationMethod
  deliveryForm.value.theoreticalPoints = target.theoreticalPoints
  deliveryForm.value.practiceProject = target.practiceProject
  deliveryForm.value.practiceInstructor = target.practiceInstructor
  deliveryForm.value.weekRemarks = target.remarks
  deliveryForm.value.linkedStandardTopicIds = [...target.linkedStandardTopicIds]
}

const buildStandardRowsFromModules = (
  modules: NonNullable<CourseStandard['modules']> | undefined
): StandardTemplateRow[] => {
  if (!modules || modules.length === 0) {
    return [createEmptyStandardTemplateRow()]
  }
  const rows = modules.flatMap((module) =>
    (module.topics || []).map((topic, index) => ({
      moduleName: module.name || '',
      topicNo: String(index + 1),
      topicName: topic.title || '',
      recommendedHours: topic.recommendedHours !== null && topic.recommendedHours !== undefined ? String(topic.recommendedHours) : '',
      ideologicalElement: (topic.ideologicalElements || []).join('，'),
      integrationMethod: (topic.integrationMethods || []).join('，'),
      majorOne:
        standardForm.value.majorLabelOne && (topic.applicableMajors || []).includes(standardForm.value.majorLabelOne)
          ? '√'
          : '',
      majorTwo:
        standardForm.value.majorLabelTwo && (topic.applicableMajors || []).includes(standardForm.value.majorLabelTwo)
          ? '√'
          : '',
      majorThree:
        standardForm.value.majorLabelThree && (topic.applicableMajors || []).includes(standardForm.value.majorLabelThree)
          ? '√'
          : '',
    }))
  )
  return rows.length > 0 ? rows : [createEmptyStandardTemplateRow()]
}

const hasMajorCellMeaningfulValue = (value: string): boolean => {
  const text = value.trim()
  if (!text) {
    return false
  }
  return !['0', '-', '—', '无', '否', '×'].includes(text)
}

const parseMaxHoursFromMajorCells = (row: StandardTemplateRow): number | undefined => {
  const numbers = [row.majorOne, row.majorTwo, row.majorThree]
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value) && value > 0)
  if (numbers.length === 0) {
    return undefined
  }
  return Math.max(...numbers)
}

const buildStandardModulesFromForm = () => {
  const majorMapping: Array<{ label: string; valueKey: keyof Pick<StandardTemplateRow, 'majorOne' | 'majorTwo' | 'majorThree'> }> = [
    { label: standardForm.value.majorLabelOne.trim(), valueKey: 'majorOne' },
    { label: standardForm.value.majorLabelTwo.trim(), valueKey: 'majorTwo' },
    { label: standardForm.value.majorLabelThree.trim(), valueKey: 'majorThree' },
  ]

  const mergedRows = new Map<
    string,
    {
      moduleName: string
      topicName: string
      recommendedHours: number | undefined
      ideologicalElements: Set<string>
      integrationMethods: Set<string>
      applicableMajors: Set<string>
    }
  >()

  const sourceRows = [...standardForm.value.hourSuggestionRows, ...standardForm.value.selectionSuggestionRows]
  for (const row of sourceRows) {
    const topicName = row.topicName.trim()
    if (!topicName) {
      continue
    }
    const moduleName = row.moduleName.trim() || '模块一'
    const key = `${moduleName}__${topicName}`
    const existing = mergedRows.get(key) || {
      moduleName,
      topicName,
      recommendedHours: undefined,
      ideologicalElements: new Set<string>(),
      integrationMethods: new Set<string>(),
      applicableMajors: new Set<string>(),
    }

    const directHours = toOptionalPositiveNumber(row.recommendedHours)
    const inferredHours = parseMaxHoursFromMajorCells(row)
    if (existing.recommendedHours === undefined) {
      existing.recommendedHours = directHours ?? inferredHours
    } else if (directHours !== undefined) {
      existing.recommendedHours = directHours
    }

    for (const item of parseCommaSeparatedValues(row.ideologicalElement)) {
      existing.ideologicalElements.add(item)
    }
    for (const item of parseCommaSeparatedValues(row.integrationMethod)) {
      existing.integrationMethods.add(item)
    }
    for (const mapping of majorMapping) {
      if (!mapping.label) {
        continue
      }
      const cellValue = row[mapping.valueKey]
      if (hasMajorCellMeaningfulValue(cellValue)) {
        existing.applicableMajors.add(mapping.label)
      }
    }
    mergedRows.set(key, existing)
  }

  if (mergedRows.size === 0) {
    const fallbackTopicName = standardForm.value.topicTitle.trim() || '主题1'
    mergedRows.set(`${standardForm.value.moduleName.trim() || '模块一'}__${fallbackTopicName}`, {
      moduleName: standardForm.value.moduleName.trim() || '模块一',
      topicName: fallbackTopicName,
      recommendedHours: toOptionalPositiveNumber(standardForm.value.topicRecommendedHours),
      ideologicalElements: new Set(parseCommaSeparatedValues(standardForm.value.topicIdeologicalElements)),
      integrationMethods: new Set(parseCommaSeparatedValues(standardForm.value.topicIntegrationMethods)),
      applicableMajors: new Set(parseCommaSeparatedValues(standardForm.value.topicApplicableMajors)),
    })
  }

  const grouped = new Map<
    string,
    Array<{
      topicName: string
      recommendedHours: number | undefined
      ideologicalElements: string[]
      integrationMethods: string[]
      applicableMajors: string[]
    }>
  >()

  for (const row of mergedRows.values()) {
    const list = grouped.get(row.moduleName) || []
    list.push({
      topicName: row.topicName,
      recommendedHours: row.recommendedHours,
      ideologicalElements: Array.from(row.ideologicalElements),
      integrationMethods: Array.from(row.integrationMethods),
      applicableMajors: Array.from(row.applicableMajors),
    })
    grouped.set(row.moduleName, list)
  }

  return Array.from(grouped.entries()).map(([moduleName, topics]) => ({
    name: moduleName,
    topics: topics.map((topic) => ({
      title: topic.topicName,
      recommendedHours: topic.recommendedHours,
      ideologicalElements: topic.ideologicalElements,
      integrationMethods: topic.integrationMethods,
      applicableMajors: topic.applicableMajors,
      objectiveMapping: parseCommaSeparatedValues(standardForm.value.topicObjectiveMapping),
    })),
  }))
}

const applyStandardModulesToForm = (standard: CourseStandard) => {
  if (!standard.modules || standard.modules.length === 0) {
    standardForm.value.moduleName = ''
    standardForm.value.topicTitle = ''
    return
  }
  const firstModule = standard.modules[0]
  const firstTopic = firstModule.topics?.[0]
  standardForm.value.moduleName = firstModule.name || ''
  standardForm.value.topicTitle = firstTopic?.title || ''
  standardForm.value.topicRecommendedHours =
    firstTopic?.recommendedHours !== null && firstTopic?.recommendedHours !== undefined
      ? String(firstTopic.recommendedHours)
      : '8'
  standardForm.value.topicIdeologicalElements = (firstTopic?.ideologicalElements || []).join('，')
  standardForm.value.topicIntegrationMethods = (firstTopic?.integrationMethods || []).join('，')
  standardForm.value.topicApplicableMajors = (firstTopic?.applicableMajors || []).join('，')
  standardForm.value.topicObjectiveMapping = (firstTopic?.objectiveMapping || []).join('，')
  const rowsFromModules = buildStandardRowsFromModules(standard.modules)
  const hasTemplateRows =
    standardForm.value.selectionSuggestionRows.some((row) => Object.values(row).some((field) => field.trim().length > 0))
    || standardForm.value.hourSuggestionRows.some((row) => Object.values(row).some((field) => field.trim().length > 0))
  if (!hasTemplateRows) {
    standardForm.value.selectionSuggestionRows = rowsFromModules.map((row) => ({ ...row }))
    standardForm.value.hourSuggestionRows = rowsFromModules.map((row) => ({ ...row }))
  }
}

const loadStandardForEditing = async (id: string) => {
  if (!id) {
    return
  }
  try {
    const detail = await getCourseStandard(id)
    selectedStandardId.value = detail.id
    standardForm.value.title = detail.title
    standardForm.value.courseId = detail.courseId
    standardForm.value.semesterId = detail.semesterId || ''
    applyStandardTemplateContentToForm(detail.contentJson || {})
    applyStandardModulesToForm(detail)
  } catch (error) {
    alert(extractApiErrorMessage(error, '加载课程标准失败'))
  }
}

const mapDeliveryWeeksToDrafts = (deliveryDetail: DeliveryPlanDetail): DeliveryWeekDraft[] => {
  const weeks = deliveryDetail.weeks || []
  if (weeks.length === 0) {
    return []
  }
  return weeks
    .map((week, index) => ({
      sequenceNo: index + 1,
      weekNo: week.weekNo,
      hours: week.hours,
      grouping: week.grouping || '',
      teachingMode: week.teachingMode || '',
      unitOrTask: week.unitOrTask || '',
      ideologicalElements: week.ideologicalElements || '',
      integrationMethod: week.integrationMethod || '',
      theoreticalPoints: week.theoreticalPoints || '',
      practiceProject: week.practiceProject || '',
      practiceInstructor: week.practiceInstructor || '',
      remarks: week.remarks || '',
      linkedStandardTopicIds: Array.isArray(week.linkedStandardTopicIds) ? [...week.linkedStandardTopicIds] : [],
    }))
    .sort((a, b) => a.weekNo - b.weekNo)
}

const normalizeDeliveryWeekDrafts = () => {
  deliveryWeekDrafts.value = [...deliveryWeekDrafts.value]
    .sort((a, b) => a.weekNo - b.weekNo)
    .map((item, index) => ({
      ...item,
      sequenceNo: index + 1,
    }))
}

const loadDeliveryPlanForEditing = async (id: string) => {
  if (!id) {
    return
  }
  try {
    const detail = await getDeliveryPlan(id)
    selectedDeliveryPlanId.value = detail.id
    deliveryForm.value.title = detail.title
    deliveryForm.value.courseOfferingId = detail.courseOfferingId
    deliveryForm.value.courseStandardId = detail.courseStandardId || ''
    applyDeliveryTemplateMetaToForm(detail.contentJson || {})
    deliveryWeekDrafts.value = mapDeliveryWeeksToDrafts(detail)
    normalizeDeliveryWeekDrafts()
    if (deliveryWeekDrafts.value.length > 0) {
      handleEditDeliveryWeekDraft(deliveryWeekDrafts.value[0].weekNo)
    }
  } catch (error) {
    alert(extractApiErrorMessage(error, '加载授课计划失败'))
  }
}

const resetBookForm = () => {
  bookForm.value = {
    title: '',
    courseOfferingId: '',
    semesterId: '',
    teacherName: authStore.user?.username || '',
    teacherTitle: '',
    teacherUnit: authStore.user?.department || '',
    periodStart: '',
    periodEnd: '',
    totalHours: '64',
    theoryHours: '32',
    practicalHours: '32',
    weeklyHours: '4',
    assessmentMethod: '',
    targetUnit: '',
    targetClass: '',
    researchReview: '',
    deptReview: '',
  }
}

const prepareNewStandard = () => {
  selectedStandardId.value = ''
  const defaults = createDefaultStandardTemplateContent()
  standardForm.value = {
    title: '',
    courseId: '',
    semesterId: '',
    courseCode: '',
    department: '',
    applicableMajors: '',
    majorLabelOne: defaults.majorLabelOne,
    majorLabelTwo: defaults.majorLabelTwo,
    majorLabelThree: defaults.majorLabelThree,
    principal: '',
    revisedAt: '',
    courseNature: '',
    courseTask: '',
    coreLiteracy: '',
    overallGoal: '',
    qualityGoal: '',
    abilityGoal: '',
    knowledgeGoal: '',
    moduleStructure: '',
    hoursArrangement: '',
    moduleContentRequirements: '',
    moduleTeachingTips: '',
    teachingRequirements: '',
    teachingMethodSuggestions: '',
    assessmentRequirements: '',
    textbookRequirements: '',
    resourcesDevelopment: '',
    teacherTeamBuilding: '',
    facilitiesRequirements: '',
    selectionRemark: defaults.selectionRemark,
    hourRemark: defaults.hourRemark,
    hourTotalMajorOne: defaults.hourTotalMajorOne,
    hourTotalMajorTwo: defaults.hourTotalMajorTwo,
    hourTotalMajorThree: defaults.hourTotalMajorThree,
    moduleName: '',
    topicTitle: '',
    topicRecommendedHours: '8',
    topicIdeologicalElements: '工匠精神',
    topicIntegrationMethods: '案例讨论',
    topicApplicableMajors: '软件技术',
    topicObjectiveMapping: '',
    selectionSuggestionRows: defaults.selectionSuggestionRows.map((row) => ({ ...row })),
    hourSuggestionRows: defaults.hourSuggestionRows.map((row) => ({ ...row })),
  }
}

const prepareNewDeliveryPlan = () => {
  selectedDeliveryPlanId.value = ''
  const defaults = createDefaultDeliveryTemplateMeta()
  deliveryForm.value = {
    title: '',
    courseOfferingId: '',
    courseStandardId: '',
    academicYearTerm: defaults.academicYearTerm,
    teacherName: defaults.teacherName,
    className: defaults.className,
    theoryHours: defaults.theoryHours,
    practiceHours: defaults.practiceHours,
    totalHours: defaults.totalHours,
    startWeek: defaults.startWeek,
    remarks: defaults.remarks,
    linkedStandardTopicIds: [],
    sequenceNo: '1',
    weekNo: '1',
    hours: '4',
    grouping: '',
    teachingMode: '',
    unitOrTask: '',
    ideologicalElements: '',
    integrationMethod: '',
    theoreticalPoints: '',
    practiceProject: '',
    practiceInstructor: '',
    weekRemarks: '',
  }
  deliveryWeekDrafts.value = []
}

const prepareNewBook = () => {
  selectedBookId.value = ''
  resetBookForm()
}

const applyBookToForm = (book: TeachingPlanBook) => {
  selectedBookId.value = book.id
  bookForm.value = {
    title: book.title,
    courseOfferingId: book.courseOfferingId,
    semesterId: book.semesterId,
    teacherName: book.teacherName || '',
    teacherTitle: book.teacherTitle || '',
    teacherUnit: book.teacherUnit || '',
    periodStart: book.periodStart ? String(book.periodStart).slice(0, 10) : '',
    periodEnd: book.periodEnd ? String(book.periodEnd).slice(0, 10) : '',
    totalHours: book.totalHours !== null && book.totalHours !== undefined ? String(book.totalHours) : '',
    theoryHours: book.theoryHours !== null && book.theoryHours !== undefined ? String(book.theoryHours) : '',
    practicalHours: book.practicalHours !== null && book.practicalHours !== undefined ? String(book.practicalHours) : '',
    weeklyHours: book.weeklyHours !== null && book.weeklyHours !== undefined ? String(book.weeklyHours) : '',
    assessmentMethod: book.assessmentMethod || '',
    targetUnit: book.targetUnit || '',
    targetClass: book.targetClass || '',
    researchReview: book.researchReview || '',
    deptReview: book.deptReview || '',
  }
}

const extractApiErrorMessage = (error: any, fallback: string): string =>
  error?.response?.data?.message || error?.message || fallback

const pushPublishFailureToTraceability = (message: string) => {
  lastTraceResult.value = {
    passed: false,
    blockers: [message],
    warnings: [],
  }
  activeTab.value = 'traceability'
}

const runPublishPrecheck = async (
  type: 'course-standard' | 'delivery-plan' | 'teaching-plan-lesson',
  id: string
) => {
  const validation = await validateTraceability({ type, id })
  lastTraceResult.value = validation
  activeTab.value = 'traceability'

  if (validation.blockers.length > 0) {
    alert(`发布已阻断：\n${validation.blockers.join('\n')}`)
    return false
  }

  if (validation.warnings.length > 0) {
    const confirmed = window.confirm(
      `映证预检发现 ${validation.warnings.length} 条告警：\n${validation.warnings.join('\n')}\n\n是否继续发布？`
    )
    if (!confirmed) {
      return false
    }
  }

  return true
}

const handleCreateStandard = async () => {
  if (!standardForm.value.title || !standardForm.value.courseId) {
    alert('请填写课程标准标题和课程')
    return
  }

  isCreatingStandard.value = true
  try {
    const standard = await createCourseStandard({
      title: standardForm.value.title,
      courseId: standardForm.value.courseId,
      semesterId: standardForm.value.semesterId || undefined,
      contentJson: buildStandardTemplateContentFromForm(),
      htmlContent: createCourseStandardTemplateHtml(buildStandardTemplateContentFromForm()),
      modules: buildStandardModulesFromForm(),
      status: 'DRAFT',
    })
    selectedStandardId.value = standard.id
    await loadStandards()
    await loadStandardForEditing(standard.id)
    alert('课程标准已创建，可继续补充并保存当前标准。')
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建课程标准失败')
  } finally {
    isCreatingStandard.value = false
  }
}

const handleSaveStandard = async () => {
  if (!selectedStandardId.value) {
    alert('请先新建或选择一个课程标准')
    return
  }

  isSavingStandard.value = true
  try {
    await updateCourseStandard(selectedStandardId.value, {
      title: standardForm.value.title,
      courseId: standardForm.value.courseId,
      semesterId: standardForm.value.semesterId || undefined,
      contentJson: buildStandardTemplateContentFromForm(),
      htmlContent: createCourseStandardTemplateHtml(buildStandardTemplateContentFromForm()),
      modules: buildStandardModulesFromForm(),
      status: 'DRAFT',
    })
    await loadStandards()
    alert('课程标准已保存')
  } catch (error: any) {
    alert(error?.response?.data?.message || '保存课程标准失败')
  } finally {
    isSavingStandard.value = false
  }
}

const handlePublishStandard = async (id: string) => {
  try {
    const ready = await runPublishPrecheck('course-standard', id)
    if (!ready) {
      return
    }
    await publishCourseStandard(id)
    await loadStandards()
  } catch (error: any) {
    const message = extractApiErrorMessage(error, '发布课程标准失败')
    pushPublishFailureToTraceability(message)
    alert(message)
  }
}

const handleCreateDeliveryPlan = async () => {
  if (!deliveryForm.value.title || !deliveryForm.value.courseOfferingId) {
    alert('请填写授课计划标题与开课实例')
    return
  }

  isCreatingDeliveryPlan.value = true
  try {
    const payloadWeeks = deliveryWeekDrafts.value
      .map((week) => ({
        weekNo: week.weekNo,
        hours: week.hours,
        grouping: week.grouping || undefined,
        teachingMode: week.teachingMode || undefined,
        unitOrTask: week.unitOrTask,
        ideologicalElements: week.ideologicalElements || undefined,
        integrationMethod: week.integrationMethod || undefined,
        theoreticalPoints: week.theoreticalPoints || undefined,
        practiceProject: week.practiceProject || undefined,
        practiceInstructor: week.practiceInstructor || undefined,
        remarks: week.remarks || undefined,
        linkedStandardTopicIds: week.linkedStandardTopicIds,
      }))
      .sort((a, b) => a.weekNo - b.weekNo)

    const created = await createDeliveryPlan({
      title: deliveryForm.value.title,
      courseOfferingId: deliveryForm.value.courseOfferingId,
      courseStandardId: deliveryForm.value.courseStandardId || undefined,
      contentJson: buildDeliveryTemplateMetaFromForm(),
      weeks: payloadWeeks.length > 0 ? payloadWeeks : undefined,
      status: 'DRAFT',
    })
    selectedDeliveryPlanId.value = created.id
    await loadDeliveryPlans()
    await loadDeliveryPlanForEditing(created.id)
    alert('授课计划已创建，可继续分批维护周次并同步。')
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建授课计划失败')
  } finally {
    isCreatingDeliveryPlan.value = false
  }
}

const handleSaveDeliveryPlanMeta = async () => {
  if (!selectedDeliveryPlanId.value) {
    alert('请先新建或选择授课计划')
    return
  }
  if (!deliveryForm.value.title || !deliveryForm.value.courseOfferingId) {
    alert('请填写授课计划标题与开课实例')
    return
  }

  isSavingDeliveryMeta.value = true
  try {
    await updateDeliveryPlan(selectedDeliveryPlanId.value, {
      title: deliveryForm.value.title,
      courseOfferingId: deliveryForm.value.courseOfferingId,
      courseStandardId: deliveryForm.value.courseStandardId || undefined,
      contentJson: buildDeliveryTemplateMetaFromForm(),
      status: 'DRAFT',
    })
    await loadDeliveryPlans()
    alert('授课计划表头已保存')
  } catch (error: any) {
    alert(error?.response?.data?.message || '保存授课计划失败')
  } finally {
    isSavingDeliveryMeta.value = false
  }
}

const handleSyncDeliveryWeekDrafts = async () => {
  if (!selectedDeliveryPlanId.value) {
    alert('请先新建或选择授课计划')
    return
  }
  if (deliveryWeekDrafts.value.length === 0) {
    alert('请至少添加 1 条周次后再同步')
    return
  }
  if (deliveryForm.value.courseStandardId) {
    const missingLinks = deliveryWeekDrafts.value.filter((week) => week.linkedStandardTopicIds.length === 0)
    if (missingLinks.length > 0) {
      alert(`已关联课程标准时，每周需至少关联 1 个条目。当前缺失：第 ${missingLinks.map((item) => item.weekNo).join('、')} 周`)
      return
    }
  }

  isSyncingDeliveryWeeks.value = true
  try {
    normalizeDeliveryWeekDrafts()
    await updateDeliveryPlanWeeks(
      selectedDeliveryPlanId.value,
      deliveryWeekDrafts.value.map((week) => ({
        weekNo: week.weekNo,
        hours: week.hours,
        grouping: week.grouping || undefined,
        teachingMode: week.teachingMode || undefined,
        unitOrTask: week.unitOrTask,
        ideologicalElements: week.ideologicalElements || undefined,
        integrationMethod: week.integrationMethod || undefined,
        theoreticalPoints: week.theoreticalPoints || undefined,
        practiceProject: week.practiceProject || undefined,
        practiceInstructor: week.practiceInstructor || undefined,
        remarks: week.remarks || undefined,
        linkedStandardTopicIds: week.linkedStandardTopicIds,
      }))
    )
    await loadDeliveryPlans()
    alert('授课计划周次已同步')
  } catch (error: any) {
    alert(error?.response?.data?.message || '同步授课计划周次失败')
  } finally {
    isSyncingDeliveryWeeks.value = false
  }
}

const handlePublishDeliveryPlan = async (id: string) => {
  try {
    const ready = await runPublishPrecheck('delivery-plan', id)
    if (!ready) {
      return
    }
    await publishDeliveryPlan(id)
    await loadDeliveryPlans()
  } catch (error: any) {
    const message = extractApiErrorMessage(error, '发布授课计划失败')
    pushPublishFailureToTraceability(message)
    alert(message)
  }
}

const handleCreateBook = async () => {
  if (!bookForm.value.title || !bookForm.value.courseOfferingId || !bookForm.value.semesterId) {
    alert('请填写教案册必填项')
    return
  }

  isCreatingBook.value = true
  try {
    const created = await createTeachingPlanBook({
      title: bookForm.value.title,
      courseOfferingId: bookForm.value.courseOfferingId,
      semesterId: bookForm.value.semesterId,
      teacherName: bookForm.value.teacherName || authStore.user?.username || '',
      teacherTitle: bookForm.value.teacherTitle || undefined,
      teacherUnit: bookForm.value.teacherUnit || undefined,
      periodStart: dateInputToIsoUtc(bookForm.value.periodStart),
      periodEnd: dateInputToIsoUtc(bookForm.value.periodEnd),
      totalHours: toOptionalPositiveNumber(bookForm.value.totalHours),
      theoryHours: toOptionalPositiveNumber(bookForm.value.theoryHours),
      practicalHours: toOptionalPositiveNumber(bookForm.value.practicalHours),
      weeklyHours: toOptionalPositiveNumber(bookForm.value.weeklyHours),
      assessmentMethod: bookForm.value.assessmentMethod || undefined,
      targetUnit: bookForm.value.targetUnit || undefined,
      targetClass: bookForm.value.targetClass || undefined,
      researchReview: bookForm.value.researchReview || undefined,
      deptReview: bookForm.value.deptReview || undefined,
      status: 'DRAFT',
    })
    selectedBookId.value = created.id
    await loadBooks()
    const matched = books.value.find((item) => item.id === created.id)
    if (matched) {
      applyBookToForm(matched)
    }
    alert('教案册已创建，可继续补充信息表字段。')
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建教案册失败')
  } finally {
    isCreatingBook.value = false
  }
}

const handleSaveBook = async () => {
  if (!selectedBookId.value) {
    alert('请先新建或选择教案册')
    return
  }
  if (!bookForm.value.title || !bookForm.value.courseOfferingId || !bookForm.value.semesterId) {
    alert('请填写教案册必填项')
    return
  }

  isCreatingBook.value = true
  try {
    await updateTeachingPlanBook(selectedBookId.value, {
      title: bookForm.value.title,
      courseOfferingId: bookForm.value.courseOfferingId,
      semesterId: bookForm.value.semesterId,
      teacherName: bookForm.value.teacherName || undefined,
      teacherTitle: bookForm.value.teacherTitle || undefined,
      teacherUnit: bookForm.value.teacherUnit || undefined,
      periodStart: dateInputToIsoUtc(bookForm.value.periodStart),
      periodEnd: dateInputToIsoUtc(bookForm.value.periodEnd),
      totalHours: toOptionalPositiveNumber(bookForm.value.totalHours),
      theoryHours: toOptionalPositiveNumber(bookForm.value.theoryHours),
      practicalHours: toOptionalPositiveNumber(bookForm.value.practicalHours),
      weeklyHours: toOptionalPositiveNumber(bookForm.value.weeklyHours),
      assessmentMethod: bookForm.value.assessmentMethod || undefined,
      targetUnit: bookForm.value.targetUnit || undefined,
      targetClass: bookForm.value.targetClass || undefined,
      researchReview: bookForm.value.researchReview || undefined,
      deptReview: bookForm.value.deptReview || undefined,
      status: 'DRAFT',
    })
    await loadBooks()
    alert('教案册信息表已保存')
  } catch (error: any) {
    alert(error?.response?.data?.message || '保存教案册失败')
  } finally {
    isCreatingBook.value = false
  }
}

const handleCreateLesson = async () => {
  if (!lessonForm.value.bookId || !lessonForm.value.title) {
    alert('请填写单次课教案必填项')
    return
  }

  isCreatingLesson.value = true
  try {
    await createTeachingPlanLesson({
      bookId: lessonForm.value.bookId,
      lessonNo: Number(lessonForm.value.lessonNo) || 1,
      title: lessonForm.value.title,
      weekNo: Number(lessonForm.value.weekNo) || 1,
      duration: 90,
      objectives: '请补充本次课目标',
      outline: '请补充授课提纲',
      deliveryPlanId: lessonForm.value.deliveryPlanId || undefined,
      ideologicalElements: lessonForm.value.ideologicalElements || '工匠精神',
      integrationMethod: '案例讨论',
      status: 'DRAFT',
    })

    lessonForm.value = {
      bookId: lessonForm.value.bookId,
      lessonNo: String((Number(lessonForm.value.lessonNo) || 1) + 1),
      title: '',
      weekNo: lessonForm.value.weekNo,
      deliveryPlanId: lessonForm.value.deliveryPlanId,
      ideologicalElements: lessonForm.value.ideologicalElements,
    }
    await loadLessons()
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建单次课教案失败')
  } finally {
    isCreatingLesson.value = false
  }
}

const handlePublishLesson = async (id: string) => {
  try {
    const ready = await runPublishPrecheck('teaching-plan-lesson', id)
    if (!ready) {
      return
    }
    await publishTeachingPlanLesson(id)
    await loadLessons()
  } catch (error: any) {
    const message = extractApiErrorMessage(error, '发布单次课教案失败')
    pushPublishFailureToTraceability(message)
    alert(message)
  }
}

const handleCreateTemplate = async () => {
  if (!templateForm.value.name) {
    alert('请填写模板名称')
    return
  }

  isCreatingTemplate.value = true
  try {
    await createTemplateDefinition({
      docType: templateForm.value.docType,
      name: templateForm.value.name,
      scope: templateForm.value.scope,
      description: templateForm.value.description || undefined,
    })

    templateForm.value = {
      docType: 'COURSE_STANDARD',
      name: '',
      scope: 'PERSONAL',
      description: '',
    }
    await loadTemplates()
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建模板失败')
  } finally {
    isCreatingTemplate.value = false
  }
}

const handleCreateCoursewareAsset = async () => {
  if (!coursewareForm.value.title || !coursewareForm.value.fileName || !coursewareForm.value.fileUrl) {
    alert('请填写课件附件必填项')
    return
  }

  isCreatingCourseware.value = true
  try {
    await createCoursewareAsset({
      title: coursewareForm.value.title,
      fileName: coursewareForm.value.fileName,
      fileUrl: coursewareForm.value.fileUrl,
      courseOfferingId: coursewareForm.value.courseOfferingId || undefined,
      chapterRef: coursewareForm.value.chapterRef || undefined,
      ideologicalElements: coursewareForm.value.ideologicalElements
        ? coursewareForm.value.ideologicalElements.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
        : [],
      tags: ['课件'],
    })
    coursewareForm.value = {
      title: '',
      fileName: '',
      fileUrl: '',
      courseOfferingId: '',
      chapterRef: '',
      ideologicalElements: '工匠精神',
    }
    await loadCoursewareAssets()
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建课件附件失败')
  } finally {
    isCreatingCourseware.value = false
  }
}

const handleCreateTemplateVersion = async (templateId: string) => {
  try {
    await createTemplateVersion(templateId, {
      schemaJson: {
        fields: [],
        notes: '请按实际模板结构补充 schema',
      },
      defaultContentJson: {},
      status: 'DRAFT',
    })
    alert('模板新版本已创建')
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建模板版本失败')
  }
}

const handlePublishLatestTemplateVersion = async (templateId: string) => {
  try {
    const versions = await listTemplateVersions(templateId, { limit: 1 })
    const latestVersion = versions.items[0]
    if (!latestVersion) {
      alert('模板暂无版本，请先创建版本')
      return
    }
    await publishTemplateVersion(templateId, latestVersion.id)
    alert(`模板版本 v${latestVersion.version} 已发布`)
  } catch (error: any) {
    alert(error?.response?.data?.message || '发布模板版本失败')
  }
}

const runTraceValidation = async (
  type: 'course-standard' | 'delivery-plan' | 'teaching-plan-lesson',
  id: string
) => {
  try {
    lastTraceResult.value = await validateTraceability({ type, id })
    activeTab.value = 'traceability'
  } catch (error: any) {
    alert(error?.response?.data?.message || '映证校验失败')
  }
}

const openEditorFromLesson = (lessonId: string) => {
  router.push({
    path: `/editor/${lessonId}`,
    query: {
      source: 'lesson',
    },
  })
}

const resolveCourseName = (courseId: string) => courseNameMap.value.get(courseId) || '未知课程'
const resolveSemesterName = (semesterId: string) => semesterNameMap.value.get(semesterId) || '未知学期'
const resolveOfferingName = (offeringId: string) => offeringNameMap.value.get(offeringId) || '未知开课实例'

const documentStatusClass = (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
  if (status === 'PUBLISHED') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'ARCHIVED') {
    return 'border-slate-200 bg-slate-100 text-slate-600'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
