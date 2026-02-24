import { Elysia, t } from 'elysia';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

// 教案状态枚举
const TeachingPlanStatus = t.Union([
  t.Literal('DRAFT'),
  t.Literal('PUBLISHED'),
  t.Literal('ARCHIVED'),
]);
const BatchAction = t.Union([t.Literal('PUBLISH'), t.Literal('ARCHIVE'), t.Literal('DELETE')]);

const syncLegacyPlanToAcademicMirror = async (tx: Prisma.TransactionClient, legacyPlanId: string) => {
  const plan = await tx.teachingPlan.findUnique({
    where: { id: legacyPlanId },
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
      teacher: {
        select: { username: true },
      },
    },
  });

  if (!plan) {
    return;
  }

  let targetBook = plan.planBookId
    ? await tx.teachingPlanBook.findUnique({
        where: { id: plan.planBookId },
        select: {
          id: true,
          courseOfferingId: true,
          semesterId: true,
        },
      })
    : null;

  let resolvedCourseOfferingId = plan.courseOfferingId || targetBook?.courseOfferingId || null;
  let resolvedSemesterId = targetBook?.semesterId || null;
  let resolvedWeeklyHours: number | null = null;

  if (resolvedCourseOfferingId) {
    const offering = await tx.courseOffering.findUnique({
      where: { id: resolvedCourseOfferingId },
      select: {
        id: true,
        semesterId: true,
        weeklyHours: true,
      },
    });

    if (offering) {
      resolvedCourseOfferingId = offering.id;
      resolvedSemesterId = offering.semesterId;
      resolvedWeeklyHours = offering.weeklyHours ?? null;
    } else if (!targetBook) {
      resolvedCourseOfferingId = null;
      resolvedSemesterId = null;
    }
  }

  if (!targetBook && resolvedCourseOfferingId && resolvedSemesterId) {
    targetBook = await tx.teachingPlanBook.create({
      data: {
        title: `${plan.courseName}教案册（兼容）`,
        courseOfferingId: resolvedCourseOfferingId,
        semesterId: resolvedSemesterId,
        teacherId: plan.teacherId,
        teacherName: plan.teacher.username,
        targetClass: plan.className,
        totalHours: plan.duration,
        weeklyHours: resolvedWeeklyHours ?? undefined,
        status: plan.status,
      },
      select: {
        id: true,
        courseOfferingId: true,
        semesterId: true,
      },
    });

    await tx.teachingPlan.update({
      where: { id: plan.id },
      data: {
        planBookId: targetBook.id,
        updatedAt: new Date(),
      },
    });
  } else if (
    targetBook &&
    resolvedCourseOfferingId &&
    resolvedSemesterId &&
    (targetBook.courseOfferingId !== resolvedCourseOfferingId || targetBook.semesterId !== resolvedSemesterId)
  ) {
    targetBook = await tx.teachingPlanBook.update({
      where: { id: targetBook.id },
      data: {
        courseOfferingId: resolvedCourseOfferingId,
        semesterId: resolvedSemesterId,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        courseOfferingId: true,
        semesterId: true,
      },
    });
  }

  if (!targetBook) {
    return;
  }

  await tx.teachingPlanBook.update({
    where: { id: targetBook.id },
    data: {
      title: `${plan.courseName}教案册（兼容）`,
      teacherName: plan.teacher.username,
      targetClass: plan.className,
      totalHours: plan.duration,
      weeklyHours: resolvedWeeklyHours ?? undefined,
      status: plan.status,
      updatedAt: new Date(),
    },
  });

  let deliveryPlanWeekId: string | undefined;
  if (plan.deliveryPlanId && plan.deliveryWeekNo) {
    const matchedWeek = await tx.deliveryPlanWeek.findFirst({
      where: {
        deliveryPlanId: plan.deliveryPlanId,
        weekNo: plan.deliveryWeekNo,
      },
      select: {
        id: true,
      },
    });
    deliveryPlanWeekId = matchedWeek?.id;
  }

  await tx.teachingPlanLesson.upsert({
    where: {
      bookId_lessonNo: {
        bookId: targetBook.id,
        lessonNo: 1,
      },
    },
    create: {
      bookId: targetBook.id,
      lessonNo: 1,
      title: plan.title,
      className: plan.className,
      weekNo: plan.deliveryWeekNo ?? undefined,
      duration: plan.duration,
      objectives: plan.objectives,
      ideologicalElements: plan.ideologicalElements || undefined,
      integrationMethod: plan.integrationMethod || undefined,
      keyPoints: plan.keyPoints,
      methods: plan.methods || undefined,
      outline: plan.process,
      reflection: plan.reflection || undefined,
      contentJson: plan.contentJson || undefined,
      status: plan.status,
      deliveryPlanId: plan.deliveryPlanId || undefined,
      deliveryPlanWeekId,
      courseStandardTopicRefs: plan.courseStandardRefs || [],
    },
    update: {
      title: plan.title,
      className: plan.className,
      weekNo: plan.deliveryWeekNo ?? undefined,
      duration: plan.duration,
      objectives: plan.objectives,
      ideologicalElements: plan.ideologicalElements || undefined,
      integrationMethod: plan.integrationMethod || undefined,
      keyPoints: plan.keyPoints,
      methods: plan.methods || undefined,
      outline: plan.process,
      reflection: plan.reflection || undefined,
      contentJson: plan.contentJson || undefined,
      status: plan.status,
      deliveryPlanId: plan.deliveryPlanId || undefined,
      deliveryPlanWeekId,
      courseStandardTopicRefs: plan.courseStandardRefs || [],
      updatedAt: new Date(),
    },
  });
};

/**
 * 教案路由
 * 提供教案的 CRUD 操作，所有操作都需要用户认证
 */
export const teachingPlanRoutes = new Elysia({ prefix: '/teaching-plans' })
  .use(authMiddleware)
  .use(requireAuth)
  
  /**
   * 获取教案列表
   * 支持分页、搜索、筛选
   */
  .get(
    '/',
    async ({ user, query }) => {
      const page = Number(query?.page || 1);
      const limit = Number(query?.limit || 10);
      const skip = (page - 1) * limit;
      
      const where: any = {
        teacherId: user!.userId,
      };
      
      // 搜索关键词
      if (query?.search) {
        where.OR = [
          { title: { contains: query.search } },
          { courseName: { contains: query.search } },
          { className: { contains: query.search } },
        ];
      }
      
      // 状态筛选
      if (query?.status) {
        where.status = query.status;
      }
      
      // 课程名称筛选
      if (query?.courseName) {
        where.courseName = query.courseName;
      }
      
      const [teachingPlans, total] = await Promise.all([
        prisma.teachingPlan.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            courseName: true,
            className: true,
            duration: true,
            status: true,
            courseOfferingId: true,
            deliveryPlanId: true,
            deliveryWeekNo: true,
            createdAt: true,
            updatedAt: true,
            teacher: {
              select: {
                id: true,
                username: true,
                department: true,
              },
            },
          },
        }),
        prisma.teachingPlan.count({ where }),
      ]);
      
      return {
        success: true,
        data: {
          items: teachingPlans,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        status: t.Optional(TeachingPlanStatus),
        courseName: t.Optional(t.String()),
      }),
    }
  )
  
  /**
   * 获取单个教案详情
   */
  .get(
    '/:id',
    async ({ params, user, set }) => {
      const teachingPlan = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
        include: {
          teacher: {
            select: {
              id: true,
              username: true,
              department: true,
            },
          },
        },
      });
      
      if (!teachingPlan) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      // 检查权限：只能查看自己的教案
      if (teachingPlan.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only access your own teaching plans');
      }
      
      return {
        success: true,
        data: teachingPlan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  /**
   * 创建教案
   */
  .post(
    '/',
    async ({ body, user }) => {
      const teachingPlan = await prisma.$transaction(async (tx) => {
        const created = await tx.teachingPlan.create({
          data: {
            ...body,
            teacherId: user!.userId,
          },
        });
        await syncLegacyPlanToAcademicMirror(tx, created.id);
        return tx.teachingPlan.findUnique({
          where: { id: created.id },
          include: {
            teacher: {
              select: {
                id: true,
                username: true,
                department: true,
              },
            },
          },
        });
      });
      
      return {
        success: true,
        message: 'Teaching plan created successfully',
        data: teachingPlan,
      };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        courseName: t.String({ minLength: 1, maxLength: 100 }),
        className: t.String({ minLength: 1, maxLength: 50 }),
        duration: t.Number({ minimum: 1, maximum: 300 }),
        objectives: t.String(),
        keyPoints: t.String(),
        process: t.String(),
        blackboard: t.Optional(t.String()),
        reflection: t.Optional(t.String()),
        methods: t.Optional(t.String()),
        resources: t.Optional(t.String()),
        htmlContent: t.String(),
        contentJson: t.Optional(t.Any()),
        status: t.Optional(TeachingPlanStatus),
        courseOfferingId: t.Optional(t.String()),
        deliveryPlanId: t.Optional(t.String()),
        deliveryWeekNo: t.Optional(t.Number({ minimum: 1 })),
        planBookId: t.Optional(t.String()),
        courseStandardRefs: t.Optional(t.Array(t.String())),
        ideologicalElements: t.Optional(t.String()),
        integrationMethod: t.Optional(t.String()),
      }),
    }
  )

  /**
   * 批量操作教案
   */
  .post(
    '/batch',
    async ({ body, user, set }) => {
      const uniqueIds = [...new Set(body.ids)];
      const plans = await prisma.teachingPlan.findMany({
        where: {
          id: { in: uniqueIds },
          teacherId: user!.userId,
        },
        select: { id: true },
      });

      const matchedIds = plans.map((plan) => plan.id);
      if (matchedIds.length === 0) {
        set.status = 404;
        throw new Error('No accessible teaching plans found');
      }

      let affected = 0;
      if (body.action === 'PUBLISH') {
        const result = await prisma.$transaction(async (tx) => {
          const updated = await tx.teachingPlan.updateMany({
            where: { id: { in: matchedIds } },
            data: {
              status: 'PUBLISHED',
              updatedAt: new Date(),
            },
          });
          for (const id of matchedIds) {
            await syncLegacyPlanToAcademicMirror(tx, id);
          }
          return updated;
        });
        affected = result.count;
      } else if (body.action === 'ARCHIVE') {
        const result = await prisma.$transaction(async (tx) => {
          const updated = await tx.teachingPlan.updateMany({
            where: { id: { in: matchedIds } },
            data: {
              status: 'ARCHIVED',
              updatedAt: new Date(),
            },
          });
          for (const id of matchedIds) {
            await syncLegacyPlanToAcademicMirror(tx, id);
          }
          return updated;
        });
        affected = result.count;
      } else {
        const result = await prisma.teachingPlan.deleteMany({
          where: { id: { in: matchedIds } },
        });
        affected = result.count;
      }

      return {
        success: true,
        message: 'Batch operation completed',
        data: {
          action: body.action,
          requested: uniqueIds.length,
          matched: matchedIds.length,
          affected,
          skipped: Math.max(uniqueIds.length - matchedIds.length, 0),
        },
      };
    },
    {
      body: t.Object({
        action: BatchAction,
        ids: t.Array(t.String(), { minItems: 1, maxItems: 100 }),
      }),
    }
  )
  
  /**
   * 更新教案
   */
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      // 先检查教案是否存在且属于当前用户
      const existing = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only update your own teaching plans');
      }
      
      const teachingPlan = await prisma.$transaction(async (tx) => {
        await tx.teachingPlan.update({
          where: { id: params.id },
          data: {
            ...body,
            updatedAt: new Date(),
          },
        });
        await syncLegacyPlanToAcademicMirror(tx, params.id);
        return tx.teachingPlan.findUnique({
          where: { id: params.id },
          include: {
            teacher: {
              select: {
                id: true,
                username: true,
                department: true,
              },
            },
          },
        });
      });
      
      return {
        success: true,
        message: 'Teaching plan updated successfully',
        data: teachingPlan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
        courseName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        className: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
        duration: t.Optional(t.Number({ minimum: 1, maximum: 300 })),
        objectives: t.Optional(t.String()),
        keyPoints: t.Optional(t.String()),
        process: t.Optional(t.String()),
        blackboard: t.Optional(t.String()),
        reflection: t.Optional(t.String()),
        methods: t.Optional(t.String()),
        resources: t.Optional(t.String()),
        htmlContent: t.Optional(t.String()),
        contentJson: t.Optional(t.Any()),
        status: t.Optional(TeachingPlanStatus),
        courseOfferingId: t.Optional(t.String()),
        deliveryPlanId: t.Optional(t.String()),
        deliveryWeekNo: t.Optional(t.Number({ minimum: 1 })),
        planBookId: t.Optional(t.String()),
        courseStandardRefs: t.Optional(t.Array(t.String())),
        ideologicalElements: t.Optional(t.String()),
        integrationMethod: t.Optional(t.String()),
      }),
    }
  )
  
  /**
   * 删除教案
   */
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      // 先检查教案是否存在且属于当前用户
      const existing = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only delete your own teaching plans');
      }
      
      await prisma.teachingPlan.delete({
        where: { id: params.id },
      });
      
      return {
        success: true,
        message: 'Teaching plan deleted successfully',
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  /**
   * 发布教案（状态改为 PUBLISHED）
   */
  .patch(
    '/:id/publish',
    async ({ params, user, set }) => {
      const existing = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only publish your own teaching plans');
      }
      
      const teachingPlan = await prisma.$transaction(async (tx) => {
        await tx.teachingPlan.update({
          where: { id: params.id },
          data: {
            status: 'PUBLISHED',
            updatedAt: new Date(),
          },
        });
        await syncLegacyPlanToAcademicMirror(tx, params.id);
        return tx.teachingPlan.findUnique({
          where: { id: params.id },
        });
      });
      
      return {
        success: true,
        message: 'Teaching plan published successfully',
        data: teachingPlan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  /**
   * 归档教案（状态改为 ARCHIVED）
   */
  .patch(
    '/:id/archive',
    async ({ params, user, set }) => {
      const existing = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only archive your own teaching plans');
      }
      
      const teachingPlan = await prisma.$transaction(async (tx) => {
        await tx.teachingPlan.update({
          where: { id: params.id },
          data: {
            status: 'ARCHIVED',
            updatedAt: new Date(),
          },
        });
        await syncLegacyPlanToAcademicMirror(tx, params.id);
        return tx.teachingPlan.findUnique({
          where: { id: params.id },
        });
      });
      
      return {
        success: true,
        message: 'Teaching plan archived successfully',
        data: teachingPlan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  /**
   * 复制教案（生成草稿副本）
   */
  .post(
    '/:id/duplicate',
    async ({ params, user, set }) => {
      const existing = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only duplicate your own teaching plans');
      }

      const duplicated = await prisma.$transaction(async (tx) => {
        const created = await tx.teachingPlan.create({
          data: {
            title: `${existing.title}（副本）`,
            courseName: existing.courseName,
            className: existing.className,
            duration: existing.duration,
            objectives: existing.objectives,
            keyPoints: existing.keyPoints,
            process: existing.process,
            blackboard: existing.blackboard,
            reflection: existing.reflection,
            methods: existing.methods,
            resources: existing.resources,
            htmlContent: existing.htmlContent,
            contentJson: existing.contentJson ?? undefined,
            status: 'DRAFT',
            teacherId: existing.teacherId,
            courseOfferingId: existing.courseOfferingId,
            deliveryPlanId: existing.deliveryPlanId,
            deliveryWeekNo: existing.deliveryWeekNo,
            courseStandardRefs: existing.courseStandardRefs,
            ideologicalElements: existing.ideologicalElements,
            integrationMethod: existing.integrationMethod,
          },
        });
        await syncLegacyPlanToAcademicMirror(tx, created.id);
        return tx.teachingPlan.findUnique({
          where: { id: created.id },
          include: {
            teacher: {
              select: {
                id: true,
                username: true,
                department: true,
              },
            },
          },
        });
      });

      return {
        success: true,
        message: 'Teaching plan duplicated successfully',
        data: duplicated,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
