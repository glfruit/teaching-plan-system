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
        super-title="Admin"
        title="教学主数据与用户管理"
        subtitle="管理学期、课程、开课实例、用户，以及历史迁移队列"
      />

      <BaseCard v-if="!authStore.isAdmin" class="mt-8" padding="lg">
        <p class="text-sm text-slate-600">当前账号不是管理员，无法访问管理中心。</p>
      </BaseCard>

      <template v-else>
        <section class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
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

        <section v-if="activeTab === 'semesters'" class="mt-6 space-y-5">
          <BaseCard padding="lg">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold font-serif text-slate-900">学期管理</h2>
              <BaseButton variant="secondary" @click="loadSemesters">刷新</BaseButton>
            </div>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <BaseInput v-model="semesterForm.name" label="学期名称" placeholder="例如：2026-2027学年第1学期" />
              <BaseInput v-model="semesterForm.startDate" label="开始日期" type="date" />
              <BaseInput v-model="semesterForm.endDate" label="结束日期" type="date" />
              <div class="flex items-end">
                <BaseButton full-width :loading="isCreatingSemester" @click="handleCreateSemester">新建学期</BaseButton>
              </div>
            </div>
          </BaseCard>

          <BaseCard padding="none" class="overflow-hidden">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3">名称</th>
                  <th class="text-left px-4 py-3">时间</th>
                  <th class="text-left px-4 py-3">状态</th>
                  <th class="text-right px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="semester in semesters" :key="semester.id" class="border-t border-slate-200">
                  <td class="px-4 py-3 text-slate-800">{{ semester.name }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ formatDate(semester.startDate) }} - {{ formatDate(semester.endDate) }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded border px-2 py-0.5 text-xs" :class="semesterStatusClass(semester.status)">{{ semester.status }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <BaseButton size="sm" variant="secondary" @click="activateSemester(semester.id)">激活</BaseButton>
                      <BaseButton size="sm" variant="secondary" @click="closeSemester(semester.id)">关闭</BaseButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="semesters.length === 0">
                  <td colspan="4" class="px-4 py-10 text-center text-slate-400">暂无学期数据</td>
                </tr>
              </tbody>
            </table>
          </BaseCard>
        </section>

        <section v-else-if="activeTab === 'courses'" class="mt-6 space-y-5">
          <BaseCard padding="lg">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold font-serif text-slate-900">课程与开课实例</h2>
              <BaseButton variant="secondary" @click="loadCoursesAndOfferings">刷新</BaseButton>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
              <BaseInput v-model="courseForm.code" label="课程代码" placeholder="例如 ACAD-101" />
              <BaseInput v-model="courseForm.name" label="课程名称" placeholder="例如 课程标准与教案实践" />
              <BaseInput v-model="courseForm.department" label="开课部门" placeholder="例如 信息工程学院" />
              <BaseInput v-model="courseForm.ownerTeacherId" label="负责人ID" placeholder="教师用户ID" />
              <div class="flex items-end">
                <BaseButton full-width :loading="isCreatingCourse" @click="handleCreateCourse">新建课程</BaseButton>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 md:grid-cols-6 gap-3">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">课程</label>
                <select v-model="offeringForm.courseId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                  <option value="">请选择课程</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.code }} · {{ course.name }}</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">学期</label>
                <select v-model="offeringForm.semesterId" class="w-full min-h-[44px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
                  <option value="">请选择学期</option>
                  <option v-for="semester in semesters" :key="semester.id" :value="semester.id">{{ semester.name }}</option>
                </select>
              </div>
              <BaseInput v-model="offeringForm.className" label="授课班级" placeholder="例如 信息工程2401班" />
              <BaseInput v-model="offeringForm.teacherId" label="任课教师ID" placeholder="教师用户ID" />
              <BaseInput v-model="offeringForm.weeklyHours" type="number" label="周学时" placeholder="4" />
              <div class="flex items-end">
                <BaseButton full-width :loading="isCreatingOffering" @click="handleCreateOffering">新建开课</BaseButton>
              </div>
            </div>
          </BaseCard>

          <BaseCard padding="none" class="overflow-hidden">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3">课程</th>
                  <th class="text-left px-4 py-3">状态</th>
                  <th class="text-left px-4 py-3">开课实例</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in courses" :key="course.id" class="border-t border-slate-200 align-top">
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-800">{{ course.code }} · {{ course.name }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ course.department || '未设置部门' }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <span class="rounded border px-2 py-0.5 text-xs" :class="course.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'">
                      {{ course.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <ul class="space-y-1 text-xs text-slate-600">
                      <li
                        v-for="offering in offeringsByCourse(course.id)"
                        :key="offering.id"
                        class="rounded border border-slate-200 bg-slate-50 px-2 py-1"
                      >
                        <div class="flex flex-wrap items-center justify-between gap-2">
                          <span>{{ offering.className }} · {{ resolveSemesterName(offering.semesterId) }} · {{ offering.status }}</span>
                          <button
                            type="button"
                            class="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-100"
                            @click="openWorkbenchForOffering(offering.id)"
                          >
                            进入链路
                          </button>
                        </div>
                      </li>
                      <li v-if="offeringsByCourse(course.id).length === 0" class="text-slate-400">暂无开课实例</li>
                    </ul>
                  </td>
                </tr>
                <tr v-if="courses.length === 0">
                  <td colspan="3" class="px-4 py-10 text-center text-slate-400">暂无课程数据</td>
                </tr>
              </tbody>
            </table>
          </BaseCard>
        </section>

        <section v-else-if="activeTab === 'users'" class="mt-6 space-y-5">
          <BaseCard padding="lg">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold font-serif text-slate-900">用户管理</h2>
              <BaseButton variant="secondary" @click="loadUsers">刷新</BaseButton>
            </div>
          </BaseCard>

          <BaseCard padding="none" class="overflow-hidden">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3">用户名</th>
                  <th class="text-left px-4 py-3">邮箱</th>
                  <th class="text-left px-4 py-3">角色</th>
                  <th class="text-left px-4 py-3">部门</th>
                  <th class="text-right px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="managedUser in users" :key="managedUser.id" class="border-t border-slate-200">
                  <td class="px-4 py-3 text-slate-800">{{ managedUser.username }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ managedUser.email }}</td>
                  <td class="px-4 py-3">
                    <select
                      class="min-h-[36px] rounded border border-slate-300 bg-white px-2 text-xs"
                      :value="managedUser.role"
                      @change="handleUpdateUserRole(managedUser.id, ($event.target as HTMLSelectElement).value as 'ADMIN' | 'TEACHER')"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="TEACHER">TEACHER</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-slate-500">{{ managedUser.department || '-' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <BaseButton size="sm" variant="secondary" @click="handleResetPassword(managedUser.id)">重置密码</BaseButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="5" class="px-4 py-10 text-center text-slate-400">暂无用户</td>
                </tr>
              </tbody>
            </table>
          </BaseCard>
        </section>

        <section v-else class="mt-6 space-y-5">
          <BaseCard padding="lg">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold font-serif text-slate-900">历史教案迁移队列</h2>
              <div class="flex items-center gap-2">
                <select
                  v-model="mappingStatusFilter"
                  class="min-h-[40px] rounded border border-slate-300 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="ALL">全部状态</option>
                  <option value="PENDING">待确认</option>
                  <option value="CONFIRMED">已确认</option>
                  <option value="REJECTED">已驳回</option>
                </select>
                <BaseButton variant="secondary" @click="loadMappings">刷新</BaseButton>
                <BaseButton :loading="isGeneratingMappings" @click="handleGenerateMappings">自动生成待确认队列</BaseButton>
              </div>
            </div>
          </BaseCard>

          <BaseCard padding="none" class="overflow-hidden">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3">旧教案ID</th>
                  <th class="text-left px-4 py-3">建议映射</th>
                  <th class="text-left px-4 py-3">匹配置信度</th>
                  <th class="text-left px-4 py-3">状态</th>
                  <th class="text-left px-4 py-3">人工确认参数</th>
                  <th class="text-right px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mapping in mappings" :key="mapping.id" class="border-t border-slate-200">
                  <td class="px-4 py-3 text-slate-500">
                    <p>{{ mapping.legacyTeachingPlanId }}</p>
                    <p class="mt-1 text-slate-700">{{ mapping.legacyTeachingPlan?.title || '-' }}</p>
                    <p class="text-xs text-slate-400">
                      {{ mapping.legacyTeachingPlan?.courseName || '-' }} · {{ mapping.legacyTeachingPlan?.className || '-' }}
                    </p>
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    <p>开课：{{ resolveOfferingName(mapping.suggestedCourseOfferingId) }}</p>
                    <p class="mt-1">学期：{{ resolveSemesterName(mapping.suggestedSemesterId) }}</p>
                  </td>
                  <td class="px-4 py-3 text-slate-800">{{ (mapping.confidence * 100).toFixed(1) }}%</td>
                  <td class="px-4 py-3">
                    <span class="rounded border px-2 py-0.5 text-xs" :class="mappingStatusClass(mapping.status)">{{ mapping.status }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="grid grid-cols-1 gap-2">
                      <select
                        :value="getMappingDraft(mapping.id).courseOfferingId"
                        class="min-h-[36px] rounded border border-slate-300 bg-white px-2 text-xs"
                        @change="setMappingDraftCourseOffering(mapping.id, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="">使用建议开课实例</option>
                        <option
                          v-for="offering in offerings"
                          :key="`mapping-offering-${mapping.id}-${offering.id}`"
                          :value="offering.id"
                        >
                          {{ resolveOfferingName(offering.id) }}
                        </option>
                      </select>
                      <select
                        :value="getMappingDraft(mapping.id).semesterId"
                        class="min-h-[36px] rounded border border-slate-300 bg-white px-2 text-xs"
                        @change="setMappingDraftSemester(mapping.id, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="">使用建议学期</option>
                        <option
                          v-for="semester in semesters"
                          :key="`mapping-semester-${mapping.id}-${semester.id}`"
                          :value="semester.id"
                        >
                          {{ semester.name }}
                        </option>
                      </select>
                      <input
                        :value="getMappingDraft(mapping.id).note"
                        type="text"
                        class="min-h-[36px] rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
                        placeholder="备注（可选）"
                        @input="setMappingDraftNote(mapping.id, ($event.target as HTMLInputElement).value)"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-2">
                      <BaseButton size="sm" variant="secondary" @click="confirmMapping(mapping)">确认</BaseButton>
                      <BaseButton size="sm" variant="secondary" @click="rejectMapping(mapping)">驳回</BaseButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="mappings.length === 0">
                  <td colspan="6" class="px-4 py-10 text-center text-slate-400">暂无迁移队列数据</td>
                </tr>
              </tbody>
            </table>
          </BaseCard>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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
  type ManagedUser,
  type LegacyMappingItem,
  listSemesters,
  createSemester,
  activateSemester as activateSemesterApi,
  closeSemester as closeSemesterApi,
  listCourses,
  createCourse,
  listCourseOfferings,
  createCourseOffering,
  listUsers,
  updateUser,
  resetUserPassword,
  listLegacyMappings,
  generateLegacyMappings,
  confirmLegacyMapping,
  rejectLegacyMapping,
} from '../api/academic'

const router = useRouter()
const authStore = useAuthStore()

const tabs = [
  { id: 'semesters', label: '学期管理' },
  { id: 'courses', label: '课程管理' },
  { id: 'users', label: '用户管理' },
  { id: 'migration', label: '迁移队列' },
] as const

type TabId = (typeof tabs)[number]['id']

const activeTab = ref<TabId>('semesters')

const semesters = ref<Semester[]>([])
const courses = ref<Course[]>([])
const offerings = ref<CourseOffering[]>([])
const users = ref<ManagedUser[]>([])
const mappings = ref<LegacyMappingItem[]>([])
const mappingStatusFilter = ref<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL')

const isCreatingSemester = ref(false)
const isCreatingCourse = ref(false)
const isCreatingOffering = ref(false)
const isGeneratingMappings = ref(false)

interface MappingDraft {
  courseOfferingId: string
  semesterId: string
  note: string
}

const mappingDrafts = ref<Record<string, MappingDraft>>({})

const semesterForm = ref({
  name: '',
  startDate: '',
  endDate: '',
})

const courseForm = ref({
  code: '',
  name: '',
  department: '',
  ownerTeacherId: '',
})

const offeringForm = ref({
  courseId: '',
  semesterId: '',
  className: '',
  teacherId: '',
  weeklyHours: '',
})

const semesterNameMap = computed(() => new Map(semesters.value.map((semester) => [semester.id, semester.name])))
const offeringNameMap = computed(
  () =>
    new Map(
      offerings.value.map((offering) => [
        offering.id,
        `${offering.className} · ${semesterNameMap.value.get(offering.semesterId) || '未知学期'}`,
      ])
    )
)

onMounted(async () => {
  await Promise.all([loadSemesters(), loadCoursesAndOfferings(), loadUsers(), loadMappings()])
})

watch(mappingStatusFilter, async () => {
  await loadMappings()
})

const loadSemesters = async () => {
  try {
    const data = await listSemesters({ limit: 100 })
    semesters.value = data.items
  } catch (error) {
    console.error('加载学期失败', error)
  }
}

const loadCoursesAndOfferings = async () => {
  try {
    const [courseData, offeringData] = await Promise.all([listCourses({ limit: 100 }), listCourseOfferings({ limit: 200 })])
    courses.value = courseData.items
    offerings.value = offeringData.items
  } catch (error) {
    console.error('加载课程失败', error)
  }
}

const loadUsers = async () => {
  try {
    const data = await listUsers({ limit: 100 })
    users.value = data.items
  } catch (error) {
    console.error('加载用户失败', error)
  }
}

const loadMappings = async () => {
  try {
    const data = await listLegacyMappings({
      limit: 100,
      status: mappingStatusFilter.value === 'ALL' ? undefined : mappingStatusFilter.value,
    })
    mappings.value = data.items
    syncMappingDrafts(data.items)
  } catch (error) {
    console.error('加载迁移队列失败', error)
  }
}

const syncMappingDrafts = (items: LegacyMappingItem[]) => {
  const nextDrafts: Record<string, MappingDraft> = {}
  for (const mapping of items) {
    const currentDraft = mappingDrafts.value[mapping.id]
    nextDrafts[mapping.id] = {
      courseOfferingId: currentDraft?.courseOfferingId || '',
      semesterId: currentDraft?.semesterId || '',
      note: currentDraft?.note || mapping.note || '',
    }
  }
  mappingDrafts.value = nextDrafts
}

const getMappingDraft = (mappingId: string): MappingDraft => {
  const existingDraft = mappingDrafts.value[mappingId]
  if (existingDraft) {
    return existingDraft
  }

  const mapping = mappings.value.find((item) => item.id === mappingId)
  const fallbackDraft: MappingDraft = {
    courseOfferingId: '',
    semesterId: '',
    note: mapping?.note || '',
  }
  mappingDrafts.value[mappingId] = fallbackDraft
  return fallbackDraft
}

const setMappingDraftCourseOffering = (mappingId: string, courseOfferingId: string) => {
  const draft = getMappingDraft(mappingId)
  mappingDrafts.value[mappingId] = {
    ...draft,
    courseOfferingId,
  }
}

const setMappingDraftSemester = (mappingId: string, semesterId: string) => {
  const draft = getMappingDraft(mappingId)
  mappingDrafts.value[mappingId] = {
    ...draft,
    semesterId,
  }
}

const setMappingDraftNote = (mappingId: string, note: string) => {
  const draft = getMappingDraft(mappingId)
  mappingDrafts.value[mappingId] = {
    ...draft,
    note,
  }
}

const handleCreateSemester = async () => {
  if (!semesterForm.value.name || !semesterForm.value.startDate || !semesterForm.value.endDate) {
    alert('请填写完整学期信息')
    return
  }

  isCreatingSemester.value = true
  try {
    await createSemester({
      name: semesterForm.value.name,
      startDate: new Date(semesterForm.value.startDate).toISOString(),
      endDate: new Date(semesterForm.value.endDate).toISOString(),
      status: 'PLANNING',
    })
    semesterForm.value = { name: '', startDate: '', endDate: '' }
    await loadSemesters()
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建学期失败')
  } finally {
    isCreatingSemester.value = false
  }
}

const activateSemester = async (id: string) => {
  try {
    await activateSemesterApi(id)
    await loadSemesters()
  } catch (error: any) {
    alert(error?.response?.data?.message || '激活学期失败')
  }
}

const closeSemester = async (id: string) => {
  try {
    await closeSemesterApi(id)
    await loadSemesters()
  } catch (error: any) {
    alert(error?.response?.data?.message || '关闭学期失败')
  }
}

const handleCreateCourse = async () => {
  if (!courseForm.value.code || !courseForm.value.name) {
    alert('请填写课程代码和课程名称')
    return
  }

  isCreatingCourse.value = true
  try {
    await createCourse({
      code: courseForm.value.code,
      name: courseForm.value.name,
      department: courseForm.value.department || undefined,
      ownerTeacherId: courseForm.value.ownerTeacherId || undefined,
      status: 'ACTIVE',
    })
    courseForm.value = {
      code: '',
      name: '',
      department: '',
      ownerTeacherId: '',
    }
    await loadCoursesAndOfferings()
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建课程失败')
  } finally {
    isCreatingCourse.value = false
  }
}

const handleCreateOffering = async () => {
  if (!offeringForm.value.courseId || !offeringForm.value.semesterId || !offeringForm.value.className || !offeringForm.value.teacherId) {
    alert('请填写开课实例必填项')
    return
  }

  isCreatingOffering.value = true
  try {
    await createCourseOffering({
      courseId: offeringForm.value.courseId,
      semesterId: offeringForm.value.semesterId,
      className: offeringForm.value.className,
      teacherId: offeringForm.value.teacherId,
      weeklyHours: offeringForm.value.weeklyHours ? Number(offeringForm.value.weeklyHours) : undefined,
      status: 'ACTIVE',
    })
    offeringForm.value = {
      courseId: '',
      semesterId: '',
      className: '',
      teacherId: '',
      weeklyHours: '',
    }
    await loadCoursesAndOfferings()
  } catch (error: any) {
    alert(error?.response?.data?.message || '创建开课实例失败')
  } finally {
    isCreatingOffering.value = false
  }
}

const handleUpdateUserRole = async (id: string, role: 'ADMIN' | 'TEACHER') => {
  try {
    await updateUser(id, { role })
    await loadUsers()
  } catch (error: any) {
    alert(error?.response?.data?.message || '更新用户角色失败')
  }
}

const handleResetPassword = async (id: string) => {
  const password = prompt('请输入新密码（至少6位）', '123456')
  if (!password) {
    return
  }

  try {
    await resetUserPassword(id, password)
    alert('密码重置成功')
  } catch (error: any) {
    alert(error?.response?.data?.message || '密码重置失败')
  }
}

const handleGenerateMappings = async () => {
  isGeneratingMappings.value = true
  try {
    const result = await generateLegacyMappings()
    alert(`已生成 ${result.created} 条待确认映射`) 
    await loadMappings()
  } catch (error: any) {
    alert(error?.response?.data?.message || '生成迁移队列失败')
  } finally {
    isGeneratingMappings.value = false
  }
}

const confirmMapping = async (mapping: LegacyMappingItem) => {
  const draft = getMappingDraft(mapping.id)
  const hasResolvedOffering = Boolean(draft.courseOfferingId || mapping.suggestedCourseOfferingId)
  if (!hasResolvedOffering) {
    alert('请为该迁移项指定开课实例')
    return
  }

  try {
    await confirmLegacyMapping(mapping.id, {
      courseOfferingId: draft.courseOfferingId || undefined,
      semesterId: draft.semesterId || undefined,
      note: draft.note || undefined,
    })
    await loadMappings()
  } catch (error: any) {
    alert(error?.response?.data?.message || '确认映射失败')
  }
}

const rejectMapping = async (mapping: LegacyMappingItem) => {
  const draft = getMappingDraft(mapping.id)
  try {
    await rejectLegacyMapping(mapping.id, draft.note || undefined)
    await loadMappings()
  } catch (error: any) {
    alert(error?.response?.data?.message || '驳回映射失败')
  }
}

const offeringsByCourse = (courseId: string) => offerings.value.filter((item) => item.courseId === courseId)

const resolveSemesterName = (semesterId?: string | null) => {
  if (!semesterId) {
    return '未匹配'
  }
  return semesterNameMap.value.get(semesterId) || '未知学期'
}

const resolveOfferingName = (offeringId?: string | null) => {
  if (!offeringId) {
    return '未匹配'
  }
  return offeringNameMap.value.get(offeringId) || '未知开课实例'
}

const openWorkbenchForOffering = (offeringId: string) => {
  router.push({
    path: '/workbench',
    query: {
      tab: 'delivery',
      source: 'admin-offering',
      courseOfferingId: offeringId,
    },
  })
}

const semesterStatusClass = (status: Semester['status']) => {
  if (status === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'CLOSED') {
    return 'border-slate-200 bg-slate-100 text-slate-600'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

const mappingStatusClass = (status: LegacyMappingItem['status']) => {
  if (status === 'CONFIRMED') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'REJECTED') {
    return 'border-red-200 bg-red-50 text-red-600'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
