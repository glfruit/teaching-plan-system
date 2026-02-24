import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { Elysia } from 'elysia'
import { authMiddleware } from '../middleware/auth'
import { authRoutes } from './auth'
import { academicRoutes } from './academic'
import { prisma } from '../lib/prisma'
import { describeWithDatabase } from '../test-utils/withDatabase'

describeWithDatabase('Academic API', () => {
  const app = new Elysia().use(authMiddleware).use(authRoutes).use(academicRoutes)

  let adminToken = ''
  let teacherToken = ''
  let adminId = ''
  let teacherId = ''

  let semesterId = ''
  let courseId = ''
  let offeringId = ''
  let standardId = ''
  let deliveryPlanId = ''
  let deliveryWeekId = ''
  let bookId = ''
  let lessonId = ''
  let legacyPlanIdA = ''
  let legacyPlanIdB = ''
  let managedUserId = ''

  beforeAll(async () => {
    await prisma.traceLink.deleteMany({
      where: {
        createdBy: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.coursewareAsset.deleteMany({
      where: {
        uploadedBy: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.legacyMappingQueue.deleteMany({
      where: {
        legacyTeachingPlan: {
          teacher: {
            username: { in: ['academic_admin', 'academic_teacher'] },
          },
        },
      },
    })
    await prisma.templateVersion.deleteMany({
      where: {
        template: {
          name: { startsWith: 'ACAD-TPL-TEST' },
        },
      },
    })
    await prisma.templateDefinition.deleteMany({
      where: {
        name: { startsWith: 'ACAD-TPL-TEST' },
      },
    })
    await prisma.teachingPlan.deleteMany({
      where: {
        teacher: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.teachingPlanLesson.deleteMany({
      where: {
        book: {
          teacher: {
            username: { in: ['academic_admin', 'academic_teacher'] },
          },
        },
      },
    })
    await prisma.teachingPlanBook.deleteMany({
      where: {
        teacher: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.deliveryPlanWeek.deleteMany({
      where: {
        deliveryPlan: {
          owner: {
            username: { in: ['academic_admin', 'academic_teacher'] },
          },
        },
      },
    })
    await prisma.deliveryPlan.deleteMany({
      where: {
        owner: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.courseStandardTopic.deleteMany({
      where: {
        module: {
          standard: {
            owner: {
              username: { in: ['academic_admin', 'academic_teacher'] },
            },
          },
        },
      },
    })
    await prisma.courseStandardModule.deleteMany({
      where: {
        standard: {
          owner: {
            username: { in: ['academic_admin', 'academic_teacher'] },
          },
        },
      },
    })
    await prisma.courseStandard.deleteMany({
      where: {
        owner: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.courseOffering.deleteMany({
      where: {
        teacher: {
          username: { in: ['academic_admin', 'academic_teacher'] },
        },
      },
    })
    await prisma.course.deleteMany({
      where: {
        code: { in: ['ACAD-101'] },
      },
    })
    await prisma.semester.deleteMany({
      where: {
        name: { in: ['2026-2027学年第1学期（测试）'] },
      },
    })
    await prisma.user.deleteMany({
      where: {
        username: { in: ['academic_admin', 'academic_teacher', 'academic_user_manage'] },
      },
    })

    const registerAdminResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'academic_admin',
          email: 'academic_admin@example.com',
          password: 'password123',
          role: 'ADMIN',
          department: '教务处',
        }),
      })
    )
    const registerAdminData: any = await registerAdminResponse.json()
    adminToken = registerAdminData.data.accessToken
    adminId = registerAdminData.data.user.id

    const registerTeacherResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'academic_teacher',
          email: 'academic_teacher@example.com',
          password: 'password123',
          role: 'TEACHER',
          department: '信息工程学院',
        }),
      })
    )
    const registerTeacherData: any = await registerTeacherResponse.json()
    teacherToken = registerTeacherData.data.accessToken
    teacherId = registerTeacherData.data.user.id
  })

  afterAll(async () => {
    await prisma.traceLink.deleteMany({
      where: {
        createdById: { in: [adminId, teacherId].filter(Boolean) as string[] },
      },
    })
    await prisma.legacyMappingQueue.deleteMany({
      where: {
        legacyTeachingPlan: {
          teacherId: { in: [adminId, teacherId].filter(Boolean) as string[] },
        },
      },
    })
    await prisma.templateVersion.deleteMany({
      where: {
        template: {
          name: { startsWith: 'ACAD-TPL-TEST' },
        },
      },
    })
    await prisma.templateDefinition.deleteMany({
      where: {
        name: { startsWith: 'ACAD-TPL-TEST' },
      },
    })
    await prisma.teachingPlan.deleteMany({
      where: {
        teacherId: { in: [adminId, teacherId].filter(Boolean) as string[] },
      },
    })
    await prisma.coursewareAsset.deleteMany({
      where: {
        uploadedById: { in: [adminId, teacherId].filter(Boolean) as string[] },
      },
    })
    await prisma.teachingPlanLesson.deleteMany({
      where: {
        book: {
          teacherId: { in: [adminId, teacherId].filter(Boolean) as string[] },
        },
      },
    })
    await prisma.teachingPlanBook.deleteMany({
      where: {
        teacherId: { in: [adminId, teacherId].filter(Boolean) as string[] },
      },
    })
    if (deliveryPlanId) {
      await prisma.deliveryPlanWeek.deleteMany({ where: { deliveryPlanId } })
      await prisma.deliveryPlan.deleteMany({ where: { id: deliveryPlanId } })
    }
    if (standardId) {
      await prisma.courseStandardTopic.deleteMany({
        where: {
          module: {
            standardId,
          },
        },
      })
      await prisma.courseStandardModule.deleteMany({ where: { standardId } })
      await prisma.courseStandard.deleteMany({ where: { id: standardId } })
    }
    if (offeringId) {
      await prisma.courseOffering.deleteMany({ where: { id: offeringId } })
    }
    if (courseId) {
      await prisma.course.deleteMany({ where: { id: courseId } })
    }
    if (semesterId) {
      await prisma.semester.deleteMany({ where: { id: semesterId } })
    }
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminId, teacherId, managedUserId].filter(Boolean) as string[] },
      },
    })
  })

  it('should allow admin to create semester/course/offering and block teacher', async () => {
    const teacherCreateSemester = await app.handle(
      new Request('http://localhost/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          name: '2026-2027学年第1学期（测试）',
          startDate: new Date('2026-09-01T00:00:00.000Z').toISOString(),
          endDate: new Date('2027-01-20T00:00:00.000Z').toISOString(),
          status: 'PLANNING',
        }),
      })
    )
    expect(teacherCreateSemester.status).toBe(403)

    const adminCreateSemester = await app.handle(
      new Request('http://localhost/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: '2026-2027学年第1学期（测试）',
          startDate: new Date('2026-09-01T00:00:00.000Z').toISOString(),
          endDate: new Date('2027-01-20T00:00:00.000Z').toISOString(),
          status: 'ACTIVE',
        }),
      })
    )
    expect(adminCreateSemester.status).toBe(200)
    const semesterData: any = await adminCreateSemester.json()
    semesterId = semesterData.data.id

    const createCourse = await app.handle(
      new Request('http://localhost/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          code: 'ACAD-101',
          name: '课程标准与教案一体化实践',
          department: '信息工程学院',
          ownerTeacherId: teacherId,
          status: 'ACTIVE',
        }),
      })
    )
    expect(createCourse.status).toBe(200)
    const courseData: any = await createCourse.json()
    courseId = courseData.data.id

    const createOffering = await app.handle(
      new Request('http://localhost/course-offerings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          courseId,
          semesterId,
          className: '信息工程2401班',
          teacherId,
          weeklyHours: 4,
          totalWeeks: 16,
          status: 'ACTIVE',
        }),
      })
    )
    expect(createOffering.status).toBe(200)
    const offeringData: any = await createOffering.json()
    offeringId = offeringData.data.id
  })

  it('should support admin user management and block teacher access', async () => {
    const createManagedUser = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'academic_user_manage',
          email: 'academic_user_manage@example.com',
          password: 'password123',
          role: 'TEACHER',
          department: '经济管理学院',
        }),
      })
    )
    expect(createManagedUser.status).toBe(200)
    const managedUserData: any = await createManagedUser.json()
    managedUserId = managedUserData.data.user.id

    const teacherListUsers = await app.handle(
      new Request('http://localhost/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(teacherListUsers.status).toBe(403)

    const adminListUsers = await app.handle(
      new Request('http://localhost/users?search=academic_user_manage', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })
    )
    expect(adminListUsers.status).toBe(200)
    const adminListUsersData: any = await adminListUsers.json()
    expect(adminListUsersData.data.items.some((item: any) => item.id === managedUserId)).toBe(true)

    const updateManagedUser = await app.handle(
      new Request(`http://localhost/users/${managedUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          role: 'ADMIN',
          department: '教务处',
        }),
      })
    )
    expect(updateManagedUser.status).toBe(200)
    const updateManagedUserData: any = await updateManagedUser.json()
    expect(updateManagedUserData.data.role).toBe('ADMIN')
    expect(updateManagedUserData.data.department).toBe('教务处')

    const resetPassword = await app.handle(
      new Request(`http://localhost/users/${managedUserId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          newPassword: 'newpass123',
        }),
      })
    )
    expect(resetPassword.status).toBe(200)

    const relogin = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'academic_user_manage',
          password: 'newpass123',
        }),
      })
    )
    expect(relogin.status).toBe(200)
    const reloginData: any = await relogin.json()
    expect(reloginData.data.user.role).toBe('ADMIN')
  })

  it('should create standard -> delivery plan -> lesson chain and validate traceability', async () => {
    const createStandard = await app.handle(
      new Request('http://localhost/course-standards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '课程标准（测试）',
          courseId,
          semesterId,
          htmlContent: '<p>课程标准测试内容</p>',
          modules: [
            {
              name: '模块一',
              topics: [
                {
                  title: '主题1',
                  recommendedHours: 8,
                  ideologicalElements: ['工匠精神'],
                  integrationMethods: ['案例讨论'],
                  applicableMajors: ['软件技术'],
                },
              ],
            },
          ],
        }),
      })
    )
    expect(createStandard.status).toBe(200)
    const standardData: any = await createStandard.json()
    standardId = standardData.data.id
    const topicId = standardData.data.modules[0].topics[0].id

    const createDeliveryPlan = await app.handle(
      new Request('http://localhost/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '授课计划（测试）',
          courseOfferingId: offeringId,
          courseStandardId: standardId,
          weeks: [
            {
              weekNo: 1,
              hours: 4,
              teachingMode: '讲授+实训',
              unitOrTask: '绪论与职业素养',
              ideologicalElements: '工匠精神',
              integrationMethod: '案例讨论',
              theoreticalPoints: '课程目标与学习路径',
              practiceProject: '学习任务拆解演练',
              practiceInstructor: '测试教师',
              linkedStandardTopicIds: [topicId],
            },
          ],
        }),
      })
    )
    expect(createDeliveryPlan.status).toBe(200)
    const deliveryData: any = await createDeliveryPlan.json()
    deliveryPlanId = deliveryData.data.id

    const updateWeeks = await app.handle(
      new Request(`http://localhost/delivery-plans/${deliveryPlanId}/weeks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          weeks: [
            {
              weekNo: 1,
              hours: 4,
              teachingMode: '讲授+实训',
              unitOrTask: '绪论与职业素养',
              ideologicalElements: '工匠精神',
              integrationMethod: '案例讨论',
              theoreticalPoints: '课程目标与学习路径',
              practiceProject: '学习任务拆解演练',
              practiceInstructor: '测试教师',
              linkedStandardTopicIds: [topicId],
            },
          ],
        }),
      })
    )
    expect(updateWeeks.status).toBe(200)
    const weekData: any = await updateWeeks.json()
    deliveryWeekId = weekData.data.weeks[0].id
    expect(weekData.data.weeks[0].teachingMode).toBe('讲授+实训')
    expect(weekData.data.weeks[0].theoreticalPoints).toContain('课程目标')
    expect(weekData.data.weeks[0].practiceProject).toContain('任务拆解')
    expect(weekData.data.weeks[0].practiceInstructor).toBe('测试教师')

    const createBook = await app.handle(
      new Request('http://localhost/teaching-plan-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '教师授课教案册（测试）',
          courseOfferingId: offeringId,
          semesterId,
          teacherName: '测试教师',
          targetClass: '信息工程2401班',
          totalHours: 64,
          weeklyHours: 4,
          status: 'DRAFT',
        }),
      })
    )
    expect(createBook.status).toBe(200)
    const bookData: any = await createBook.json()
    bookId = bookData.data.id

    const createLesson = await app.handle(
      new Request('http://localhost/teaching-plan-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          bookId,
          lessonNo: 1,
          title: '第1次课：课程导学',
          weekNo: 1,
          duration: 90,
          objectives: '理解课程标准、掌握课程学习路径',
          outline: '一、课程导学；二、学习方法；三、任务布置',
          ideologicalElements: '工匠精神',
          integrationMethod: '案例讨论',
          deliveryPlanId,
          deliveryPlanWeekId: deliveryWeekId,
          courseStandardTopicRefs: [topicId],
        }),
      })
    )
    expect(createLesson.status).toBe(200)
    const lessonData: any = await createLesson.json()
    lessonId = lessonData.data.id

    const getLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${lessonId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(getLesson.status).toBe(200)
    const getLessonData: any = await getLesson.json()
    expect(getLessonData.data.id).toBe(lessonId)
    expect(getLessonData.data.title).toContain('课程导学')

    const validateDelivery = await app.handle(
      new Request('http://localhost/traceability/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          type: 'delivery-plan',
          id: deliveryPlanId,
        }),
      })
    )
    expect(validateDelivery.status).toBe(200)
    const validateDeliveryData: any = await validateDelivery.json()
    expect(validateDeliveryData.data.passed).toBe(true)

    const validateLesson = await app.handle(
      new Request('http://localhost/traceability/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          type: 'teaching-plan-lesson',
          id: lessonId,
        }),
      })
    )
    expect(validateLesson.status).toBe(200)
    const validateLessonData: any = await validateLesson.json()
    expect(validateLessonData.data.blockers.length).toBe(0)
  })

  it('should warn traceability validation when upstream documents are not published', async () => {
    const validateDelivery = await app.handle(
      new Request('http://localhost/traceability/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          type: 'delivery-plan',
          id: deliveryPlanId,
        }),
      })
    )
    expect(validateDelivery.status).toBe(200)
    const validateDeliveryData: any = await validateDelivery.json()
    expect(validateDeliveryData.data.warnings).toContain('关联课程标准尚未发布，存在版本漂移风险')

    const validateLesson = await app.handle(
      new Request('http://localhost/traceability/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          type: 'teaching-plan-lesson',
          id: lessonId,
        }),
      })
    )
    expect(validateLesson.status).toBe(200)
    const validateLessonData: any = await validateLesson.json()
    expect(validateLessonData.data.warnings).toContain('关联授课计划尚未发布，存在版本漂移风险')
    expect(validateLessonData.data.warnings).toContain('关联课程标准尚未发布，存在版本漂移风险')
  })

  it('should persist trace links when lesson is published', async () => {
    const createCourseware = await app.handle(
      new Request('http://localhost/courseware-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '第1周课件（TraceLink测试）',
          fileName: 'week1-tracelink.pptx',
          fileUrl: 'https://example.com/week1-tracelink.pptx',
          teachingPlanLessonId: lessonId,
          courseOfferingId: offeringId,
          chapterRef: '模块一-主题1',
          tags: ['课件'],
          ideologicalElements: ['工匠精神'],
        }),
      })
    )
    expect(createCourseware.status).toBe(200)
    const coursewareData: any = await createCourseware.json()
    const coursewareId = coursewareData.data.id

    const publishLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${lessonId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(publishLesson.status).toBe(200)
    const publishLessonData: any = await publishLesson.json()
    expect(publishLessonData.data.traceLinksCreated).toBe(2)

    const deliveryToLessonLinks = await prisma.traceLink.findMany({
      where: {
        type: 'DELIVERY_TO_LESSON',
        targetType: 'teaching-plan-lesson',
        targetId: lessonId,
      },
    })
    expect(deliveryToLessonLinks.length).toBe(1)
    const deliveryToLessonLink = deliveryToLessonLinks[0]
    expect(deliveryToLessonLink).toBeDefined()
    expect(deliveryToLessonLink?.sourceType).toBe('delivery-plan')
    expect(deliveryToLessonLink?.sourceId).toBe(deliveryPlanId)

    const lessonToCoursewareLinks = await prisma.traceLink.findMany({
      where: {
        type: 'LESSON_TO_COURSEWARE',
        sourceType: 'teaching-plan-lesson',
        sourceId: lessonId,
      },
    })
    expect(lessonToCoursewareLinks.length).toBe(1)
    const lessonToCoursewareLink = lessonToCoursewareLinks[0]
    expect(lessonToCoursewareLink).toBeDefined()
    expect(lessonToCoursewareLink?.targetType).toBe('courseware-asset')
    expect(lessonToCoursewareLink?.targetId).toBe(coursewareId)
  })

  it('should persist standard-to-delivery trace link when delivery plan is published', async () => {
    const publishDelivery = await app.handle(
      new Request(`http://localhost/delivery-plans/${deliveryPlanId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(publishDelivery.status).toBe(200)
    const publishDeliveryData: any = await publishDelivery.json()
    expect(publishDeliveryData.data.traceLinksCreated).toBe(1)

    const standardToDeliveryLinks = await prisma.traceLink.findMany({
      where: {
        type: 'STANDARD_TO_DELIVERY',
        targetType: 'delivery-plan',
        targetId: deliveryPlanId,
      },
    })
    expect(standardToDeliveryLinks.length).toBe(1)
    const standardToDeliveryLink = standardToDeliveryLinks[0]
    expect(standardToDeliveryLink).toBeDefined()
    expect(standardToDeliveryLink?.sourceType).toBe('course-standard')
    expect(standardToDeliveryLink?.sourceId).toBe(standardId)
  })

  it('should block publish when course standard topics miss ideological mappings', async () => {
    const createInvalidStandard = await app.handle(
      new Request('http://localhost/course-standards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '课程标准（发布阻断测试）',
          courseId,
          semesterId,
          htmlContent: '<p>课程标准测试内容</p>',
          modules: [
            {
              name: '模块一',
              topics: [
                {
                  title: '主题A',
                  recommendedHours: 4,
                  ideologicalElements: [],
                  integrationMethods: [],
                },
              ],
            },
          ],
        }),
      })
    )
    expect(createInvalidStandard.status).toBe(200)
    const invalidStandardData: any = await createInvalidStandard.json()

    const publishInvalidStandard = await app.handle(
      new Request(`http://localhost/course-standards/${invalidStandardData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )

    expect(publishInvalidStandard.status).toBe(422)
    const publishInvalidStandardText = await publishInvalidStandard.text()
    expect(publishInvalidStandardText).toContain('思政')
  })

  it('should block publish when delivery plan weeks miss standard topic links', async () => {
    const createInvalidDelivery = await app.handle(
      new Request('http://localhost/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '授课计划（发布阻断测试）',
          courseOfferingId: offeringId,
          courseStandardId: standardId,
          weeks: [
            {
              weekNo: 2,
              hours: 4,
              unitOrTask: '基础理论',
              ideologicalElements: '工匠精神',
              integrationMethod: '案例讨论',
              linkedStandardTopicIds: [],
            },
          ],
        }),
      })
    )
    expect(createInvalidDelivery.status).toBe(200)
    const invalidDeliveryData: any = await createInvalidDelivery.json()

    const publishInvalidDelivery = await app.handle(
      new Request(`http://localhost/delivery-plans/${invalidDeliveryData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )

    expect(publishInvalidDelivery.status).toBe(422)
    const publishInvalidDeliveryText = await publishInvalidDelivery.text()
    expect(publishInvalidDeliveryText).toContain('关联')
  })

  it('should block delivery plan publish when ideological mapping mismatches linked standard topics', async () => {
    const getStandard = await app.handle(
      new Request(`http://localhost/course-standards/${standardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(getStandard.status).toBe(200)
    const standardData: any = await getStandard.json()
    const topicId = standardData.data.modules?.[0]?.topics?.[0]?.id
    expect(typeof topicId).toBe('string')

    const createInvalidDelivery = await app.handle(
      new Request('http://localhost/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '授课计划（思政映证冲突测试）',
          courseOfferingId: offeringId,
          courseStandardId: standardId,
          weeks: [
            {
              weekNo: 4,
              hours: 4,
              unitOrTask: '模块一实训',
              ideologicalElements: '职业伦理',
              integrationMethod: '项目答辩',
              linkedStandardTopicIds: [topicId],
            },
          ],
        }),
      })
    )
    expect(createInvalidDelivery.status).toBe(200)
    const invalidDeliveryData: any = await createInvalidDelivery.json()

    const publishInvalidDelivery = await app.handle(
      new Request(`http://localhost/delivery-plans/${invalidDeliveryData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )

    expect(publishInvalidDelivery.status).toBe(422)
    const publishInvalidDeliveryText = await publishInvalidDelivery.text()
    expect(publishInvalidDeliveryText).toContain('思政元素')
    expect(publishInvalidDeliveryText).toContain('课程标准')
  })

  it('should block publish when lesson lacks traceability bindings', async () => {
    const createInvalidLesson = await app.handle(
      new Request('http://localhost/teaching-plan-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          bookId,
          lessonNo: 99,
          title: '第99次课：发布阻断测试',
          weekNo: 3,
          duration: 90,
          objectives: '测试目标',
          outline: '测试提纲',
          ideologicalElements: '工匠精神',
          integrationMethod: '案例讨论',
          deliveryPlanId,
          deliveryPlanWeekId: deliveryWeekId,
          courseStandardTopicRefs: [],
        }),
      })
    )
    expect(createInvalidLesson.status).toBe(200)
    const invalidLessonData: any = await createInvalidLesson.json()

    const publishInvalidLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${invalidLessonData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )

    expect(publishInvalidLesson.status).toBe(422)
    const publishInvalidLessonText = await publishInvalidLesson.text()
    expect(publishInvalidLessonText).toContain('课程标准')
  })

  it('should block lesson publish when linked delivery plan ideological ratio is below one-third', async () => {
    const getStandard = await app.handle(
      new Request(`http://localhost/course-standards/${standardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(getStandard.status).toBe(200)
    const standardData: any = await getStandard.json()
    const topicId = standardData.data.modules?.[0]?.topics?.[0]?.id
    expect(typeof topicId).toBe('string')

    const createLowRatioDelivery = await app.handle(
      new Request('http://localhost/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '授课计划（思政比例不足测试）',
          courseOfferingId: offeringId,
          courseStandardId: standardId,
          weeks: [
            {
              weekNo: 10,
              hours: 9,
              unitOrTask: '核心技能训练',
              ideologicalElements: null,
              integrationMethod: null,
              linkedStandardTopicIds: [topicId],
            },
            {
              weekNo: 11,
              hours: 3,
              unitOrTask: '综合复盘',
              ideologicalElements: '工匠精神',
              integrationMethod: '案例讨论',
              linkedStandardTopicIds: [topicId],
            },
          ],
        }),
      })
    )
    expect(createLowRatioDelivery.status).toBe(200)
    const lowRatioDeliveryData: any = await createLowRatioDelivery.json()
    const lowRatioDeliveryPlanId = lowRatioDeliveryData.data.id
    const week10 = lowRatioDeliveryData.data.weeks.find((week: any) => week.weekNo === 10)
    expect(week10?.id).toBeTruthy()

    const createLesson = await app.handle(
      new Request('http://localhost/teaching-plan-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          bookId,
          lessonNo: 120,
          title: '第120次课：比例门禁测试',
          weekNo: 10,
          duration: 90,
          objectives: '验证思政比例门禁',
          outline: '一、任务讲解；二、课堂练习',
          ideologicalElements: '工匠精神',
          integrationMethod: '案例讨论',
          deliveryPlanId: lowRatioDeliveryPlanId,
          deliveryPlanWeekId: week10.id,
          courseStandardTopicRefs: [topicId],
        }),
      })
    )
    expect(createLesson.status).toBe(200)
    const createdLessonData: any = await createLesson.json()

    const publishLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${createdLessonData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(publishLesson.status).toBe(422)
    const publishLessonText = await publishLesson.text()
    expect(publishLessonText).toContain('思政融入学时占比')
  })

  it('should block lesson publish when ideological fields mismatch upstream plan and standard topics', async () => {
    const getStandard = await app.handle(
      new Request(`http://localhost/course-standards/${standardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(getStandard.status).toBe(200)
    const standardData: any = await getStandard.json()
    const topicId = standardData.data.modules?.[0]?.topics?.[0]?.id
    expect(typeof topicId).toBe('string')

    const createInvalidLesson = await app.handle(
      new Request('http://localhost/teaching-plan-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          bookId,
          lessonNo: 131,
          title: '第131次课：思政映证冲突测试',
          weekNo: 1,
          duration: 90,
          objectives: '验证思政字段映证门禁',
          outline: '一、讲授；二、讨论',
          ideologicalElements: '职业伦理',
          integrationMethod: '情境辩论',
          deliveryPlanId,
          deliveryPlanWeekId: deliveryWeekId,
          courseStandardTopicRefs: [topicId],
        }),
      })
    )
    expect(createInvalidLesson.status).toBe(200)
    const invalidLessonData: any = await createInvalidLesson.json()

    const publishInvalidLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${invalidLessonData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )

    expect(publishInvalidLesson.status).toBe(422)
    const publishInvalidLessonText = await publishInvalidLesson.text()
    expect(publishInvalidLessonText).toContain('思政元素')
    expect(publishInvalidLessonText).toContain('融入方式')
  })

  it('should warn when lesson courseware misses chapter and tags', async () => {
    const createCourseware = await app.handle(
      new Request('http://localhost/courseware-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '第1周课件（标签缺失测试）',
          fileName: 'week1-no-tags.pptx',
          fileUrl: 'https://example.com/week1-no-tags.pptx',
          teachingPlanLessonId: lessonId,
          courseOfferingId: offeringId,
        }),
      })
    )
    expect(createCourseware.status).toBe(200)

    const validateLesson = await app.handle(
      new Request('http://localhost/traceability/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          type: 'teaching-plan-lesson',
          id: lessonId,
        }),
      })
    )
    expect(validateLesson.status).toBe(200)
    const validateLessonData: any = await validateLesson.json()
    expect(validateLessonData.data.warnings).toContain('课件附件有 1 项缺少章节标注')
    expect(validateLessonData.data.warnings).toContain('课件附件有 1 项缺少标签')
    expect(validateLessonData.data.warnings).toContain('课件附件有 1 项缺少思政标签')
  })

  it('should block lesson publish when courseware ideological tags conflict with lesson', async () => {
    const getStandard = await app.handle(
      new Request(`http://localhost/course-standards/${standardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(getStandard.status).toBe(200)
    const standardData: any = await getStandard.json()
    const topicId = standardData.data.modules?.[0]?.topics?.[0]?.id
    expect(typeof topicId).toBe('string')

    const createLesson = await app.handle(
      new Request('http://localhost/teaching-plan-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          bookId,
          lessonNo: 132,
          title: '第132次课：课件映证冲突测试',
          weekNo: 1,
          duration: 90,
          objectives: '验证课件思政标签门禁',
          outline: '一、讲授；二、演练',
          ideologicalElements: '工匠精神',
          integrationMethod: '案例讨论',
          deliveryPlanId,
          deliveryPlanWeekId: deliveryWeekId,
          courseStandardTopicRefs: [topicId],
        }),
      })
    )
    expect(createLesson.status).toBe(200)
    const createdLessonData: any = await createLesson.json()

    const createCourseware = await app.handle(
      new Request('http://localhost/courseware-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '第132次课课件',
          fileName: 'week1-conflict.pptx',
          fileUrl: 'https://example.com/week1-conflict.pptx',
          teachingPlanLessonId: createdLessonData.data.id,
          courseOfferingId: offeringId,
          chapterRef: '模块一-主题1',
          tags: ['课件', '演示'],
          ideologicalElements: ['团队协作'],
        }),
      })
    )
    expect(createCourseware.status).toBe(200)

    const publishLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${createdLessonData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(publishLesson.status).toBe(422)
    const publishLessonText = await publishLesson.text()
    expect(publishLessonText).toContain('课件附件')
    expect(publishLessonText).toContain('思政标签')
  })

  it('should block lesson publish when courseware week binding conflicts with lesson week', async () => {
    const getStandard = await app.handle(
      new Request(`http://localhost/course-standards/${standardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(getStandard.status).toBe(200)
    const standardData: any = await getStandard.json()
    const topicId = standardData.data.modules?.[0]?.topics?.[0]?.id
    expect(typeof topicId).toBe('string')

    const createAnotherDelivery = await app.handle(
      new Request('http://localhost/delivery-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '授课计划（周次冲突测试）',
          courseOfferingId: offeringId,
          courseStandardId: standardId,
          weeks: [
            {
              weekNo: 21,
              hours: 4,
              unitOrTask: '周次冲突测试单元',
              ideologicalElements: '工匠精神',
              integrationMethod: '案例讨论',
              linkedStandardTopicIds: [topicId],
            },
          ],
        }),
      })
    )
    expect(createAnotherDelivery.status).toBe(200)
    const anotherDeliveryData: any = await createAnotherDelivery.json()
    const conflictWeekId = anotherDeliveryData.data.weeks?.[0]?.id
    expect(typeof conflictWeekId).toBe('string')

    const createLesson = await app.handle(
      new Request('http://localhost/teaching-plan-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          bookId,
          lessonNo: 133,
          title: '第133次课：课件周次冲突测试',
          weekNo: 1,
          duration: 90,
          objectives: '验证课件周次映证门禁',
          outline: '一、讲授；二、练习',
          ideologicalElements: '工匠精神',
          integrationMethod: '案例讨论',
          deliveryPlanId,
          deliveryPlanWeekId: deliveryWeekId,
          courseStandardTopicRefs: [topicId],
        }),
      })
    )
    expect(createLesson.status).toBe(200)
    const createdLessonData: any = await createLesson.json()

    const createCourseware = await app.handle(
      new Request('http://localhost/courseware-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: '第133次课课件',
          fileName: 'week-binding-conflict.pptx',
          fileUrl: 'https://example.com/week-binding-conflict.pptx',
          teachingPlanLessonId: createdLessonData.data.id,
          deliveryPlanWeekId: conflictWeekId,
          courseOfferingId: offeringId,
          chapterRef: '模块一-主题1',
          tags: ['课件'],
          ideologicalElements: ['工匠精神'],
        }),
      })
    )
    expect(createCourseware.status).toBe(200)

    const publishLesson = await app.handle(
      new Request(`http://localhost/teaching-plan-lessons/${createdLessonData.data.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(publishLesson.status).toBe(422)
    const publishLessonText = await publishLesson.text()
    expect(publishLessonText).toContain('周次')
    expect(publishLessonText).toContain('课件附件')
  })

  it('should generate legacy mappings and support confirm/reject workflow', async () => {
    const [planA, planB] = await Promise.all([
      prisma.teachingPlan.create({
        data: {
          title: '旧教案-A-迁移测试',
          courseName: '课程标准与教案一体化实践',
          className: '信息工程2401班',
          duration: 90,
          objectives: '<p>旧教案A目标</p>',
          keyPoints: '<p>旧教案A重点</p>',
          process: '<p>旧教案A过程</p>',
          htmlContent: '<p>旧教案A完整内容</p>',
          teacherId,
          status: 'DRAFT',
        },
      }),
      prisma.teachingPlan.create({
        data: {
          title: '旧教案-B-迁移测试',
          courseName: '未知课程',
          className: '未知班级',
          duration: 90,
          objectives: '<p>旧教案B目标</p>',
          keyPoints: '<p>旧教案B重点</p>',
          process: '<p>旧教案B过程</p>',
          htmlContent: '<p>旧教案B完整内容</p>',
          teacherId,
          status: 'DRAFT',
        },
      }),
    ])
    legacyPlanIdA = planA.id
    legacyPlanIdB = planB.id

    const generateResponse = await app.handle(
      new Request('http://localhost/migration/legacy-mappings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      })
    )
    expect(generateResponse.status).toBe(200)

    const teacherListResponse = await app.handle(
      new Request('http://localhost/migration/legacy-mappings', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${teacherToken}`,
        },
      })
    )
    expect(teacherListResponse.status).toBe(403)

    const listResponse = await app.handle(
      new Request('http://localhost/migration/legacy-mappings?limit=100', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })
    )
    expect(listResponse.status).toBe(200)
    const listData: any = await listResponse.json()
    const mappingA = listData.data.items.find((item: any) => item.legacyTeachingPlanId === legacyPlanIdA)
    const mappingB = listData.data.items.find((item: any) => item.legacyTeachingPlanId === legacyPlanIdB)
    expect(mappingA).toBeTruthy()
    expect(mappingB).toBeTruthy()
    expect(mappingA.suggestedCourseOfferingId).toBe(offeringId)
    expect(mappingA.confidence).toBeGreaterThan(0.5)
    expect(mappingB.confidence).toBeLessThan(0.5)

    const confirmResponse = await app.handle(
      new Request(`http://localhost/migration/legacy-mappings/${mappingA.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          courseOfferingId: offeringId,
          semesterId,
          note: '人工确认通过',
        }),
      })
    )
    expect(confirmResponse.status).toBe(200)
    const confirmData: any = await confirmResponse.json()
    expect(confirmData.data.status).toBe('CONFIRMED')
    expect(confirmData.data.migratedBookId).toBeTruthy()
    expect(confirmData.data.migratedLessonId).toBeTruthy()

    const updatedPlanA = await prisma.teachingPlan.findUnique({
      where: { id: legacyPlanIdA },
      select: { courseOfferingId: true, planBookId: true },
    })
    expect(updatedPlanA?.courseOfferingId).toBe(offeringId)
    expect(updatedPlanA?.planBookId).toBe(confirmData.data.migratedBookId)

    const migratedLesson = await prisma.teachingPlanLesson.findUnique({
      where: { id: confirmData.data.migratedLessonId },
      select: {
        id: true,
        bookId: true,
        title: true,
        className: true,
        status: true,
      },
    })
    expect(migratedLesson?.bookId).toBe(confirmData.data.migratedBookId)
    expect(migratedLesson?.title).toBe('旧教案-A-迁移测试')
    expect(migratedLesson?.className).toBe('信息工程2401班')
    expect(migratedLesson?.status).toBe('DRAFT')

    const rejectResponse = await app.handle(
      new Request(`http://localhost/migration/legacy-mappings/${mappingB.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          note: '匹配结果不可信',
        }),
      })
    )
    expect(rejectResponse.status).toBe(200)
    const rejectData: any = await rejectResponse.json()
    expect(rejectData.data.status).toBe('REJECTED')
  })

  it('should enforce org template version publish permissions', async () => {
    const teacherCreateOrgTemplate = await app.handle(
      new Request('http://localhost/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          docType: 'COURSE_STANDARD',
          name: 'ACAD-TPL-TEST-ORG-FORBIDDEN',
          scope: 'ORG',
          description: 'teacher should not create org template',
        }),
      })
    )
    expect(teacherCreateOrgTemplate.status).toBe(403)

    const adminCreateOrgTemplate = await app.handle(
      new Request('http://localhost/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          docType: 'COURSE_STANDARD',
          name: 'ACAD-TPL-TEST-ORG-1',
          scope: 'ORG',
          description: 'admin org template',
        }),
      })
    )
    expect(adminCreateOrgTemplate.status).toBe(200)
    const orgTemplateData: any = await adminCreateOrgTemplate.json()
    const orgTemplateId = orgTemplateData.data.id

    const createOrgVersion = await app.handle(
      new Request(`http://localhost/templates/${orgTemplateId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          schemaJson: { fields: [{ key: 'title', type: 'text' }] },
          defaultContentJson: { title: '课程标准模板' },
          status: 'DRAFT',
        }),
      })
    )
    expect(createOrgVersion.status).toBe(200)
    const orgVersionData: any = await createOrgVersion.json()

    const teacherPublishOrgVersion = await app.handle(
      new Request(`http://localhost/templates/${orgTemplateId}/publish-version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          versionId: orgVersionData.data.id,
        }),
      })
    )
    expect(teacherPublishOrgVersion.status).toBe(403)

    const adminPublishOrgVersion = await app.handle(
      new Request(`http://localhost/templates/${orgTemplateId}/publish-version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          versionId: orgVersionData.data.id,
        }),
      })
    )
    expect(adminPublishOrgVersion.status).toBe(200)
    const publishedOrgVersionData: any = await adminPublishOrgVersion.json()
    expect(publishedOrgVersionData.data.status).toBe('PUBLISHED')

    const teacherCreatePersonalTemplate = await app.handle(
      new Request('http://localhost/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          docType: 'TEACHING_PLAN_LESSON',
          name: 'ACAD-TPL-TEST-PERSONAL-1',
          scope: 'PERSONAL',
          description: 'teacher personal template',
        }),
      })
    )
    expect(teacherCreatePersonalTemplate.status).toBe(200)
    const personalTemplateData: any = await teacherCreatePersonalTemplate.json()
    const personalTemplateId = personalTemplateData.data.id

    const teacherCreatePersonalVersion = await app.handle(
      new Request(`http://localhost/templates/${personalTemplateId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          schemaJson: { fields: [{ key: 'outline', type: 'richtext' }] },
          defaultContentJson: { outline: '<p>模板正文</p>' },
          status: 'DRAFT',
        }),
      })
    )
    expect(teacherCreatePersonalVersion.status).toBe(200)
    const personalVersionData: any = await teacherCreatePersonalVersion.json()

    const teacherPublishPersonalVersion = await app.handle(
      new Request(`http://localhost/templates/${personalTemplateId}/publish-version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          versionId: personalVersionData.data.id,
        }),
      })
    )
    expect(teacherPublishPersonalVersion.status).toBe(200)
    const publishedPersonalVersionData: any = await teacherPublishPersonalVersion.json()
    expect(publishedPersonalVersionData.data.status).toBe('PUBLISHED')
  })
})
