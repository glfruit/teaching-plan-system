import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { authMiddleware, requireAuth } from '../middleware/auth'
import { hashPassword } from '../lib/auth'
import type {
  AcademicDocumentStatus,
  LegacyMappingStatus,
  Prisma,
  TemplateDocType,
  TemplateScope,
  TemplateStatus,
  TraceLinkType,
} from '@prisma/client'

const PAGINATION_MAX_LIMIT = 100

const parsePagination = (query: Record<string, unknown> | undefined) => {
  const page = Math.max(1, Number(query?.page || 1) || 1)
  const limit = Math.min(PAGINATION_MAX_LIMIT, Math.max(1, Number(query?.limit || 20) || 20))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const ensureAdmin = (role: string | undefined, set: { status?: number | string }) => {
  if (role !== 'ADMIN') {
    set.status = 403
    throw new Error('Forbidden: admin access required')
  }
}

const toOptionalTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const toUniqueStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
  )
}

const isDocumentStatus = (value: unknown): value is AcademicDocumentStatus =>
  value === 'DRAFT' || value === 'PUBLISHED' || value === 'ARCHIVED'

const normalizeDocumentStatus = (value: unknown, fallback: AcademicDocumentStatus = 'DRAFT'): AcademicDocumentStatus =>
  isDocumentStatus(value) ? value : fallback

const isTemplateScope = (value: unknown): value is TemplateScope => value === 'ORG' || value === 'PERSONAL'
const normalizeTemplateScope = (value: unknown, fallback: TemplateScope = 'PERSONAL'): TemplateScope =>
  isTemplateScope(value) ? value : fallback

const isTemplateStatus = (value: unknown): value is TemplateStatus =>
  value === 'DRAFT' || value === 'PUBLISHED' || value === 'DEPRECATED'
const normalizeTemplateStatus = (value: unknown, fallback: TemplateStatus = 'DRAFT'): TemplateStatus =>
  isTemplateStatus(value) ? value : fallback

const isTemplateDocType = (value: unknown): value is TemplateDocType =>
  value === 'COURSE_STANDARD' || value === 'DELIVERY_PLAN' || value === 'TEACHING_PLAN_BOOK' || value === 'TEACHING_PLAN_LESSON'
const normalizeTemplateDocType = (value: unknown): TemplateDocType => {
  if (isTemplateDocType(value)) {
    return value
  }
  throw new Error('Invalid template doc type')
}

const isTraceLinkType = (value: unknown): value is TraceLinkType =>
  value === 'STANDARD_TO_DELIVERY' || value === 'DELIVERY_TO_LESSON' || value === 'LESSON_TO_COURSEWARE'
const normalizeTraceLinkType = (value: unknown): TraceLinkType => {
  if (isTraceLinkType(value)) {
    return value
  }
  throw new Error('Invalid trace link type')
}

const isLegacyMappingStatus = (value: unknown): value is LegacyMappingStatus =>
  value === 'PENDING' || value === 'CONFIRMED' || value === 'REJECTED'
const normalizeLegacyMappingStatus = (value: unknown, fallback: LegacyMappingStatus = 'PENDING'): LegacyMappingStatus =>
  isLegacyMappingStatus(value) ? value : fallback

interface CourseStandardModuleInput {
  name: string
  description?: string
  sortOrder?: number
  topics?: Array<{
    topicCode?: string
    title: string
    recommendedHours?: number
    ideologicalElements?: string[]
    integrationMethods?: string[]
    objectiveMapping?: string[]
    applicableMajors?: string[]
    sortOrder?: number
  }>
}

const mapCourseStandardModules = (
  modules: CourseStandardModuleInput[] | undefined
): Prisma.CourseStandardModuleCreateWithoutStandardInput[] | undefined => {
  if (!modules || modules.length === 0) {
    return undefined
  }

  return modules
    .filter((module) => typeof module?.name === 'string' && module.name.trim().length > 0)
    .map((module, moduleIndex) => ({
      name: module.name.trim(),
      description: toOptionalTrimmedString(module.description),
      sortOrder: Number.isFinite(module.sortOrder) ? Math.round(module.sortOrder as number) : moduleIndex,
      topics:
        module.topics && module.topics.length > 0
          ? {
              create: module.topics
                .filter((topic) => typeof topic?.title === 'string' && topic.title.trim().length > 0)
                .map((topic, topicIndex) => ({
                  topicCode: toOptionalTrimmedString(topic.topicCode),
                  title: topic.title.trim(),
                  recommendedHours:
                    Number.isFinite(topic.recommendedHours) && Number(topic.recommendedHours) >= 0
                      ? Math.round(Number(topic.recommendedHours))
                      : null,
                  ideologicalElements: toUniqueStringArray(topic.ideologicalElements),
                  integrationMethods: toUniqueStringArray(topic.integrationMethods),
                  objectiveMapping: toUniqueStringArray(topic.objectiveMapping),
                  applicableMajors: toUniqueStringArray(topic.applicableMajors),
                  sortOrder: Number.isFinite(topic.sortOrder) ? Math.round(Number(topic.sortOrder)) : topicIndex,
                })),
            }
          : undefined,
    }))
}

interface DeliveryPlanWeekInput {
  weekNo: number
  hours: number
  grouping?: string
  teachingMode?: string
  unitOrTask: string
  ideologicalElements?: string
  integrationMethod?: string
  theoreticalPoints?: string
  practiceProject?: string
  practiceInstructor?: string
  remarks?: string
  linkedStandardTopicIds?: string[]
}

const mapDeliveryPlanWeeks = (
  weeks: DeliveryPlanWeekInput[] | undefined
): Prisma.DeliveryPlanWeekCreateWithoutDeliveryPlanInput[] | undefined => {
  if (!weeks || weeks.length === 0) {
    return undefined
  }

  return weeks
    .filter(
      (week) =>
        Number.isFinite(week?.weekNo) &&
        Number(week.weekNo) > 0 &&
        Number.isFinite(week?.hours) &&
        Number(week.hours) >= 0 &&
        typeof week?.unitOrTask === 'string' &&
        week.unitOrTask.trim().length > 0
    )
    .map((week) => ({
      weekNo: Math.round(Number(week.weekNo)),
      hours: Math.round(Number(week.hours)),
      grouping: toOptionalTrimmedString(week.grouping),
      teachingMode: toOptionalTrimmedString(week.teachingMode),
      unitOrTask: week.unitOrTask.trim(),
      ideologicalElements: toOptionalTrimmedString(week.ideologicalElements),
      integrationMethod: toOptionalTrimmedString(week.integrationMethod),
      theoreticalPoints: toOptionalTrimmedString(week.theoreticalPoints),
      practiceProject: toOptionalTrimmedString(week.practiceProject),
      practiceInstructor: toOptionalTrimmedString(week.practiceInstructor),
      remarks: toOptionalTrimmedString(week.remarks),
      linkedStandardTopicIds: toUniqueStringArray(week.linkedStandardTopicIds),
    }))
}

const semanticTextIncludes = (a: string, b: string): boolean => {
  const aa = a.trim()
  const bb = b.trim()
  if (!aa || !bb) {
    return false
  }
  return aa.includes(bb) || bb.includes(aa)
}

const dedupeNonEmptyStrings = (values: string[]): string[] =>
  Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  )

interface TopicIdeologicalMapping {
  ideologicalElements: string[]
  integrationMethods: string[]
}

const buildTopicIdeologicalMappings = (
  modules: Array<{ topics: Array<{ id: string; ideologicalElements: string[]; integrationMethods: string[] }> }>
): Map<string, TopicIdeologicalMapping> => {
  const mapping = new Map<string, TopicIdeologicalMapping>()
  for (const module of modules) {
    for (const topic of module.topics) {
      mapping.set(topic.id, {
        ideologicalElements: dedupeNonEmptyStrings(topic.ideologicalElements),
        integrationMethods: dedupeNonEmptyStrings(topic.integrationMethods),
      })
    }
  }
  return mapping
}

const computeDeliveryIdeologicalRatio = (weeks: Array<{ hours: number; ideologicalElements: string | null }>) => {
  const totalHours = weeks.reduce((sum, week) => sum + Math.max(0, week.hours || 0), 0)
  if (totalHours <= 0) {
    return 0
  }
  const ideologicalHours = weeks.reduce(
    (sum, week) =>
      sum + (toOptionalTrimmedString(week.ideologicalElements) ? Math.max(0, week.hours || 0) : 0),
    0
  )
  return ideologicalHours / totalHours
}

interface ValidationResult {
  blockers: string[]
  warnings: string[]
}

const createValidationResult = (): ValidationResult => ({
  blockers: [],
  warnings: [],
})

const ensureCourseStandardValidation = (modules: Array<{ topics: Array<{ ideologicalElements: string[]; integrationMethods: string[] }> }>) => {
  const result = createValidationResult()
  const topics = modules.flatMap((module) => module.topics)
  if (topics.length === 0) {
    result.blockers.push('课程标准未配置任何主题条目')
    return result
  }

  const topicWithoutIdeologicalMappings = topics.filter(
    (topic) => topic.ideologicalElements.length === 0 || topic.integrationMethods.length === 0
  )
  if (topicWithoutIdeologicalMappings.length > 0) {
    result.blockers.push(`课程标准有 ${topicWithoutIdeologicalMappings.length} 个主题缺少思政元素或融入方式`)
  }

  return result
}

const ensureDeliveryPlanValidation = (
  weeks: Array<{
    weekNo: number
    hours: number
    ideologicalElements: string | null
    integrationMethod: string | null
    linkedStandardTopicIds: string[]
  }>,
  validTopicIds: Set<string> | null,
  topicIdeologicalMappings: Map<string, TopicIdeologicalMapping> | null = null,
  upstreamCourseStandardStatus: AcademicDocumentStatus | null = null
) => {
  const result = createValidationResult()
  if (weeks.length === 0) {
    result.blockers.push('授课计划未设置任何周次')
    return result
  }

  if (upstreamCourseStandardStatus && upstreamCourseStandardStatus !== 'PUBLISHED') {
    result.warnings.push('关联课程标准尚未发布，存在版本漂移风险')
  }

  const missingTopicLinkWeeks = weeks.filter((week) => week.linkedStandardTopicIds.length === 0)
  if (missingTopicLinkWeeks.length > 0) {
    result.blockers.push(`授课计划周次缺少课程标准条目关联：第 ${missingTopicLinkWeeks.map((week) => week.weekNo).join('、')} 周`)
  }

  if (validTopicIds) {
    const conflictWeeks: number[] = []
    for (const week of weeks) {
      const hasConflict = week.linkedStandardTopicIds.some((topicId) => !validTopicIds.has(topicId))
      if (hasConflict) {
        conflictWeeks.push(week.weekNo)
      }
    }
    if (conflictWeeks.length > 0) {
      result.blockers.push(`授课计划周次关联了无效课程标准条目：第 ${conflictWeeks.join('、')} 周`)
    }
  }

  const missingIdeologicalWeeks = weeks.filter((week) => !toOptionalTrimmedString(week.ideologicalElements))
  if (missingIdeologicalWeeks.length > 0) {
    result.blockers.push(`授课计划周次缺少思政元素：第 ${missingIdeologicalWeeks.map((week) => week.weekNo).join('、')} 周`)
  }

  const missingIntegrationMethodWeeks = weeks.filter((week) => !toOptionalTrimmedString(week.integrationMethod))
  if (missingIntegrationMethodWeeks.length > 0) {
    result.blockers.push(
      `授课计划周次缺少思政融入方式：第 ${missingIntegrationMethodWeeks.map((week) => week.weekNo).join('、')} 周`
    )
  }

  if (topicIdeologicalMappings) {
    const topicWithoutMappingWeeks = new Set<number>()
    const ideologicalConflictWeeks = new Set<number>()
    const integrationConflictWeeks = new Set<number>()

    for (const week of weeks) {
      const weekIdeological = toOptionalTrimmedString(week.ideologicalElements)
      const weekIntegration = toOptionalTrimmedString(week.integrationMethod)
      const linkedMappings = week.linkedStandardTopicIds
        .map((topicId) => topicIdeologicalMappings.get(topicId))
        .filter((mapping): mapping is TopicIdeologicalMapping => Boolean(mapping))

      if (linkedMappings.length === 0) {
        continue
      }

      const linkedElements = dedupeNonEmptyStrings(linkedMappings.flatMap((mapping) => mapping.ideologicalElements))
      const linkedMethods = dedupeNonEmptyStrings(linkedMappings.flatMap((mapping) => mapping.integrationMethods))

      if (linkedElements.length === 0 || linkedMethods.length === 0) {
        topicWithoutMappingWeeks.add(week.weekNo)
      }

      if (weekIdeological && linkedElements.length > 0) {
        const matched = linkedElements.some((item) => semanticTextIncludes(weekIdeological, item))
        if (!matched) {
          ideologicalConflictWeeks.add(week.weekNo)
        }
      }

      if (weekIntegration && linkedMethods.length > 0) {
        const matched = linkedMethods.some((item) => semanticTextIncludes(weekIntegration, item))
        if (!matched) {
          integrationConflictWeeks.add(week.weekNo)
        }
      }
    }

    if (topicWithoutMappingWeeks.size > 0) {
      result.blockers.push(`授课计划周次关联的课程标准条目缺少思政映射：第 ${Array.from(topicWithoutMappingWeeks).join('、')} 周`)
    }
    if (ideologicalConflictWeeks.size > 0) {
      result.blockers.push(`授课计划周次思政元素未映证到关联课程标准条目：第 ${Array.from(ideologicalConflictWeeks).join('、')} 周`)
    }
    if (integrationConflictWeeks.size > 0) {
      result.blockers.push(`授课计划周次融入方式未映证到关联课程标准条目：第 ${Array.from(integrationConflictWeeks).join('、')} 周`)
    }
  }

  const ratio = computeDeliveryIdeologicalRatio(weeks)
  if (ratio < 1 / 3) {
    result.blockers.push(`授课计划思政融入学时占比 ${(ratio * 100).toFixed(1)}%，低于 33.3%`)
  }

  return result
}

const ensureLessonValidation = (params: {
  lesson: {
    deliveryPlanId: string | null
    deliveryPlanWeekId: string | null
    ideologicalElements: string | null
    integrationMethod: string | null
    courseStandardTopicRefs: string[]
    deliveryPlanWeek: {
      weekNo: number
      linkedStandardTopicIds: string[]
      ideologicalElements: string | null
      integrationMethod: string | null
    } | null
    coursewareAssets: Array<{
      id: string
      deliveryPlanWeekId: string | null
      chapterRef: string | null
      tags: string[]
      ideologicalElements: string[]
    }>
    deliveryPlanWeeks: Array<{
      hours: number
      ideologicalElements: string | null
    }>
  }
  validTopicIds: Set<string> | null
  topicIdeologicalMappings?: Map<string, TopicIdeologicalMapping> | null
  upstreamStatuses?: {
    deliveryPlanStatus: AcademicDocumentStatus | null
    courseStandardStatus: AcademicDocumentStatus | null
  }
}): ValidationResult => {
  const { lesson, validTopicIds, topicIdeologicalMappings, upstreamStatuses } = params
  const result = createValidationResult()

  if (upstreamStatuses?.deliveryPlanStatus && upstreamStatuses.deliveryPlanStatus !== 'PUBLISHED') {
    result.warnings.push('关联授课计划尚未发布，存在版本漂移风险')
  }
  if (upstreamStatuses?.courseStandardStatus && upstreamStatuses.courseStandardStatus !== 'PUBLISHED') {
    result.warnings.push('关联课程标准尚未发布，存在版本漂移风险')
  }

  if (!lesson.deliveryPlanId || !lesson.deliveryPlanWeekId) {
    result.blockers.push('单次课教案未绑定授课计划与周次')
  }

  if (lesson.deliveryPlanWeeks.length > 0) {
    const ratio = computeDeliveryIdeologicalRatio(lesson.deliveryPlanWeeks)
    if (ratio < 1 / 3) {
      result.blockers.push(`单次课关联授课计划思政融入学时占比 ${(ratio * 100).toFixed(1)}%，低于 33.3%`)
    }
  }

  if (!toOptionalTrimmedString(lesson.ideologicalElements)) {
    result.blockers.push('单次课教案未填写课程思政元素')
  }

  if (!toOptionalTrimmedString(lesson.integrationMethod)) {
    result.blockers.push('单次课教案未填写思政融入方式')
  }

  if (lesson.courseStandardTopicRefs.length === 0) {
    result.blockers.push('单次课教案尚未关联课程标准主题条目')
  }

  if (validTopicIds) {
    const invalidTopicRef = lesson.courseStandardTopicRefs.find((topicId) => !validTopicIds.has(topicId))
    if (invalidTopicRef) {
      result.blockers.push('单次课教案关联了无效课程标准主题条目')
    }
  }

  if (topicIdeologicalMappings && lesson.courseStandardTopicRefs.length > 0) {
    const referencedMappings = lesson.courseStandardTopicRefs
      .map((topicId) => topicIdeologicalMappings.get(topicId))
      .filter((mapping): mapping is TopicIdeologicalMapping => Boolean(mapping))

    const linkedElements = dedupeNonEmptyStrings(referencedMappings.flatMap((mapping) => mapping.ideologicalElements))
    const linkedMethods = dedupeNonEmptyStrings(referencedMappings.flatMap((mapping) => mapping.integrationMethods))
    const lessonElements = toOptionalTrimmedString(lesson.ideologicalElements)
    const lessonMethod = toOptionalTrimmedString(lesson.integrationMethod)

    if (linkedElements.length === 0) {
      result.blockers.push('单次课教案关联的课程标准条目缺少思政元素映射')
    } else if (lessonElements && !linkedElements.some((item) => semanticTextIncludes(lessonElements, item))) {
      result.blockers.push('单次课教案思政元素未映证到课程标准条目')
    }

    if (linkedMethods.length === 0) {
      result.blockers.push('单次课教案关联的课程标准条目缺少融入方式映射')
    } else if (lessonMethod && !linkedMethods.some((item) => semanticTextIncludes(lessonMethod, item))) {
      result.blockers.push('单次课教案融入方式未映证到课程标准条目')
    }
  }

  if (lesson.deliveryPlanWeek) {
    const weekElements = toOptionalTrimmedString(lesson.deliveryPlanWeek.ideologicalElements)
    const lessonElements = toOptionalTrimmedString(lesson.ideologicalElements)
    if (!weekElements) {
      result.blockers.push(`授课计划第 ${lesson.deliveryPlanWeek.weekNo} 周未填写思政元素`)
    } else if (lessonElements && !semanticTextIncludes(weekElements, lessonElements)) {
      result.blockers.push(`单次课教案思政元素与授课计划第 ${lesson.deliveryPlanWeek.weekNo} 周描述不一致`)
    }

    const weekMethod = toOptionalTrimmedString(lesson.deliveryPlanWeek.integrationMethod)
    const lessonMethod = toOptionalTrimmedString(lesson.integrationMethod)
    if (!weekMethod) {
      result.blockers.push(`授课计划第 ${lesson.deliveryPlanWeek.weekNo} 周未填写思政融入方式`)
    } else if (lessonMethod && !semanticTextIncludes(weekMethod, lessonMethod)) {
      result.blockers.push(`单次课教案融入方式与授课计划第 ${lesson.deliveryPlanWeek.weekNo} 周描述不一致`)
    }

    if (lesson.deliveryPlanWeek.linkedStandardTopicIds.length > 0) {
      const weekTopicIdSet = new Set(lesson.deliveryPlanWeek.linkedStandardTopicIds)
      const hasConflict = lesson.courseStandardTopicRefs.some((topicId) => !weekTopicIdSet.has(topicId))
      if (hasConflict) {
        result.blockers.push(
          `单次课教案关联条目与授课计划第 ${lesson.deliveryPlanWeek.weekNo} 周课程标准条目不一致`
        )
      }
    } else {
      result.blockers.push(`授课计划第 ${lesson.deliveryPlanWeek.weekNo} 周未关联课程标准条目`)
    }
  }

  if (lesson.coursewareAssets.length === 0) {
    result.warnings.push('单次课教案未关联任何课件附件')
  } else {
    const missingChapterCount = lesson.coursewareAssets.filter(
      (asset) => !toOptionalTrimmedString(asset.chapterRef)
    ).length
    if (missingChapterCount > 0) {
      result.warnings.push(`课件附件有 ${missingChapterCount} 项缺少章节标注`)
    }

    const missingTagCount = lesson.coursewareAssets.filter((asset) => asset.tags.length === 0).length
    if (missingTagCount > 0) {
      result.warnings.push(`课件附件有 ${missingTagCount} 项缺少标签`)
    }

    const missingIdeologicalTagCount = lesson.coursewareAssets.filter(
      (asset) => asset.ideologicalElements.length === 0
    ).length
    if (missingIdeologicalTagCount > 0) {
      result.warnings.push(`课件附件有 ${missingIdeologicalTagCount} 项缺少思政标签`)
    }

    if (lesson.deliveryPlanWeekId) {
      const conflictingWeekBindingCount = lesson.coursewareAssets.filter(
        (asset) => asset.deliveryPlanWeekId && asset.deliveryPlanWeekId !== lesson.deliveryPlanWeekId
      ).length
      if (conflictingWeekBindingCount > 0) {
        result.blockers.push(`课件附件有 ${conflictingWeekBindingCount} 项周次关联与单次课教案不一致`)
      }
    }

    const lessonIdeological = toOptionalTrimmedString(lesson.ideologicalElements)
    if (lessonIdeological) {
      const conflictingCoursewareCount = lesson.coursewareAssets.filter((asset) => {
        const tags = dedupeNonEmptyStrings(asset.ideologicalElements)
        if (tags.length === 0) {
          return false
        }
        return !tags.some((tag) => semanticTextIncludes(tag, lessonIdeological))
      }).length
      if (conflictingCoursewareCount > 0) {
        result.blockers.push(`课件附件有 ${conflictingCoursewareCount} 项思政标签与单次课教案不一致`)
      }
    }
  }

  return result
}

export const academicRoutes = new Elysia()
  .use(authMiddleware)
  .use(requireAuth)
  .get(
    '/semesters',
    async ({ query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.SemesterWhereInput = {}
      const keyword = toOptionalTrimmedString(query?.search)
      if (keyword) {
        where.name = { contains: keyword }
      }

      const [items, total] = await Promise.all([
        prisma.semester.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.semester.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/semesters',
    async ({ user, body, set }) => {
      ensureAdmin(user?.role, set)

      const semester = await prisma.semester.create({
        data: {
          name: body.name.trim(),
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          status: body.status || 'PLANNING',
          createdById: user!.userId,
        },
      })

      return {
        success: true,
        message: 'Semester created successfully',
        data: semester,
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 120 }),
        startDate: t.String({ format: 'date-time' }),
        endDate: t.String({ format: 'date-time' }),
        status: t.Optional(t.Union([t.Literal('PLANNING'), t.Literal('ACTIVE'), t.Literal('CLOSED')])),
      }),
    }
  )
  .patch(
    '/semesters/:id',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)
      const existing = await prisma.semester.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Semester not found')
      }

      const semester = await prisma.semester.update({
        where: { id: params.id },
        data: {
          name: body.name ? body.name.trim() : undefined,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          status: body.status,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Semester updated successfully',
        data: semester,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
        startDate: t.Optional(t.String({ format: 'date-time' })),
        endDate: t.Optional(t.String({ format: 'date-time' })),
        status: t.Optional(t.Union([t.Literal('PLANNING'), t.Literal('ACTIVE'), t.Literal('CLOSED')])),
      }),
    }
  )
  .post(
    '/semesters/:id/activate',
    async ({ user, params, set }) => {
      ensureAdmin(user?.role, set)

      const semester = await prisma.semester.update({
        where: { id: params.id },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Semester activated successfully',
        data: semester,
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .post(
    '/semesters/:id/close',
    async ({ user, params, set }) => {
      ensureAdmin(user?.role, set)

      const semester = await prisma.semester.update({
        where: { id: params.id },
        data: {
          status: 'CLOSED',
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Semester closed successfully',
        data: semester,
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    '/courses',
    async ({ query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.CourseWhereInput = {}
      const keyword = toOptionalTrimmedString(query?.search)
      if (keyword) {
        where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
      }
      if (query?.status === 'ACTIVE' || query?.status === 'ARCHIVED') {
        where.status = query.status
      }

      const [items, total] = await Promise.all([
        prisma.course.findMany({
          where,
          include: {
            ownerTeacher: {
              select: { id: true, username: true, department: true },
            },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.course.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('ACTIVE'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .post(
    '/courses',
    async ({ user, body, set }) => {
      ensureAdmin(user?.role, set)

      const course = await prisma.course.create({
        data: {
          code: body.code.trim(),
          name: body.name.trim(),
          department: toOptionalTrimmedString(body.department),
          credits: body.credits,
          hours: body.hours,
          ownerTeacherId: body.ownerTeacherId,
          status: body.status || 'ACTIVE',
        },
      })

      return {
        success: true,
        message: 'Course created successfully',
        data: course,
      }
    },
    {
      body: t.Object({
        code: t.String({ minLength: 1, maxLength: 40 }),
        name: t.String({ minLength: 1, maxLength: 120 }),
        department: t.Optional(t.String()),
        credits: t.Optional(t.Number({ minimum: 0 })),
        hours: t.Optional(t.Number({ minimum: 0 })),
        ownerTeacherId: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('ACTIVE'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .patch(
    '/courses/:id',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)

      const existing = await prisma.course.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course not found')
      }

      const course = await prisma.course.update({
        where: { id: params.id },
        data: {
          code: body.code ? body.code.trim() : undefined,
          name: body.name ? body.name.trim() : undefined,
          department: body.department !== undefined ? toOptionalTrimmedString(body.department) : undefined,
          credits: body.credits,
          hours: body.hours,
          ownerTeacherId: body.ownerTeacherId,
          status: body.status,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Course updated successfully',
        data: course,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        code: t.Optional(t.String({ minLength: 1, maxLength: 40 })),
        name: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
        department: t.Optional(t.String()),
        credits: t.Optional(t.Number({ minimum: 0 })),
        hours: t.Optional(t.Number({ minimum: 0 })),
        ownerTeacherId: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('ACTIVE'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .delete(
    '/courses/:id',
    async ({ user, params, set }) => {
      ensureAdmin(user?.role, set)
      const existing = await prisma.course.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course not found')
      }
      await prisma.course.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Course deleted successfully',
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    '/course-offerings',
    async ({ user, query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.CourseOfferingWhereInput = {}
      if (user?.role !== 'ADMIN') {
        where.teacherId = user!.userId
      }
      if (query?.courseId && typeof query.courseId === 'string') {
        where.courseId = query.courseId
      }
      if (query?.semesterId && typeof query.semesterId === 'string') {
        where.semesterId = query.semesterId
      }

      const [items, total] = await Promise.all([
        prisma.courseOffering.findMany({
          where,
          include: {
            course: true,
            semester: true,
            teacher: {
              select: { id: true, username: true, department: true },
            },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.courseOffering.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        courseId: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/course-offerings',
    async ({ user, body, set }) => {
      ensureAdmin(user?.role, set)

      const offering = await prisma.courseOffering.create({
        data: {
          courseId: body.courseId,
          semesterId: body.semesterId,
          className: body.className.trim(),
          teacherId: body.teacherId,
          weeklyHours: body.weeklyHours,
          totalWeeks: body.totalWeeks,
          status: body.status || 'PLANNING',
        },
      })

      return {
        success: true,
        message: 'Course offering created successfully',
        data: offering,
      }
    },
    {
      body: t.Object({
        courseId: t.String(),
        semesterId: t.String(),
        className: t.String({ minLength: 1, maxLength: 120 }),
        teacherId: t.String(),
        weeklyHours: t.Optional(t.Number({ minimum: 0 })),
        totalWeeks: t.Optional(t.Number({ minimum: 0 })),
        status: t.Optional(t.Union([t.Literal('PLANNING'), t.Literal('ACTIVE'), t.Literal('CLOSED')])),
      }),
    }
  )
  .patch(
    '/course-offerings/:id',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)

      const existing = await prisma.courseOffering.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course offering not found')
      }

      const offering = await prisma.courseOffering.update({
        where: { id: params.id },
        data: {
          courseId: body.courseId,
          semesterId: body.semesterId,
          className: body.className ? body.className.trim() : undefined,
          teacherId: body.teacherId,
          weeklyHours: body.weeklyHours,
          totalWeeks: body.totalWeeks,
          status: body.status,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Course offering updated successfully',
        data: offering,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        courseId: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
        className: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
        teacherId: t.Optional(t.String()),
        weeklyHours: t.Optional(t.Number({ minimum: 0 })),
        totalWeeks: t.Optional(t.Number({ minimum: 0 })),
        status: t.Optional(t.Union([t.Literal('PLANNING'), t.Literal('ACTIVE'), t.Literal('CLOSED')])),
      }),
    }
  )
  .delete(
    '/course-offerings/:id',
    async ({ user, params, set }) => {
      ensureAdmin(user?.role, set)
      const existing = await prisma.courseOffering.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course offering not found')
      }
      await prisma.courseOffering.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Course offering deleted successfully',
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    '/users',
    async ({ user, query, set }) => {
      ensureAdmin(user?.role, set)
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.UserWhereInput = {}
      const keyword = toOptionalTrimmedString(query?.search)
      if (keyword) {
        where.OR = [{ username: { contains: keyword } }, { email: { contains: keyword } }]
      }

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            department: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    '/users/:id',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)

      const existing = await prisma.user.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('User not found')
      }

      const updated = await prisma.user.update({
        where: { id: params.id },
        data: {
          role: body.role,
          department: body.department,
          email: body.email,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        message: 'User updated successfully',
        data: updated,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        role: t.Optional(t.Union([t.Literal('ADMIN'), t.Literal('TEACHER')])),
        department: t.Optional(t.String()),
        email: t.Optional(t.String({ format: 'email' })),
      }),
    }
  )
  .post(
    '/users/:id/reset-password',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)

      const existing = await prisma.user.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('User not found')
      }

      const hashedPassword = await hashPassword(body.newPassword)
      await prisma.user.update({
        where: { id: params.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Password reset successfully',
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        newPassword: t.String({ minLength: 6 }),
      }),
    }
  )
  .get(
    '/course-standards',
    async ({ user, query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.CourseStandardWhereInput = {}
      if (user?.role !== 'ADMIN') {
        where.OR = [{ ownerId: user!.userId }, { status: 'PUBLISHED' }]
      }
      if (query?.courseId && typeof query.courseId === 'string') {
        where.courseId = query.courseId
      }
      if (query?.semesterId && typeof query.semesterId === 'string') {
        where.semesterId = query.semesterId
      }
      if (query?.status && isDocumentStatus(query.status)) {
        where.status = query.status
      }

      const [items, total] = await Promise.all([
        prisma.courseStandard.findMany({
          where,
          include: {
            course: true,
            semester: true,
            owner: { select: { id: true, username: true, department: true } },
            modules: { include: { topics: true }, orderBy: { sortOrder: 'asc' } },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.courseStandard.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        courseId: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .get(
    '/course-standards/:id',
    async ({ user, params, set }) => {
      const standard = await prisma.courseStandard.findUnique({
        where: { id: params.id },
        include: {
          course: true,
          semester: true,
          owner: { select: { id: true, username: true, department: true } },
          modules: {
            include: { topics: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      })

      if (!standard) {
        set.status = 404
        throw new Error('Course standard not found')
      }

      if (user?.role !== 'ADMIN' && standard.ownerId !== user?.userId && standard.status !== 'PUBLISHED') {
        set.status = 403
        throw new Error('Forbidden: You can only access your own course standards')
      }

      return { success: true, data: standard }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    '/course-standards',
    async ({ user, body, set }) => {
      const standard = await prisma.courseStandard.create({
        data: {
          title: body.title.trim(),
          courseId: body.courseId,
          semesterId: body.semesterId,
          templateVersionId: body.templateVersionId,
          contentJson: body.contentJson,
          htmlContent: body.htmlContent?.trim() || '<p></p>',
          status: normalizeDocumentStatus(body.status),
          ownerId: user!.userId,
          modules: mapCourseStandardModules(body.modules)
            ? {
                create: mapCourseStandardModules(body.modules),
              }
            : undefined,
        },
        include: {
          modules: {
            include: { topics: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      })

      return {
        success: true,
        message: 'Course standard created successfully',
        data: standard,
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        courseId: t.String(),
        semesterId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        htmlContent: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
        modules: t.Optional(t.Any()),
      }),
    }
  )
  .patch(
    '/course-standards/:id',
    async ({ user, params, body, set }) => {
      const existing = await prisma.courseStandard.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course standard not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only update your own course standards')
      }

      const normalizedModules = mapCourseStandardModules(body.modules)

      const updated = await prisma.$transaction(async (tx) => {
        if (normalizedModules) {
          await tx.courseStandardTopic.deleteMany({
            where: { module: { standardId: params.id } },
          })
          await tx.courseStandardModule.deleteMany({ where: { standardId: params.id } })
        }

        return tx.courseStandard.update({
          where: { id: params.id },
          data: {
            title: body.title ? body.title.trim() : undefined,
            courseId: body.courseId,
            semesterId: body.semesterId,
            templateVersionId: body.templateVersionId,
            contentJson: body.contentJson,
            htmlContent: body.htmlContent,
            status: body.status ? normalizeDocumentStatus(body.status, existing.status) : undefined,
            modules: normalizedModules
              ? {
                  create: normalizedModules,
                }
              : undefined,
            updatedAt: new Date(),
          },
          include: {
            modules: {
              include: { topics: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        })
      })

      return {
        success: true,
        message: 'Course standard updated successfully',
        data: updated,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        courseId: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        htmlContent: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
        modules: t.Optional(t.Any()),
      }),
    }
  )
  .post(
    '/course-standards/:id/publish',
    async ({ user, params, set }) => {
      const existing = await prisma.courseStandard.findUnique({
        where: { id: params.id },
        include: {
          modules: {
            include: { topics: true },
          },
        },
      })

      if (!existing) {
        set.status = 404
        throw new Error('Course standard not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only publish your own course standards')
      }

      const validation = ensureCourseStandardValidation(
        existing.modules.map((module) => ({
          topics: module.topics.map((topic) => ({
            ideologicalElements: topic.ideologicalElements,
            integrationMethods: topic.integrationMethods,
          })),
        }))
      )
      if (validation.blockers.length > 0) {
        set.status = 422
        throw new Error(`课程标准发布校验未通过：${validation.blockers.join('；')}`)
      }

      const updated = await prisma.courseStandard.update({
        where: { id: params.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedSnapshotJson: {
            id: existing.id,
            title: existing.title,
            contentJson: existing.contentJson,
            htmlContent: existing.htmlContent,
            modules: existing.modules,
          },
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Course standard published successfully',
        data: {
          ...updated,
          validation,
        },
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    '/course-standards/:id/archive',
    async ({ user, params, set }) => {
      const existing = await prisma.courseStandard.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course standard not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only archive your own course standards')
      }

      const updated = await prisma.courseStandard.update({
        where: { id: params.id },
        data: {
          status: 'ARCHIVED',
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Course standard archived successfully',
        data: updated,
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .delete(
    '/course-standards/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.courseStandard.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Course standard not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only delete your own course standards')
      }

      await prisma.courseStandard.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Course standard deleted successfully',
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    '/delivery-plans',
    async ({ user, query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.DeliveryPlanWhereInput = {}
      if (user?.role !== 'ADMIN') {
        where.OR = [{ ownerId: user!.userId }, { status: 'PUBLISHED' }]
      }
      if (query?.courseOfferingId && typeof query.courseOfferingId === 'string') {
        where.courseOfferingId = query.courseOfferingId
      }
      if (query?.status && isDocumentStatus(query.status)) {
        where.status = query.status
      }

      const [items, total] = await Promise.all([
        prisma.deliveryPlan.findMany({
          where,
          include: {
            courseOffering: {
              include: {
                course: true,
                semester: true,
                teacher: {
                  select: { id: true, username: true, department: true },
                },
              },
            },
            courseStandard: {
              select: { id: true, title: true, status: true },
            },
            weeks: { orderBy: { weekNo: 'asc' } },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.deliveryPlan.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        courseOfferingId: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .get(
    '/delivery-plans/:id',
    async ({ user, params, set }) => {
      const plan = await prisma.deliveryPlan.findUnique({
        where: { id: params.id },
        include: {
          courseOffering: {
            include: {
              course: true,
              semester: true,
              teacher: {
                select: { id: true, username: true, department: true },
              },
            },
          },
          courseStandard: {
            include: {
              modules: {
                include: { topics: true },
              },
            },
          },
          weeks: {
            orderBy: { weekNo: 'asc' },
          },
        },
      })

      if (!plan) {
        set.status = 404
        throw new Error('Delivery plan not found')
      }

      if (user?.role !== 'ADMIN' && plan.ownerId !== user?.userId && plan.status !== 'PUBLISHED') {
        set.status = 403
        throw new Error('Forbidden: You can only access your own delivery plans')
      }

      return { success: true, data: plan }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    '/delivery-plans',
    async ({ user, body }) => {
      const deliveryPlan = await prisma.deliveryPlan.create({
        data: {
          title: body.title.trim(),
          courseOfferingId: body.courseOfferingId,
          courseStandardId: body.courseStandardId,
          templateVersionId: body.templateVersionId,
          contentJson: body.contentJson,
          status: normalizeDocumentStatus(body.status),
          ownerId: user!.userId,
          weeks: mapDeliveryPlanWeeks(body.weeks)
            ? {
                create: mapDeliveryPlanWeeks(body.weeks),
              }
            : undefined,
        },
        include: {
          weeks: { orderBy: { weekNo: 'asc' } },
        },
      })

      return {
        success: true,
        message: 'Delivery plan created successfully',
        data: deliveryPlan,
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        courseOfferingId: t.String(),
        courseStandardId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
        weeks: t.Optional(t.Any()),
      }),
    }
  )
  .patch(
    '/delivery-plans/:id',
    async ({ user, params, body, set }) => {
      const existing = await prisma.deliveryPlan.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Delivery plan not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only update your own delivery plans')
      }

      const updated = await prisma.deliveryPlan.update({
        where: { id: params.id },
        data: {
          title: body.title ? body.title.trim() : undefined,
          courseOfferingId: body.courseOfferingId,
          courseStandardId: body.courseStandardId,
          templateVersionId: body.templateVersionId,
          contentJson: body.contentJson,
          status: body.status ? normalizeDocumentStatus(body.status, existing.status) : undefined,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Delivery plan updated successfully',
        data: updated,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        courseOfferingId: t.Optional(t.String()),
        courseStandardId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .put(
    '/delivery-plans/:id/weeks',
    async ({ user, params, body, set }) => {
      const existing = await prisma.deliveryPlan.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Delivery plan not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only update your own delivery plans')
      }

      const weeks = mapDeliveryPlanWeeks(body.weeks)
      if (!weeks || weeks.length === 0) {
        set.status = 422
        throw new Error('Weeks are required')
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.deliveryPlanWeek.deleteMany({ where: { deliveryPlanId: params.id } })
        await tx.deliveryPlanWeek.createMany({
          data: weeks.map((week) => ({
            deliveryPlanId: params.id,
            weekNo: week.weekNo,
            hours: week.hours,
            grouping: week.grouping,
            teachingMode: week.teachingMode,
            unitOrTask: week.unitOrTask,
            ideologicalElements: week.ideologicalElements,
            integrationMethod: week.integrationMethod,
            theoreticalPoints: week.theoreticalPoints,
            practiceProject: week.practiceProject,
            practiceInstructor: week.practiceInstructor,
            remarks: week.remarks,
            linkedStandardTopicIds: week.linkedStandardTopicIds,
          })),
        })
        return tx.deliveryPlan.findUnique({
          where: { id: params.id },
          include: { weeks: { orderBy: { weekNo: 'asc' } } },
        })
      })

      return {
        success: true,
        message: 'Delivery plan weeks updated successfully',
        data: updated,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        weeks: t.Array(t.Any(), { minItems: 1 }),
      }),
    }
  )
  .post(
    '/delivery-plans/:id/publish',
    async ({ user, params, set }) => {
      const existing = await prisma.deliveryPlan.findUnique({
        where: { id: params.id },
        include: {
          weeks: true,
          courseStandard: {
            include: {
              modules: {
                include: {
                  topics: {
                    select: {
                      id: true,
                      ideologicalElements: true,
                      integrationMethods: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      if (!existing) {
        set.status = 404
        throw new Error('Delivery plan not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only publish your own delivery plans')
      }

      const validTopicIds = existing.courseStandard
        ? new Set(existing.courseStandard.modules.flatMap((module) => module.topics.map((topic) => topic.id)))
        : null
      const topicIdeologicalMappings = existing.courseStandard
        ? buildTopicIdeologicalMappings(existing.courseStandard.modules)
        : null
      const validation = ensureDeliveryPlanValidation(
        existing.weeks,
        validTopicIds,
        topicIdeologicalMappings,
        existing.courseStandard?.status || null
      )
      if (validation.blockers.length > 0) {
        set.status = 422
        throw new Error(`授课计划发布校验未通过：${validation.blockers.join('；')}`)
      }

      const { updated, traceLinksCreated } = await prisma.$transaction(async (tx) => {
        const now = new Date()
        const updatedPlan = await tx.deliveryPlan.update({
          where: { id: params.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedSnapshotJson: {
              id: existing.id,
              title: existing.title,
              weeks: existing.weeks,
            },
            updatedAt: now,
          },
        })

        await tx.traceLink.deleteMany({
          where: {
            OR: [
              {
                type: 'STANDARD_TO_DELIVERY',
                targetType: 'delivery-plan',
                targetId: existing.id,
              },
              {
                type: 'STANDARD_TO_DELIVERY',
                sourceType: 'course-standard',
                sourceId: existing.courseStandardId || '',
                targetType: 'delivery-plan',
                targetId: existing.id,
              },
            ],
          },
        })

        let createdCount = 0
        if (existing.courseStandardId) {
          await tx.traceLink.create({
            data: {
              type: 'STANDARD_TO_DELIVERY',
              sourceType: 'course-standard',
              sourceId: existing.courseStandardId,
              targetType: 'delivery-plan',
              targetId: existing.id,
              evidence: {
                weekCount: existing.weeks.length,
                linkedStandardTopicIds: existing.weeks.flatMap((week) => week.linkedStandardTopicIds),
              },
              severity: 'info',
              createdById: user!.userId,
            },
          })
          createdCount += 1
        }

        return { updated: updatedPlan, traceLinksCreated: createdCount }
      })

      return {
        success: true,
        message: 'Delivery plan published successfully',
        data: {
          ...updated,
          validation,
          traceLinksCreated,
        },
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .delete(
    '/delivery-plans/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.deliveryPlan.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Delivery plan not found')
      }
      if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only delete your own delivery plans')
      }

      await prisma.deliveryPlan.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Delivery plan deleted successfully',
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .get(
    '/teaching-plan-books',
    async ({ user, query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.TeachingPlanBookWhereInput = {}
      if (user?.role !== 'ADMIN') {
        where.teacherId = user!.userId
      }
      if (query?.semesterId && typeof query.semesterId === 'string') {
        where.semesterId = query.semesterId
      }
      if (query?.courseOfferingId && typeof query.courseOfferingId === 'string') {
        where.courseOfferingId = query.courseOfferingId
      }
      if (query?.status && isDocumentStatus(query.status)) {
        where.status = query.status
      }

      const [items, total] = await Promise.all([
        prisma.teachingPlanBook.findMany({
          where,
          include: {
            semester: true,
            courseOffering: {
              include: {
                course: true,
                teacher: {
                  select: { id: true, username: true, department: true },
                },
              },
            },
            lessons: {
              select: {
                id: true,
                lessonNo: true,
                title: true,
                weekNo: true,
                status: true,
              },
              orderBy: { lessonNo: 'asc' },
            },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.teachingPlanBook.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
        courseOfferingId: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .post(
    '/teaching-plan-books',
    async ({ user, body }) => {
      const book = await prisma.teachingPlanBook.create({
        data: {
          title: body.title.trim(),
          courseOfferingId: body.courseOfferingId,
          semesterId: body.semesterId,
          teacherId: user!.userId,
          templateVersionId: body.templateVersionId,
          teacherName: toOptionalTrimmedString(body.teacherName),
          teacherTitle: toOptionalTrimmedString(body.teacherTitle),
          teacherUnit: toOptionalTrimmedString(body.teacherUnit),
          periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
          periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
          totalHours: body.totalHours,
          theoryHours: body.theoryHours,
          practicalHours: body.practicalHours,
          weeklyHours: body.weeklyHours,
          assessmentMethod: toOptionalTrimmedString(body.assessmentMethod),
          targetUnit: toOptionalTrimmedString(body.targetUnit),
          targetClass: toOptionalTrimmedString(body.targetClass),
          researchReview: toOptionalTrimmedString(body.researchReview),
          deptReview: toOptionalTrimmedString(body.deptReview),
          status: normalizeDocumentStatus(body.status),
        },
      })

      return {
        success: true,
        message: 'Teaching plan book created successfully',
        data: book,
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        courseOfferingId: t.String(),
        semesterId: t.String(),
        templateVersionId: t.Optional(t.String()),
        teacherName: t.Optional(t.String()),
        teacherTitle: t.Optional(t.String()),
        teacherUnit: t.Optional(t.String()),
        periodStart: t.Optional(t.String({ format: 'date-time' })),
        periodEnd: t.Optional(t.String({ format: 'date-time' })),
        totalHours: t.Optional(t.Number({ minimum: 0 })),
        theoryHours: t.Optional(t.Number({ minimum: 0 })),
        practicalHours: t.Optional(t.Number({ minimum: 0 })),
        weeklyHours: t.Optional(t.Number({ minimum: 0 })),
        assessmentMethod: t.Optional(t.String()),
        targetUnit: t.Optional(t.String()),
        targetClass: t.Optional(t.String()),
        researchReview: t.Optional(t.String()),
        deptReview: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .patch(
    '/teaching-plan-books/:id',
    async ({ user, params, body, set }) => {
      const existing = await prisma.teachingPlanBook.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Teaching plan book not found')
      }
      if (user?.role !== 'ADMIN' && existing.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only update your own teaching plan books')
      }

      const book = await prisma.teachingPlanBook.update({
        where: { id: params.id },
        data: {
          title: body.title ? body.title.trim() : undefined,
          courseOfferingId: body.courseOfferingId,
          semesterId: body.semesterId,
          templateVersionId: body.templateVersionId,
          teacherName: body.teacherName !== undefined ? toOptionalTrimmedString(body.teacherName) : undefined,
          teacherTitle: body.teacherTitle !== undefined ? toOptionalTrimmedString(body.teacherTitle) : undefined,
          teacherUnit: body.teacherUnit !== undefined ? toOptionalTrimmedString(body.teacherUnit) : undefined,
          periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
          periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
          totalHours: body.totalHours,
          theoryHours: body.theoryHours,
          practicalHours: body.practicalHours,
          weeklyHours: body.weeklyHours,
          assessmentMethod: body.assessmentMethod !== undefined ? toOptionalTrimmedString(body.assessmentMethod) : undefined,
          targetUnit: body.targetUnit !== undefined ? toOptionalTrimmedString(body.targetUnit) : undefined,
          targetClass: body.targetClass !== undefined ? toOptionalTrimmedString(body.targetClass) : undefined,
          researchReview: body.researchReview !== undefined ? toOptionalTrimmedString(body.researchReview) : undefined,
          deptReview: body.deptReview !== undefined ? toOptionalTrimmedString(body.deptReview) : undefined,
          status: body.status ? normalizeDocumentStatus(body.status, existing.status) : undefined,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Teaching plan book updated successfully',
        data: book,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        courseOfferingId: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        teacherName: t.Optional(t.String()),
        teacherTitle: t.Optional(t.String()),
        teacherUnit: t.Optional(t.String()),
        periodStart: t.Optional(t.String({ format: 'date-time' })),
        periodEnd: t.Optional(t.String({ format: 'date-time' })),
        totalHours: t.Optional(t.Number({ minimum: 0 })),
        theoryHours: t.Optional(t.Number({ minimum: 0 })),
        practicalHours: t.Optional(t.Number({ minimum: 0 })),
        weeklyHours: t.Optional(t.Number({ minimum: 0 })),
        assessmentMethod: t.Optional(t.String()),
        targetUnit: t.Optional(t.String()),
        targetClass: t.Optional(t.String()),
        researchReview: t.Optional(t.String()),
        deptReview: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      }),
    }
  )
  .delete(
    '/teaching-plan-books/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.teachingPlanBook.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Teaching plan book not found')
      }
      if (user?.role !== 'ADMIN' && existing.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only delete your own teaching plan books')
      }

      await prisma.teachingPlanBook.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Teaching plan book deleted successfully',
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .get(
    '/teaching-plan-lessons',
    async ({ user, query, set }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.TeachingPlanLessonWhereInput = {}
      if (!query?.bookId || typeof query.bookId !== 'string') {
        set.status = 422
        throw new Error('bookId is required')
      }
      where.bookId = query.bookId

      if (user?.role !== 'ADMIN') {
        where.book = {
          teacherId: user!.userId,
        }
      }

      const [items, total] = await Promise.all([
        prisma.teachingPlanLesson.findMany({
          where,
          include: {
            book: {
              select: {
                id: true,
                title: true,
                teacherId: true,
                courseOfferingId: true,
                semesterId: true,
              },
            },
            deliveryPlan: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            deliveryPlanWeek: {
              select: {
                id: true,
                weekNo: true,
                unitOrTask: true,
                ideologicalElements: true,
                integrationMethod: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: [{ lessonNo: 'asc' }],
        }),
        prisma.teachingPlanLesson.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        bookId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/teaching-plan-lessons',
    async ({ user, body, set }) => {
      const book = await prisma.teachingPlanBook.findUnique({ where: { id: body.bookId } })
      if (!book) {
        set.status = 404
        throw new Error('Teaching plan book not found')
      }
      if (user?.role !== 'ADMIN' && book.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only create lessons in your own teaching plan books')
      }

      let lessonNo = body.lessonNo
      if (!Number.isFinite(lessonNo) || Number(lessonNo) <= 0) {
        const lastLesson = await prisma.teachingPlanLesson.findFirst({
          where: { bookId: body.bookId },
          orderBy: { lessonNo: 'desc' },
          select: { lessonNo: true },
        })
        lessonNo = (lastLesson?.lessonNo || 0) + 1
      }

      const lesson = await prisma.teachingPlanLesson.create({
        data: {
          bookId: body.bookId,
          lessonNo: Math.round(Number(lessonNo)),
          title: body.title.trim(),
          lessonType: toOptionalTrimmedString(body.lessonType),
          className: toOptionalTrimmedString(body.className),
          weekNo: body.weekNo,
          weekday: toOptionalTrimmedString(body.weekday),
          period: toOptionalTrimmedString(body.period),
          lessonDate: body.lessonDate ? new Date(body.lessonDate) : undefined,
          duration: body.duration || 45,
          objectives: body.objectives,
          ideologicalElements: toOptionalTrimmedString(body.ideologicalElements),
          integrationMethod: toOptionalTrimmedString(body.integrationMethod),
          keyPoints: toOptionalTrimmedString(body.keyPoints),
          difficulty: toOptionalTrimmedString(body.difficulty),
          methods: toOptionalTrimmedString(body.methods),
          teachingAids: toOptionalTrimmedString(body.teachingAids),
          outline: body.outline,
          reflection: toOptionalTrimmedString(body.reflection),
          contentJson: body.contentJson,
          status: normalizeDocumentStatus(body.status),
          deliveryPlanId: body.deliveryPlanId,
          deliveryPlanWeekId: body.deliveryPlanWeekId,
          templateVersionId: body.templateVersionId,
          courseStandardTopicRefs: toUniqueStringArray(body.courseStandardTopicRefs),
        },
      })

      return {
        success: true,
        message: 'Teaching plan lesson created successfully',
        data: lesson,
      }
    },
    {
      body: t.Object({
        bookId: t.String(),
        lessonNo: t.Optional(t.Number({ minimum: 1 })),
        title: t.String({ minLength: 1, maxLength: 200 }),
        lessonType: t.Optional(t.String()),
        className: t.Optional(t.String()),
        weekNo: t.Optional(t.Number({ minimum: 1 })),
        weekday: t.Optional(t.String()),
        period: t.Optional(t.String()),
        lessonDate: t.Optional(t.String({ format: 'date-time' })),
        duration: t.Optional(t.Number({ minimum: 1, maximum: 300 })),
        objectives: t.String(),
        ideologicalElements: t.Optional(t.String()),
        integrationMethod: t.Optional(t.String()),
        keyPoints: t.Optional(t.String()),
        difficulty: t.Optional(t.String()),
        methods: t.Optional(t.String()),
        teachingAids: t.Optional(t.String()),
        outline: t.String(),
        reflection: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
        deliveryPlanId: t.Optional(t.String()),
        deliveryPlanWeekId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        courseStandardTopicRefs: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .get(
    '/teaching-plan-lessons/:id',
    async ({ user, params, set }) => {
      const lesson = await prisma.teachingPlanLesson.findUnique({
        where: { id: params.id },
        include: {
          book: {
            include: {
              courseOffering: {
                include: {
                  course: true,
                  semester: true,
                },
              },
            },
          },
          deliveryPlan: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          deliveryPlanWeek: {
            select: {
              id: true,
              weekNo: true,
              unitOrTask: true,
              ideologicalElements: true,
              integrationMethod: true,
            },
          },
          coursewareAssets: {
            select: {
              id: true,
              title: true,
              fileName: true,
              fileUrl: true,
            },
          },
        },
      })

      if (!lesson) {
        set.status = 404
        throw new Error('Teaching plan lesson not found')
      }

      if (user?.role !== 'ADMIN' && lesson.book.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only access your own teaching plan lessons')
      }

      return {
        success: true,
        data: lesson,
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .patch(
    '/teaching-plan-lessons/:id',
    async ({ user, params, body, set }) => {
      const existing = await prisma.teachingPlanLesson.findUnique({
        where: { id: params.id },
        include: {
          book: { select: { teacherId: true } },
        },
      })
      if (!existing) {
        set.status = 404
        throw new Error('Teaching plan lesson not found')
      }
      if (user?.role !== 'ADMIN' && existing.book.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only update your own teaching plan lessons')
      }

      const lesson = await prisma.teachingPlanLesson.update({
        where: { id: params.id },
        data: {
          lessonNo: body.lessonNo,
          title: body.title ? body.title.trim() : undefined,
          lessonType: body.lessonType !== undefined ? toOptionalTrimmedString(body.lessonType) : undefined,
          className: body.className !== undefined ? toOptionalTrimmedString(body.className) : undefined,
          weekNo: body.weekNo,
          weekday: body.weekday !== undefined ? toOptionalTrimmedString(body.weekday) : undefined,
          period: body.period !== undefined ? toOptionalTrimmedString(body.period) : undefined,
          lessonDate: body.lessonDate ? new Date(body.lessonDate) : undefined,
          duration: body.duration,
          objectives: body.objectives,
          ideologicalElements: body.ideologicalElements !== undefined ? toOptionalTrimmedString(body.ideologicalElements) : undefined,
          integrationMethod: body.integrationMethod !== undefined ? toOptionalTrimmedString(body.integrationMethod) : undefined,
          keyPoints: body.keyPoints !== undefined ? toOptionalTrimmedString(body.keyPoints) : undefined,
          difficulty: body.difficulty !== undefined ? toOptionalTrimmedString(body.difficulty) : undefined,
          methods: body.methods !== undefined ? toOptionalTrimmedString(body.methods) : undefined,
          teachingAids: body.teachingAids !== undefined ? toOptionalTrimmedString(body.teachingAids) : undefined,
          outline: body.outline,
          reflection: body.reflection !== undefined ? toOptionalTrimmedString(body.reflection) : undefined,
          contentJson: body.contentJson,
          status: body.status ? normalizeDocumentStatus(body.status, existing.status) : undefined,
          deliveryPlanId: body.deliveryPlanId,
          deliveryPlanWeekId: body.deliveryPlanWeekId,
          templateVersionId: body.templateVersionId,
          courseStandardTopicRefs: body.courseStandardTopicRefs
            ? toUniqueStringArray(body.courseStandardTopicRefs)
            : undefined,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Teaching plan lesson updated successfully',
        data: lesson,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        lessonNo: t.Optional(t.Number({ minimum: 1 })),
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        lessonType: t.Optional(t.String()),
        className: t.Optional(t.String()),
        weekNo: t.Optional(t.Number({ minimum: 1 })),
        weekday: t.Optional(t.String()),
        period: t.Optional(t.String()),
        lessonDate: t.Optional(t.String({ format: 'date-time' })),
        duration: t.Optional(t.Number({ minimum: 1, maximum: 300 })),
        objectives: t.Optional(t.String()),
        ideologicalElements: t.Optional(t.String()),
        integrationMethod: t.Optional(t.String()),
        keyPoints: t.Optional(t.String()),
        difficulty: t.Optional(t.String()),
        methods: t.Optional(t.String()),
        teachingAids: t.Optional(t.String()),
        outline: t.Optional(t.String()),
        reflection: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
        deliveryPlanId: t.Optional(t.String()),
        deliveryPlanWeekId: t.Optional(t.String()),
        templateVersionId: t.Optional(t.String()),
        courseStandardTopicRefs: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .post(
    '/teaching-plan-lessons/:id/publish',
    async ({ user, params, set }) => {
      const existing = await prisma.teachingPlanLesson.findUnique({
        where: { id: params.id },
        include: {
          book: { select: { teacherId: true } },
          deliveryPlanWeek: true,
          deliveryPlan: {
            include: {
              weeks: {
                select: {
                  hours: true,
                  ideologicalElements: true,
                },
              },
              courseStandard: {
                include: {
                  modules: {
                    include: {
                      topics: {
                        select: {
                          id: true,
                          ideologicalElements: true,
                          integrationMethods: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          coursewareAssets: {
            select: {
              id: true,
              deliveryPlanWeekId: true,
              chapterRef: true,
              tags: true,
              ideologicalElements: true,
            },
          },
        },
      })
      if (!existing) {
        set.status = 404
        throw new Error('Teaching plan lesson not found')
      }
      if (user?.role !== 'ADMIN' && existing.book.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only publish your own teaching plan lessons')
      }

      const validTopicIds = existing.deliveryPlan?.courseStandard
        ? new Set(existing.deliveryPlan.courseStandard.modules.flatMap((module) => module.topics.map((topic) => topic.id)))
        : null
      const topicIdeologicalMappings = existing.deliveryPlan?.courseStandard
        ? buildTopicIdeologicalMappings(existing.deliveryPlan.courseStandard.modules)
        : null
      const validation = ensureLessonValidation({
        lesson: {
          deliveryPlanId: existing.deliveryPlanId,
          deliveryPlanWeekId: existing.deliveryPlanWeekId,
          ideologicalElements: existing.ideologicalElements,
          integrationMethod: existing.integrationMethod,
          courseStandardTopicRefs: existing.courseStandardTopicRefs,
          deliveryPlanWeek: existing.deliveryPlanWeek
            ? {
                weekNo: existing.deliveryPlanWeek.weekNo,
                linkedStandardTopicIds: existing.deliveryPlanWeek.linkedStandardTopicIds,
                ideologicalElements: existing.deliveryPlanWeek.ideologicalElements,
                integrationMethod: existing.deliveryPlanWeek.integrationMethod,
              }
            : null,
          coursewareAssets: existing.coursewareAssets,
          deliveryPlanWeeks: existing.deliveryPlan?.weeks || [],
        },
        validTopicIds,
        topicIdeologicalMappings,
        upstreamStatuses: {
          deliveryPlanStatus: existing.deliveryPlan?.status || null,
          courseStandardStatus: existing.deliveryPlan?.courseStandard?.status || null,
        },
      })
      if (validation.blockers.length > 0) {
        set.status = 422
        throw new Error(`单次课教案发布校验未通过：${validation.blockers.join('；')}`)
      }

      const { updated, traceLinksCreated } = await prisma.$transaction(async (tx) => {
        const now = new Date()
        const updatedLesson = await tx.teachingPlanLesson.update({
          where: { id: params.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            publishedSnapshotJson: {
              id: existing.id,
              lessonNo: existing.lessonNo,
              title: existing.title,
              objectives: existing.objectives,
              outline: existing.outline,
              ideologicalElements: existing.ideologicalElements,
              integrationMethod: existing.integrationMethod,
            },
            updatedAt: now,
          },
        })

        await tx.traceLink.deleteMany({
          where: {
            OR: [
              { sourceType: 'teaching-plan-lesson', sourceId: existing.id },
              { targetType: 'teaching-plan-lesson', targetId: existing.id },
            ],
          },
        })

        let createdCount = 0
        if (existing.deliveryPlanId) {
          await tx.traceLink.create({
            data: {
              type: 'DELIVERY_TO_LESSON',
              sourceType: 'delivery-plan',
              sourceId: existing.deliveryPlanId,
              targetType: 'teaching-plan-lesson',
              targetId: existing.id,
              evidence: {
                deliveryPlanWeekId: existing.deliveryPlanWeekId,
                lessonWeekNo: existing.weekNo,
                courseStandardTopicRefs: existing.courseStandardTopicRefs,
              },
              severity: 'info',
              createdById: user!.userId,
            },
          })
          createdCount += 1
        }

        for (const asset of existing.coursewareAssets) {
          await tx.traceLink.create({
            data: {
              type: 'LESSON_TO_COURSEWARE',
              sourceType: 'teaching-plan-lesson',
              sourceId: existing.id,
              targetType: 'courseware-asset',
              targetId: asset.id,
              evidence: {
                chapterRef: asset.chapterRef,
                tags: asset.tags,
                ideologicalElements: asset.ideologicalElements,
              },
              severity: 'info',
              createdById: user!.userId,
            },
          })
          createdCount += 1
        }

        return { updated: updatedLesson, traceLinksCreated: createdCount }
      })

      return {
        success: true,
        message: 'Teaching plan lesson published successfully',
        data: {
          ...updated,
          validation,
          traceLinksCreated,
        },
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .delete(
    '/teaching-plan-lessons/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.teachingPlanLesson.findUnique({
        where: { id: params.id },
        include: {
          book: { select: { teacherId: true } },
        },
      })
      if (!existing) {
        set.status = 404
        throw new Error('Teaching plan lesson not found')
      }
      if (user?.role !== 'ADMIN' && existing.book.teacherId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only delete your own teaching plan lessons')
      }

      await prisma.teachingPlanLesson.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Teaching plan lesson deleted successfully',
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .get(
    '/courseware-assets',
    async ({ user, query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.CoursewareAssetWhereInput = {}
      if (user?.role !== 'ADMIN') {
        where.uploadedById = user!.userId
      }
      if (query?.courseOfferingId && typeof query.courseOfferingId === 'string') {
        where.courseOfferingId = query.courseOfferingId
      }
      if (query?.deliveryPlanWeekId && typeof query.deliveryPlanWeekId === 'string') {
        where.deliveryPlanWeekId = query.deliveryPlanWeekId
      }
      if (query?.teachingPlanLessonId && typeof query.teachingPlanLessonId === 'string') {
        where.teachingPlanLessonId = query.teachingPlanLessonId
      }

      const [items, total] = await Promise.all([
        prisma.coursewareAsset.findMany({
          where,
          include: {
            courseOffering: {
              include: {
                course: true,
                semester: true,
              },
            },
            deliveryPlanWeek: {
              select: {
                id: true,
                weekNo: true,
                unitOrTask: true,
              },
            },
            teachingPlanLesson: {
              select: {
                id: true,
                title: true,
                lessonNo: true,
              },
            },
            uploadedBy: {
              select: {
                id: true,
                username: true,
                department: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: [{ createdAt: 'desc' }],
        }),
        prisma.coursewareAsset.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        courseOfferingId: t.Optional(t.String()),
        deliveryPlanWeekId: t.Optional(t.String()),
        teachingPlanLessonId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/courseware-assets',
    async ({ user, body }) => {
      const asset = await prisma.coursewareAsset.create({
        data: {
          title: body.title.trim(),
          fileName: body.fileName.trim(),
          fileUrl: body.fileUrl.trim(),
          mimeType: toOptionalTrimmedString(body.mimeType),
          sizeBytes: body.sizeBytes,
          courseOfferingId: body.courseOfferingId,
          deliveryPlanWeekId: body.deliveryPlanWeekId,
          teachingPlanLessonId: body.teachingPlanLessonId,
          chapterRef: toOptionalTrimmedString(body.chapterRef),
          tags: toUniqueStringArray(body.tags),
          ideologicalElements: toUniqueStringArray(body.ideologicalElements),
          uploadedById: user!.userId,
        },
      })

      return {
        success: true,
        message: 'Courseware asset created successfully',
        data: asset,
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        fileName: t.String({ minLength: 1, maxLength: 255 }),
        fileUrl: t.String({ minLength: 1, maxLength: 1000 }),
        mimeType: t.Optional(t.String()),
        sizeBytes: t.Optional(t.Number({ minimum: 0 })),
        courseOfferingId: t.Optional(t.String()),
        deliveryPlanWeekId: t.Optional(t.String()),
        teachingPlanLessonId: t.Optional(t.String()),
        chapterRef: t.Optional(t.String()),
        tags: t.Optional(t.Array(t.String())),
        ideologicalElements: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .patch(
    '/courseware-assets/:id',
    async ({ user, params, body, set }) => {
      const existing = await prisma.coursewareAsset.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Courseware asset not found')
      }
      if (user?.role !== 'ADMIN' && existing.uploadedById !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only update your own courseware assets')
      }

      const asset = await prisma.coursewareAsset.update({
        where: { id: params.id },
        data: {
          title: body.title ? body.title.trim() : undefined,
          fileName: body.fileName ? body.fileName.trim() : undefined,
          fileUrl: body.fileUrl ? body.fileUrl.trim() : undefined,
          mimeType: body.mimeType !== undefined ? toOptionalTrimmedString(body.mimeType) : undefined,
          sizeBytes: body.sizeBytes,
          courseOfferingId: body.courseOfferingId,
          deliveryPlanWeekId: body.deliveryPlanWeekId,
          teachingPlanLessonId: body.teachingPlanLessonId,
          chapterRef: body.chapterRef !== undefined ? toOptionalTrimmedString(body.chapterRef) : undefined,
          tags: body.tags ? toUniqueStringArray(body.tags) : undefined,
          ideologicalElements: body.ideologicalElements ? toUniqueStringArray(body.ideologicalElements) : undefined,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Courseware asset updated successfully',
        data: asset,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        fileName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        fileUrl: t.Optional(t.String({ minLength: 1, maxLength: 1000 })),
        mimeType: t.Optional(t.String()),
        sizeBytes: t.Optional(t.Number({ minimum: 0 })),
        courseOfferingId: t.Optional(t.String()),
        deliveryPlanWeekId: t.Optional(t.String()),
        teachingPlanLessonId: t.Optional(t.String()),
        chapterRef: t.Optional(t.String()),
        tags: t.Optional(t.Array(t.String())),
        ideologicalElements: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .delete(
    '/courseware-assets/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.coursewareAsset.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Courseware asset not found')
      }
      if (user?.role !== 'ADMIN' && existing.uploadedById !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only delete your own courseware assets')
      }

      await prisma.coursewareAsset.delete({ where: { id: params.id } })
      return {
        success: true,
        message: 'Courseware asset deleted successfully',
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .get(
    '/templates',
    async ({ user, query }) => {
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.TemplateDefinitionWhereInput = {
        isActive: true,
      }

      if (user?.role !== 'ADMIN') {
        where.OR = [{ scope: 'ORG' }, { ownerId: user!.userId }]
      }

      if (query?.docType && isTemplateDocType(query.docType)) {
        where.docType = query.docType
      }
      if (query?.scope && isTemplateScope(query.scope)) {
        where.scope = query.scope
      }

      const [items, total] = await Promise.all([
        prisma.templateDefinition.findMany({
          where,
          include: {
            owner: {
              select: { id: true, username: true, department: true },
            },
            versions: {
              select: {
                id: true,
                version: true,
                status: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { version: 'desc' },
            },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.templateDefinition.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        docType: t.Optional(
          t.Union([
            t.Literal('COURSE_STANDARD'),
            t.Literal('DELIVERY_PLAN'),
            t.Literal('TEACHING_PLAN_BOOK'),
            t.Literal('TEACHING_PLAN_LESSON'),
          ])
        ),
        scope: t.Optional(t.Union([t.Literal('ORG'), t.Literal('PERSONAL')])),
      }),
    }
  )
  .post(
    '/templates',
    async ({ user, body, set }) => {
      const scope = normalizeTemplateScope(body.scope, 'PERSONAL')
      if (scope === 'ORG') {
        ensureAdmin(user?.role, set)
      }

      const definition = await prisma.templateDefinition.create({
        data: {
          docType: normalizeTemplateDocType(body.docType),
          name: body.name.trim(),
          scope,
          ownerId: scope === 'PERSONAL' ? user!.userId : undefined,
          description: toOptionalTrimmedString(body.description),
        },
      })

      return {
        success: true,
        message: 'Template definition created successfully',
        data: definition,
      }
    },
    {
      body: t.Object({
        docType: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1, maxLength: 120 }),
        scope: t.Optional(t.String()),
        description: t.Optional(t.String()),
      }),
    }
  )
  .get(
    '/templates/:id/versions',
    async ({ user, params, query, set }) => {
      const definition = await prisma.templateDefinition.findUnique({ where: { id: params.id } })
      if (!definition || !definition.isActive) {
        set.status = 404
        throw new Error('Template definition not found')
      }

      if (definition.scope === 'PERSONAL' && user?.role !== 'ADMIN' && definition.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only access your own personal templates')
      }

      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.TemplateVersionWhereInput = {
        templateId: params.id,
      }

      const [items, total] = await Promise.all([
        prisma.templateVersion.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ version: 'desc' }],
          include: {
            publishedBy: {
              select: { id: true, username: true, department: true },
            },
          },
        }),
        prisma.templateVersion.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/templates/:id/versions',
    async ({ user, params, body, set }) => {
      const definition = await prisma.templateDefinition.findUnique({ where: { id: params.id } })
      if (!definition || !definition.isActive) {
        set.status = 404
        throw new Error('Template definition not found')
      }

      if (definition.scope === 'ORG') {
        ensureAdmin(user?.role, set)
      } else if (user?.role !== 'ADMIN' && definition.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only create versions for your own personal templates')
      }

      const latest = await prisma.templateVersion.findFirst({
        where: { templateId: params.id },
        orderBy: { version: 'desc' },
        select: { version: true },
      })
      const nextVersion = (latest?.version || 0) + 1

      const version = await prisma.templateVersion.create({
        data: {
          templateId: params.id,
          version: nextVersion,
          schemaJson: body.schemaJson,
          defaultContentJson: body.defaultContentJson,
          status: normalizeTemplateStatus(body.status, 'DRAFT'),
          publishedById: normalizeTemplateStatus(body.status, 'DRAFT') === 'PUBLISHED' ? user!.userId : undefined,
          publishedAt: normalizeTemplateStatus(body.status, 'DRAFT') === 'PUBLISHED' ? new Date() : undefined,
        },
      })

      return {
        success: true,
        message: 'Template version created successfully',
        data: version,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        schemaJson: t.Any(),
        defaultContentJson: t.Optional(t.Any()),
        status: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/templates/:id/publish-version',
    async ({ user, params, body, set }) => {
      const definition = await prisma.templateDefinition.findUnique({ where: { id: params.id } })
      if (!definition || !definition.isActive) {
        set.status = 404
        throw new Error('Template definition not found')
      }

      if (definition.scope === 'ORG') {
        ensureAdmin(user?.role, set)
      } else if (user?.role !== 'ADMIN' && definition.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only publish your own personal templates')
      }

      const target = await prisma.templateVersion.findUnique({ where: { id: body.versionId } })
      if (!target || target.templateId !== params.id) {
        set.status = 404
        throw new Error('Template version not found')
      }

      const version = await prisma.templateVersion.update({
        where: { id: body.versionId },
        data: {
          status: 'PUBLISHED',
          publishedById: user!.userId,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Template version published successfully',
        data: version,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        versionId: t.String(),
      }),
    }
  )
  .delete(
    '/templates/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.templateDefinition.findUnique({ where: { id: params.id } })
      if (!existing || !existing.isActive) {
        set.status = 404
        throw new Error('Template definition not found')
      }

      if (existing.scope === 'ORG') {
        ensureAdmin(user?.role, set)
      } else if (user?.role !== 'ADMIN' && existing.ownerId !== user?.userId) {
        set.status = 403
        throw new Error('Forbidden: You can only delete your own personal templates')
      }

      await prisma.templateDefinition.update({
        where: { id: params.id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Template definition archived successfully',
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .post(
    '/traceability/links',
    async ({ user, body }) => {
      const link = await prisma.traceLink.create({
        data: {
          type: normalizeTraceLinkType(body.type),
          sourceType: body.sourceType.trim(),
          sourceId: body.sourceId,
          targetType: body.targetType.trim(),
          targetId: body.targetId,
          evidence: body.evidence,
          severity: toOptionalTrimmedString(body.severity),
          createdById: user!.userId,
        },
      })

      return {
        success: true,
        message: 'Trace link created successfully',
        data: link,
      }
    },
    {
      body: t.Object({
        type: t.String(),
        sourceType: t.String({ minLength: 1, maxLength: 100 }),
        sourceId: t.String(),
        targetType: t.String({ minLength: 1, maxLength: 100 }),
        targetId: t.String(),
        evidence: t.Optional(t.Any()),
        severity: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/traceability/validate',
    async ({ user, body, set }) => {
      const result = createValidationResult()

      if (body.type === 'delivery-plan') {
        const deliveryPlan = await prisma.deliveryPlan.findUnique({
          where: { id: body.id },
          include: {
            weeks: true,
            courseStandard: {
              include: {
                modules: {
                  include: {
                    topics: {
                      select: {
                        id: true,
                        ideologicalElements: true,
                        integrationMethods: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!deliveryPlan) {
          set.status = 404
          throw new Error('Delivery plan not found')
        }

        if (user?.role !== 'ADMIN' && deliveryPlan.ownerId !== user?.userId) {
          set.status = 403
          throw new Error('Forbidden: You can only validate your own delivery plans')
        }

        const validTopicIds = deliveryPlan.courseStandard
          ? new Set(deliveryPlan.courseStandard.modules.flatMap((module) => module.topics.map((topic) => topic.id)))
          : null
        const topicIdeologicalMappings = deliveryPlan.courseStandard
          ? buildTopicIdeologicalMappings(deliveryPlan.courseStandard.modules)
          : null
        const validation = ensureDeliveryPlanValidation(
          deliveryPlan.weeks,
          validTopicIds,
          topicIdeologicalMappings,
          deliveryPlan.courseStandard?.status || null
        )
        result.blockers.push(...validation.blockers)
        result.warnings.push(...validation.warnings)
      } else if (body.type === 'course-standard') {
        const standard = await prisma.courseStandard.findUnique({
          where: { id: body.id },
          include: {
            modules: {
              include: { topics: true },
            },
          },
        })

        if (!standard) {
          set.status = 404
          throw new Error('Course standard not found')
        }

        if (user?.role !== 'ADMIN' && standard.ownerId !== user?.userId) {
          set.status = 403
          throw new Error('Forbidden: You can only validate your own course standards')
        }

        const validation = ensureCourseStandardValidation(
          standard.modules.map((module) => ({
            topics: module.topics.map((topic) => ({
              ideologicalElements: topic.ideologicalElements,
              integrationMethods: topic.integrationMethods,
            })),
          }))
        )
        result.blockers.push(...validation.blockers)
        result.warnings.push(...validation.warnings)
      } else if (body.type === 'teaching-plan-lesson') {
        const lesson = await prisma.teachingPlanLesson.findUnique({
          where: { id: body.id },
          include: {
            book: {
              select: {
                teacherId: true,
                courseOfferingId: true,
              },
            },
            deliveryPlan: {
              include: {
                weeks: {
                  select: {
                    hours: true,
                    ideologicalElements: true,
                  },
                },
                courseStandard: {
                  include: {
                    modules: {
                      include: {
                        topics: {
                          select: {
                            id: true,
                            ideologicalElements: true,
                            integrationMethods: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            deliveryPlanWeek: true,
            coursewareAssets: true,
          },
        })

        if (!lesson) {
          set.status = 404
          throw new Error('Teaching plan lesson not found')
        }

        if (user?.role !== 'ADMIN' && lesson.book.teacherId !== user?.userId) {
          set.status = 403
          throw new Error('Forbidden: You can only validate your own teaching plan lessons')
        }

        const validTopicIds = lesson.deliveryPlan?.courseStandard
          ? new Set(lesson.deliveryPlan.courseStandard.modules.flatMap((module) => module.topics.map((topic) => topic.id)))
          : null
        const topicIdeologicalMappings = lesson.deliveryPlan?.courseStandard
          ? buildTopicIdeologicalMappings(lesson.deliveryPlan.courseStandard.modules)
          : null

        const validation = ensureLessonValidation({
          lesson: {
            deliveryPlanId: lesson.deliveryPlanId,
            deliveryPlanWeekId: lesson.deliveryPlanWeekId,
            ideologicalElements: lesson.ideologicalElements,
            integrationMethod: lesson.integrationMethod,
            courseStandardTopicRefs: lesson.courseStandardTopicRefs,
            deliveryPlanWeek: lesson.deliveryPlanWeek
              ? {
                  weekNo: lesson.deliveryPlanWeek.weekNo,
                  linkedStandardTopicIds: lesson.deliveryPlanWeek.linkedStandardTopicIds,
                  ideologicalElements: lesson.deliveryPlanWeek.ideologicalElements,
                  integrationMethod: lesson.deliveryPlanWeek.integrationMethod,
                }
              : null,
            coursewareAssets: lesson.coursewareAssets,
            deliveryPlanWeeks: lesson.deliveryPlan?.weeks || [],
          },
          validTopicIds,
          topicIdeologicalMappings,
          upstreamStatuses: {
            deliveryPlanStatus: lesson.deliveryPlan?.status || null,
            courseStandardStatus: lesson.deliveryPlan?.courseStandard?.status || null,
          },
        })
        result.blockers.push(...validation.blockers)
        result.warnings.push(...validation.warnings)
      } else {
        set.status = 422
        throw new Error('Validation type must be one of: course-standard, delivery-plan, teaching-plan-lesson')
      }

      return {
        success: true,
        data: {
          passed: result.blockers.length === 0,
          blockers: result.blockers,
          warnings: result.warnings,
        },
      }
    },
    {
      body: t.Object({
        type: t.String({ minLength: 1 }),
        id: t.String(),
      }),
    }
  )
  .get(
    '/migration/legacy-mappings',
    async ({ user, query, set }) => {
      ensureAdmin(user?.role, set)
      const { page, limit, skip } = parsePagination(query)
      const where: Prisma.LegacyMappingQueueWhereInput = {}
      if (query?.status) {
        where.status = normalizeLegacyMappingStatus(query.status)
      }

      const [items, total] = await Promise.all([
        prisma.legacyMappingQueue.findMany({
          where,
          include: {
            legacyTeachingPlan: {
              select: {
                id: true,
                title: true,
                courseName: true,
                className: true,
                status: true,
                updatedAt: true,
              },
            },
            suggestedCourseOffering: {
              include: {
                course: true,
                semester: true,
                teacher: {
                  select: { id: true, username: true, department: true },
                },
              },
            },
            suggestedSemester: true,
            reviewedBy: {
              select: { id: true, username: true, department: true },
            },
          },
          skip,
          take: limit,
          orderBy: [{ updatedAt: 'desc' }],
        }),
        prisma.legacyMappingQueue.count({ where }),
      ])

      return {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        status: t.Optional(t.Union([t.Literal('PENDING'), t.Literal('CONFIRMED'), t.Literal('REJECTED')])),
      }),
    }
  )
  .post(
    '/migration/legacy-mappings/generate',
    async ({ user, set }) => {
      ensureAdmin(user?.role, set)

      const candidates = await prisma.teachingPlan.findMany({
        where: {
          legacyMappingQueue: null,
        },
        select: {
          id: true,
          courseName: true,
          className: true,
        },
      })

      let created = 0
      for (const plan of candidates) {
        const offering = await prisma.courseOffering.findFirst({
          where: {
            className: plan.className,
            OR: [
              { course: { name: { contains: plan.courseName } } },
              { course: { code: { contains: plan.courseName } } },
            ],
          },
          include: {
            semester: {
              select: { id: true },
            },
          },
        })

        await prisma.legacyMappingQueue.create({
          data: {
            legacyTeachingPlanId: plan.id,
            suggestedCourseOfferingId: offering?.id,
            suggestedSemesterId: offering?.semester.id,
            confidence: offering ? 0.85 : 0.1,
            status: 'PENDING',
          },
        })
        created += 1
      }

      return {
        success: true,
        message: 'Legacy mapping queue generated successfully',
        data: {
          created,
        },
      }
    }
  )
  .post(
    '/migration/legacy-mappings/:id/confirm',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)

      const existing = await prisma.legacyMappingQueue.findUnique({
        where: { id: params.id },
      })
      if (!existing) {
        set.status = 404
        throw new Error('Legacy mapping item not found')
      }

      const resolvedCourseOfferingId = body.courseOfferingId || existing.suggestedCourseOfferingId
      if (!resolvedCourseOfferingId) {
        set.status = 422
        throw new Error('Confirm requires a resolved courseOfferingId')
      }

      const updated = await prisma.$transaction(async (tx) => {
        const legacyPlan = await tx.teachingPlan.findUnique({
          where: { id: existing.legacyTeachingPlanId },
          select: {
            id: true,
            title: true,
            courseName: true,
            className: true,
            duration: true,
            objectives: true,
            keyPoints: true,
            process: true,
            reflection: true,
            methods: true,
            contentJson: true,
            status: true,
            teacherId: true,
            courseOfferingId: true,
            deliveryPlanId: true,
            deliveryWeekNo: true,
            planBookId: true,
            courseStandardRefs: true,
            ideologicalElements: true,
            integrationMethod: true,
          },
        })
        if (!legacyPlan) {
          throw new Error('Legacy teaching plan not found')
        }

        const offering = await tx.courseOffering.findUnique({
          where: { id: resolvedCourseOfferingId },
          select: {
            id: true,
            semesterId: true,
            weeklyHours: true,
            className: true,
            teacherId: true,
          },
        })
        if (!offering) {
          throw new Error('Course offering not found')
        }

        const resolvedSemesterId = body.semesterId || existing.suggestedSemesterId || offering.semesterId
        if (!resolvedSemesterId) {
          throw new Error('Confirm requires a resolved semesterId')
        }

        let targetBookId = legacyPlan.planBookId
        if (!targetBookId) {
          const createdBook = await tx.teachingPlanBook.create({
            data: {
              title: `${legacyPlan.courseName}教案册（迁移）`,
              courseOfferingId: resolvedCourseOfferingId,
              semesterId: resolvedSemesterId,
              teacherId: legacyPlan.teacherId,
              teacherName: '历史数据迁移',
              targetClass: legacyPlan.className,
              totalHours: legacyPlan.duration,
              weeklyHours: offering.weeklyHours || undefined,
              status:
                legacyPlan.status === 'PUBLISHED'
                  ? 'PUBLISHED'
                  : legacyPlan.status === 'ARCHIVED'
                    ? 'ARCHIVED'
                    : 'DRAFT',
            },
            select: { id: true },
          })
          targetBookId = createdBook.id
        }

        let deliveryPlanWeekId: string | undefined = undefined
        if (legacyPlan.deliveryPlanId && legacyPlan.deliveryWeekNo) {
          const matchedWeek = await tx.deliveryPlanWeek.findFirst({
            where: {
              deliveryPlanId: legacyPlan.deliveryPlanId,
              weekNo: legacyPlan.deliveryWeekNo,
            },
            select: { id: true },
          })
          deliveryPlanWeekId = matchedWeek?.id
        }

        const existingLesson = await tx.teachingPlanLesson.findFirst({
          where: {
            bookId: targetBookId,
            title: legacyPlan.title,
            lessonNo: legacyPlan.deliveryWeekNo || 1,
          },
          select: { id: true },
        })

        let migratedLessonId = existingLesson?.id
        if (!migratedLessonId) {
          const maxLesson = await tx.teachingPlanLesson.findFirst({
            where: { bookId: targetBookId },
            orderBy: { lessonNo: 'desc' },
            select: { lessonNo: true },
          })
          const nextLessonNo = legacyPlan.deliveryWeekNo || (maxLesson?.lessonNo || 0) + 1

          const createdLesson = await tx.teachingPlanLesson.create({
            data: {
              bookId: targetBookId,
              lessonNo: nextLessonNo,
              title: legacyPlan.title,
              className: legacyPlan.className,
              weekNo: legacyPlan.deliveryWeekNo || undefined,
              duration: legacyPlan.duration,
              objectives: legacyPlan.objectives,
              keyPoints: legacyPlan.keyPoints,
              outline: legacyPlan.process,
              reflection: legacyPlan.reflection || undefined,
              methods: legacyPlan.methods || undefined,
              contentJson: legacyPlan.contentJson || undefined,
              status:
                legacyPlan.status === 'PUBLISHED'
                  ? 'PUBLISHED'
                  : legacyPlan.status === 'ARCHIVED'
                    ? 'ARCHIVED'
                    : 'DRAFT',
              deliveryPlanId: legacyPlan.deliveryPlanId || undefined,
              deliveryPlanWeekId,
              courseStandardTopicRefs: legacyPlan.courseStandardRefs || [],
              ideologicalElements: legacyPlan.ideologicalElements || undefined,
              integrationMethod: legacyPlan.integrationMethod || undefined,
            },
            select: { id: true },
          })
          migratedLessonId = createdLesson.id
        }

        const queueItem = await tx.legacyMappingQueue.update({
          where: { id: params.id },
          data: {
            status: 'CONFIRMED',
            suggestedCourseOfferingId: resolvedCourseOfferingId,
            suggestedSemesterId: resolvedSemesterId,
            note: body.note,
            reviewedById: user!.userId,
            updatedAt: new Date(),
          },
        })

        await tx.teachingPlan.update({
          where: { id: existing.legacyTeachingPlanId },
          data: {
            courseOfferingId: resolvedCourseOfferingId,
            planBookId: targetBookId,
            updatedAt: new Date(),
          },
        })

        return {
          ...queueItem,
          migratedBookId: targetBookId,
          migratedLessonId,
        }
      })

      return {
        success: true,
        message: 'Legacy mapping confirmed successfully',
        data: updated,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        courseOfferingId: t.Optional(t.String()),
        semesterId: t.Optional(t.String()),
        note: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/migration/legacy-mappings/:id/reject',
    async ({ user, params, body, set }) => {
      ensureAdmin(user?.role, set)

      const existing = await prisma.legacyMappingQueue.findUnique({ where: { id: params.id } })
      if (!existing) {
        set.status = 404
        throw new Error('Legacy mapping item not found')
      }

      const updated = await prisma.legacyMappingQueue.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          note: body.note,
          reviewedById: user!.userId,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Legacy mapping rejected successfully',
        data: updated,
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        note: t.Optional(t.String()),
      }),
    }
  )
