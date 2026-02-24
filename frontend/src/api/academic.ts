import { api } from '../stores/auth'

interface PagedResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const unwrap = <T>(payload: { data?: T; success?: boolean }): T => {
  if (!payload || payload.success === false || payload.data === undefined) {
    throw new Error('接口返回数据异常')
  }
  return payload.data
}

const get = async <T>(url: string, params?: Record<string, string | number | undefined>) => {
  const response = await api.get(url, { params })
  return unwrap<T>(response.data)
}

const post = async <T>(url: string, body?: unknown) => {
  const response = await api.post(url, body)
  return unwrap<T>(response.data)
}

const patch = async <T>(url: string, body?: unknown) => {
  const response = await api.patch(url, body)
  return unwrap<T>(response.data)
}

const del = async <T>(url: string) => {
  const response = await api.delete(url)
  return unwrap<T>(response.data)
}

export interface Semester {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'CLOSED'
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  code: string
  name: string
  department?: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  ownerTeacherId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CourseOffering {
  id: string
  courseId: string
  semesterId: string
  className: string
  teacherId: string
  weeklyHours?: number | null
  totalWeeks?: number | null
  status: 'PLANNING' | 'ACTIVE' | 'CLOSED'
  createdAt: string
  updatedAt: string
}

export interface ManagedUser {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'TEACHER'
  department?: string | null
  createdAt: string
  updatedAt: string
}

export interface CourseStandard {
  id: string
  title: string
  courseId: string
  semesterId?: string | null
  contentJson?: Record<string, unknown> | null
  htmlContent?: string | null
  modules?: Array<{
    id: string
    name: string
    topics: Array<{
      id: string
      title: string
      recommendedHours?: number | null
      ideologicalElements?: string[]
      integrationMethods?: string[]
      applicableMajors?: string[]
      objectiveMapping?: string[]
    }>
  }>
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryPlan {
  id: string
  title: string
  courseOfferingId: string
  courseStandardId?: string | null
  contentJson?: Record<string, unknown> | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface DeliveryPlanWeekDetail {
  id: string
  weekNo: number
  hours: number
  grouping?: string | null
  teachingMode?: string | null
  unitOrTask: string
  ideologicalElements?: string | null
  integrationMethod?: string | null
  theoreticalPoints?: string | null
  practiceProject?: string | null
  practiceInstructor?: string | null
  remarks?: string | null
  linkedStandardTopicIds: string[]
}

export interface CourseStandardTopicDetail {
  id: string
  title: string
}

export interface CourseStandardModuleDetail {
  id: string
  name: string
  topics: CourseStandardTopicDetail[]
}

export interface DeliveryPlanDetail extends DeliveryPlan {
  weeks?: DeliveryPlanWeekDetail[]
  courseStandard?: {
    id: string
    title: string
    modules: CourseStandardModuleDetail[]
  } | null
}

export interface TeachingPlanBook {
  id: string
  title: string
  courseOfferingId: string
  semesterId: string
  teacherName?: string | null
  teacherTitle?: string | null
  teacherUnit?: string | null
  periodStart?: string | null
  periodEnd?: string | null
  totalHours?: number | null
  theoryHours?: number | null
  practicalHours?: number | null
  weeklyHours?: number | null
  assessmentMethod?: string | null
  targetUnit?: string | null
  targetClass?: string | null
  researchReview?: string | null
  deptReview?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface TeachingPlanLesson {
  id: string
  bookId: string
  lessonNo: number
  title: string
  lessonType?: string | null
  className?: string | null
  weekNo?: number | null
  weekday?: string | null
  period?: string | null
  lessonDate?: string | null
  duration?: number | null
  objectives?: string | null
  keyPoints?: string | null
  difficulty?: string | null
  outline?: string | null
  reflection?: string | null
  methods?: string | null
  teachingAids?: string | null
  ideologicalElements?: string | null
  integrationMethod?: string | null
  contentJson?: Record<string, unknown> | null
  deliveryPlanId?: string | null
  deliveryPlanWeekId?: string | null
  courseStandardTopicRefs?: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface TeachingPlanLessonDetail extends TeachingPlanLesson {
  book?: {
    id: string
    title: string
    teacherId: string
    courseOfferingId: string
    semesterId: string
    courseOffering?: {
      id: string
      className: string
      course?: {
        id: string
        name: string
        code: string
      }
    }
  }
}

export interface TemplateDefinition {
  id: string
  docType: 'COURSE_STANDARD' | 'DELIVERY_PLAN' | 'TEACHING_PLAN_BOOK' | 'TEACHING_PLAN_LESSON'
  name: string
  scope: 'ORG' | 'PERSONAL'
  ownerId?: string | null
  createdAt: string
  updatedAt: string
}

export interface TemplateVersion {
  id: string
  templateId: string
  version: number
  status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED'
  createdAt: string
  updatedAt: string
}

export interface LegacyMappingItem {
  id: string
  legacyTeachingPlanId: string
  suggestedCourseOfferingId?: string | null
  suggestedSemesterId?: string | null
  reviewedById?: string | null
  note?: string | null
  legacyTeachingPlan?: {
    id: string
    title: string
    courseName: string
    className: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    updatedAt: string
  } | null
  confidence: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export interface TraceabilityValidationResult {
  passed: boolean
  blockers: string[]
  warnings: string[]
}

export interface CoursewareAsset {
  id: string
  title: string
  fileName: string
  fileUrl: string
  courseOfferingId?: string | null
  deliveryPlanWeekId?: string | null
  teachingPlanLessonId?: string | null
  chapterRef?: string | null
  tags: string[]
  ideologicalElements: string[]
  createdAt: string
  updatedAt: string
}

export const listSemesters = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<Semester>>('/semesters', params)

export const createSemester = (payload: {
  name: string
  startDate: string
  endDate: string
  status?: 'PLANNING' | 'ACTIVE' | 'CLOSED'
}) => post<Semester>('/semesters', payload)

export const updateSemester = (
  id: string,
  payload: Partial<{
    name: string
    startDate: string
    endDate: string
    status: 'PLANNING' | 'ACTIVE' | 'CLOSED'
  }>
) => patch<Semester>(`/semesters/${id}`, payload)

export const activateSemester = (id: string) => post<Semester>(`/semesters/${id}/activate`)
export const closeSemester = (id: string) => post<Semester>(`/semesters/${id}/close`)

export const listCourses = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<Course>>('/courses', params)

export const createCourse = (payload: {
  code: string
  name: string
  department?: string
  ownerTeacherId?: string
  status?: 'ACTIVE' | 'ARCHIVED'
}) => post<Course>('/courses', payload)

export const updateCourse = (
  id: string,
  payload: Partial<{ code: string; name: string; department: string; ownerTeacherId: string; status: 'ACTIVE' | 'ARCHIVED' }>
) => patch<Course>(`/courses/${id}`, payload)

export const deleteCourse = (id: string) => del<{ message?: string }>(`/courses/${id}`)

export const listCourseOfferings = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<CourseOffering>>('/course-offerings', params)

export const createCourseOffering = (payload: {
  courseId: string
  semesterId: string
  className: string
  teacherId: string
  weeklyHours?: number
  totalWeeks?: number
  status?: 'PLANNING' | 'ACTIVE' | 'CLOSED'
}) => post<CourseOffering>('/course-offerings', payload)

export const listUsers = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<ManagedUser>>('/users', params)

export const updateUser = (
  id: string,
  payload: Partial<{ role: 'ADMIN' | 'TEACHER'; department: string; email: string }>
) => patch<ManagedUser>(`/users/${id}`, payload)

export const resetUserPassword = (id: string, newPassword: string) =>
  post<{ message?: string }>(`/users/${id}/reset-password`, { newPassword })

export const listCourseStandards = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<CourseStandard>>('/course-standards', params)

export const createCourseStandard = (payload: Record<string, unknown>) =>
  post<CourseStandard>('/course-standards', payload)

export const getCourseStandard = (id: string) =>
  get<CourseStandard>(`/course-standards/${id}`)

export const updateCourseStandard = (id: string, payload: Record<string, unknown>) =>
  patch<CourseStandard>(`/course-standards/${id}`, payload)

export const publishCourseStandard = (id: string) => post<CourseStandard>(`/course-standards/${id}/publish`)

export const listDeliveryPlans = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<DeliveryPlan>>('/delivery-plans', params)

export const createDeliveryPlan = (payload: Record<string, unknown>) =>
  post<DeliveryPlan>('/delivery-plans', payload)

export const getDeliveryPlan = (id: string) =>
  get<DeliveryPlanDetail>(`/delivery-plans/${id}`)

export const updateDeliveryPlan = (id: string, payload: Record<string, unknown>) =>
  patch<DeliveryPlan>(`/delivery-plans/${id}`, payload)

export const updateDeliveryPlanWeeks = (id: string, weeks: unknown[]) =>
  api.put(`/delivery-plans/${id}/weeks`, { weeks }).then((response) => unwrap<DeliveryPlan>(response.data))

export const publishDeliveryPlan = (id: string) => post<DeliveryPlan>(`/delivery-plans/${id}/publish`)

export const listTeachingPlanBooks = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<TeachingPlanBook>>('/teaching-plan-books', params)

export const createTeachingPlanBook = (payload: Record<string, unknown>) =>
  post<TeachingPlanBook>('/teaching-plan-books', payload)

export const updateTeachingPlanBook = (id: string, payload: Record<string, unknown>) =>
  patch<TeachingPlanBook>(`/teaching-plan-books/${id}`, payload)

export const listTeachingPlanLessons = (bookId: string, params?: Record<string, string | number | undefined>) =>
  get<PagedResult<TeachingPlanLesson>>('/teaching-plan-lessons', { bookId, ...params })

export const createTeachingPlanLesson = (payload: Record<string, unknown>) =>
  post<TeachingPlanLesson>('/teaching-plan-lessons', payload)

export const getTeachingPlanLesson = (id: string) =>
  get<TeachingPlanLessonDetail>(`/teaching-plan-lessons/${id}`)

export const updateTeachingPlanLesson = (id: string, payload: Record<string, unknown>) =>
  patch<TeachingPlanLessonDetail>(`/teaching-plan-lessons/${id}`, payload)

export const publishTeachingPlanLesson = (id: string) =>
  post<TeachingPlanLesson>(`/teaching-plan-lessons/${id}/publish`)

export const listCoursewareAssets = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<CoursewareAsset>>('/courseware-assets', params)

export const createCoursewareAsset = (payload: Record<string, unknown>) =>
  post<CoursewareAsset>('/courseware-assets', payload)

export const updateCoursewareAsset = (id: string, payload: Record<string, unknown>) =>
  patch<CoursewareAsset>(`/courseware-assets/${id}`, payload)

export const deleteCoursewareAsset = (id: string) =>
  del<{ message?: string }>(`/courseware-assets/${id}`)

export const validateTraceability = (payload: { type: 'course-standard' | 'delivery-plan' | 'teaching-plan-lesson'; id: string }) =>
  post<TraceabilityValidationResult>('/traceability/validate', payload)

export const listTemplates = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<TemplateDefinition>>('/templates', params)

export const createTemplateDefinition = (payload: {
  docType: 'COURSE_STANDARD' | 'DELIVERY_PLAN' | 'TEACHING_PLAN_BOOK' | 'TEACHING_PLAN_LESSON'
  name: string
  scope?: 'ORG' | 'PERSONAL'
  description?: string
}) => post<TemplateDefinition>('/templates', payload)

export const listTemplateVersions = (templateId: string, params?: Record<string, string | number | undefined>) =>
  get<PagedResult<TemplateVersion>>(`/templates/${templateId}/versions`, params)

export const createTemplateVersion = (
  templateId: string,
  payload: { schemaJson: unknown; defaultContentJson?: unknown; status?: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' }
) => post<TemplateVersion>(`/templates/${templateId}/versions`, payload)

export const publishTemplateVersion = (templateId: string, versionId: string) =>
  post<TemplateVersion>(`/templates/${templateId}/publish-version`, { versionId })

export const listLegacyMappings = (params?: Record<string, string | number | undefined>) =>
  get<PagedResult<LegacyMappingItem>>('/migration/legacy-mappings', params)

export const generateLegacyMappings = () => post<{ created: number }>('/migration/legacy-mappings/generate')

export const confirmLegacyMapping = (
  id: string,
  payload: Partial<{ courseOfferingId: string; semesterId: string; note: string }>
) => post<LegacyMappingItem>(`/migration/legacy-mappings/${id}/confirm`, payload)

export const rejectLegacyMapping = (id: string, note?: string) =>
  post<LegacyMappingItem>(`/migration/legacy-mappings/${id}/reject`, { note })
