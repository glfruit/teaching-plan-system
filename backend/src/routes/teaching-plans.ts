import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

// 教案状态枚举
const TeachingPlanStatus = t.Union([
  t.Literal('DRAFT'),
  t.Literal('PUBLISHED'),
  t.Literal('ARCHIVED'),
]);

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
      const teachingPlan = await prisma.teachingPlan.create({
        data: {
          ...body,
          teacherId: user!.userId,
        },
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
        status: t.Optional(TeachingPlanStatus),
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
      
      const teachingPlan = await prisma.teachingPlan.update({
        where: { id: params.id },
        data: {
          ...body,
          updatedAt: new Date(),
        },
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
        status: t.Optional(TeachingPlanStatus),
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
      
      const teachingPlan = await prisma.teachingPlan.update({
        where: { id: params.id },
        data: {
          status: 'PUBLISHED',
          updatedAt: new Date(),
        },
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
      
      const teachingPlan = await prisma.teachingPlan.update({
        where: { id: params.id },
        data: {
          status: 'ARCHIVED',
          updatedAt: new Date(),
        },
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
  );
