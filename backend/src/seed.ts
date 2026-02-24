import { prisma } from './lib/prisma'
import { hashPassword } from './lib/auth'
import type { UserRole } from '@prisma/client'

interface SeedUser {
  username: string
  email: string
  password: string
  role: UserRole
  department?: string
}

const SEED_USERS: SeedUser[] = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
    department: '信息中心'
  },
  {
    username: 'teacher1',
    email: 'teacher1@example.com',
    password: 'teacher123',
    role: 'TEACHER',
    department: '计算机系'
  },
  {
    username: 'testteacher',
    email: 'testteacher@example.com',
    password: '123456',
    role: 'TEACHER',
    department: '教学研发组'
  }
]

const seed = async (): Promise<void> => {
  const userIds = new Map<string, string>()

  for (const user of SEED_USERS) {
    const hashedPassword = await hashPassword(user.password)
    const saved = await prisma.user.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
        department: user.department
      },
      create: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        department: user.department
      }
    })
    userIds.set(user.username, saved.id)
  }

  const adminId = userIds.get('admin')
  const teacherId = userIds.get('teacher1') || userIds.get('testteacher')
  if (!adminId || !teacherId) {
    return
  }

  const semesterName = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}学年第一学期`
  const semesterStart = new Date('2026-09-01T00:00:00.000Z')
  const semesterEnd = new Date('2027-01-20T00:00:00.000Z')
  const existingSemester = await prisma.semester.findFirst({
    where: {
      name: semesterName,
      startDate: semesterStart,
      endDate: semesterEnd,
    },
  })
  const semester = existingSemester
    ? await prisma.semester.update({
        where: { id: existingSemester.id },
        data: {
          status: 'ACTIVE',
          createdById: adminId,
        },
      })
    : await prisma.semester.create({
        data: {
          name: semesterName,
          startDate: semesterStart,
          endDate: semesterEnd,
          status: 'ACTIVE',
          createdById: adminId,
        },
      })

  const course = await prisma.course.upsert({
    where: { code: 'CS-TEMPLATE-101' },
    update: {
      name: '教案系统应用实践',
      department: '计算机系',
      ownerTeacherId: teacherId,
      status: 'ACTIVE',
    },
    create: {
      code: 'CS-TEMPLATE-101',
      name: '教案系统应用实践',
      department: '计算机系',
      ownerTeacherId: teacherId,
      status: 'ACTIVE',
      credits: 2,
      hours: 64,
    },
  })

  const offering = await prisma.courseOffering.upsert({
    where: {
      courseId_semesterId_className_teacherId: {
        courseId: course.id,
        semesterId: semester.id,
        className: '计算机2301班',
        teacherId,
      },
    },
    update: {
      weeklyHours: 4,
      totalWeeks: 16,
      status: 'ACTIVE',
    },
    create: {
      courseId: course.id,
      semesterId: semester.id,
      className: '计算机2301班',
      teacherId,
      weeklyHours: 4,
      totalWeeks: 16,
      status: 'ACTIVE',
    },
  })

  let standard = await prisma.courseStandard.findFirst({
    where: {
      title: '[示例] 教案系统应用实践课程标准',
      courseId: course.id,
      semesterId: semester.id,
      ownerId: teacherId,
    },
    include: {
      modules: {
        include: {
          topics: true,
        },
      },
    },
  })
  if (!standard) {
    standard = await prisma.courseStandard.create({
      data: {
        title: '[示例] 教案系统应用实践课程标准',
        courseId: course.id,
        semesterId: semester.id,
        ownerId: teacherId,
        status: 'PUBLISHED',
        htmlContent: '<h2>课程标准示例</h2><p>用于演示教学链路工作台。</p>',
        modules: {
          create: [
            {
              name: '模块一：课程导入',
              description: '了解课程目标与学习路径',
              sortOrder: 0,
              topics: {
                create: [
                  {
                    topicCode: 'M1-T1',
                    title: '课程目标与学习规划',
                    recommendedHours: 4,
                    ideologicalElements: ['工匠精神', '职业素养'],
                    integrationMethods: ['案例导入', '任务分解'],
                    objectiveMapping: ['知识目标', '能力目标'],
                    applicableMajors: ['软件技术'],
                    sortOrder: 0,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        modules: {
          include: {
            topics: true,
          },
        },
      },
    })
  }

  const seededTopicIds = standard.modules.flatMap((module) => module.topics.map((topic) => topic.id))

  const deliveryPlan =
    (await prisma.deliveryPlan.findFirst({
      where: {
        title: '[示例] 计算机2301班授课计划',
        courseOfferingId: offering.id,
        ownerId: teacherId,
      },
    })) ||
    (await prisma.deliveryPlan.create({
      data: {
        title: '[示例] 计算机2301班授课计划',
        courseOfferingId: offering.id,
        courseStandardId: standard.id,
        ownerId: teacherId,
        status: 'DRAFT',
      },
    }))

  const deliveryWeek = await prisma.deliveryPlanWeek.upsert({
    where: {
      deliveryPlanId_weekNo: {
        deliveryPlanId: deliveryPlan.id,
        weekNo: 1,
      },
    },
    update: {
      hours: 4,
      grouping: '全班',
      teachingMode: '讲授+实践',
      unitOrTask: '课程导学与学习目标设定',
      ideologicalElements: '工匠精神',
      integrationMethod: '案例分析',
      theoreticalPoints: '课程结构、学习方法',
      practiceProject: '学习任务拆解',
      practiceInstructor: '课程团队',
      remarks: '示例数据',
      linkedStandardTopicIds: seededTopicIds,
    },
    create: {
      deliveryPlanId: deliveryPlan.id,
      weekNo: 1,
      hours: 4,
      grouping: '全班',
      teachingMode: '讲授+实践',
      unitOrTask: '课程导学与学习目标设定',
      ideologicalElements: '工匠精神',
      integrationMethod: '案例分析',
      theoreticalPoints: '课程结构、学习方法',
      practiceProject: '学习任务拆解',
      practiceInstructor: '课程团队',
      remarks: '示例数据',
      linkedStandardTopicIds: seededTopicIds,
    },
  })

  const teachingPlanBook =
    (await prisma.teachingPlanBook.findFirst({
      where: {
        title: '[示例] 计算机2301班教师授课教案',
        courseOfferingId: offering.id,
        teacherId,
      },
    })) ||
    (await prisma.teachingPlanBook.create({
      data: {
        title: '[示例] 计算机2301班教师授课教案',
        courseOfferingId: offering.id,
        semesterId: semester.id,
        teacherId,
        teacherName: 'teacher1',
        teacherTitle: '讲师',
        teacherUnit: '计算机系',
        totalHours: 64,
        theoryHours: 32,
        practicalHours: 32,
        weeklyHours: 4,
        assessmentMethod: '过程考核+期末考核',
        targetUnit: '信息工程学院',
        targetClass: '计算机2301班',
      },
    }))

  const teachingPlanLesson = await prisma.teachingPlanLesson.upsert({
    where: {
      bookId_lessonNo: {
        bookId: teachingPlanBook.id,
        lessonNo: 1,
      },
    },
    update: {
      title: '第1课时：课程导学',
      lessonType: '理论+实践',
      className: offering.className,
      weekNo: 1,
      weekday: '星期一',
      period: '1-2节',
      duration: 45,
      objectives: '理解课程目标并完成学习规划。',
      keyPoints: '课程目标、学习任务拆解、思政元素导入。',
      difficulty: '学习任务与实践要求对齐。',
      methods: '案例讲解、任务驱动',
      teachingAids: '课件、任务单',
      ideologicalElements: '工匠精神',
      integrationMethod: '案例引导与反思',
      outline: '1. 课程导入 2. 目标讲解 3. 任务拆解 4. 课堂小结',
      reflection: '根据学生反馈优化实践任务梯度。',
      deliveryPlanId: deliveryPlan.id,
      deliveryPlanWeekId: deliveryWeek.id,
      courseStandardTopicRefs: seededTopicIds,
    },
    create: {
      bookId: teachingPlanBook.id,
      lessonNo: 1,
      title: '第1课时：课程导学',
      lessonType: '理论+实践',
      className: offering.className,
      weekNo: 1,
      weekday: '星期一',
      period: '1-2节',
      duration: 45,
      objectives: '理解课程目标并完成学习规划。',
      keyPoints: '课程目标、学习任务拆解、思政元素导入。',
      difficulty: '学习任务与实践要求对齐。',
      methods: '案例讲解、任务驱动',
      teachingAids: '课件、任务单',
      ideologicalElements: '工匠精神',
      integrationMethod: '案例引导与反思',
      outline: '1. 课程导入 2. 目标讲解 3. 任务拆解 4. 课堂小结',
      reflection: '根据学生反馈优化实践任务梯度。',
      deliveryPlanId: deliveryPlan.id,
      deliveryPlanWeekId: deliveryWeek.id,
      courseStandardTopicRefs: seededTopicIds,
    },
  })

  const existingCourseware = await prisma.coursewareAsset.findFirst({
    where: {
      title: '[示例] 课程导学课件',
      teachingPlanLessonId: teachingPlanLesson.id,
    },
  })
  if (!existingCourseware) {
    await prisma.coursewareAsset.create({
      data: {
        title: '[示例] 课程导学课件',
        fileName: 'course-introduction.pptx',
        fileUrl: 'https://example.com/course-introduction.pptx',
        courseOfferingId: offering.id,
        deliveryPlanWeekId: deliveryWeek.id,
        teachingPlanLessonId: teachingPlanLesson.id,
        chapterRef: '模块一-课程导学',
        tags: ['导学', '示例'],
        ideologicalElements: ['工匠精神'],
        uploadedById: teacherId,
      },
    })
  }

  const legacyPlan =
    (await prisma.teachingPlan.findFirst({
      where: {
        title: '[历史示例] 第1课时旧教案',
        teacherId,
      },
    })) ||
    (await prisma.teachingPlan.create({
      data: {
        title: '[历史示例] 第1课时旧教案',
        courseName: course.name,
        className: offering.className,
        duration: 45,
        objectives: '<p>通过旧版模板说明迁移流程。</p>',
        keyPoints: '<p>迁移映射、链路关联。</p>',
        process: '<p>导入 -> 映射 -> 审核。</p>',
        htmlContent: '<h2>旧教案示例</h2><p>用于迁移队列演示。</p>',
        status: 'DRAFT',
        teacherId,
      },
    }))

  await prisma.legacyMappingQueue.upsert({
    where: {
      legacyTeachingPlanId: legacyPlan.id,
    },
    update: {
      suggestedCourseOfferingId: offering.id,
      suggestedSemesterId: semester.id,
      confidence: 0.91,
      status: 'PENDING',
      note: '系统示例数据：建议映射到计算机2301班',
    },
    create: {
      legacyTeachingPlanId: legacyPlan.id,
      suggestedCourseOfferingId: offering.id,
      suggestedSemesterId: semester.id,
      confidence: 0.91,
      status: 'PENDING',
      note: '系统示例数据：建议映射到计算机2301班',
    },
  })
}

seed()
  .then(async () => {
    console.log('Seed completed')
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
