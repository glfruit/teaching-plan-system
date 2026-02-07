import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

const SemesterPlanStatus = t.Union([
  t.Literal('DRAFT'),
  t.Literal('ACTIVE'),
  t.Literal('COMPLETED'),
  t.Literal('ARCHIVED'),
]);

export const semesterPlanRoutes = new Elysia({ prefix: '/semester-plans' })
  .use(authMiddleware)
  .use(requireAuth)
  
  .get(
    '/',
    async ({ user, query }) => {
      const page = Number(query?.page || 1);
      const limit = Number(query?.limit || 10);
      const skip = (page - 1) * limit;
      
      const where: any = {
        teacherId: user!.userId,
      };
      
      if (query?.semester) {
        where.semester = query.semester;
      }

      if (query?.status) {
        where.status = query.status;
      }
      
      const [plans, total] = await Promise.all([
        prisma.semesterPlan.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            weeklyPlans: {
                select: { id: true, weekNumber: true, status: true }
            }
          }
        }),
        prisma.semesterPlan.count({ where }),
      ]);
      
      return {
        success: true,
        data: {
          items: plans,
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
        semester: t.Optional(t.String()),
        status: t.Optional(SemesterPlanStatus),
      }),
    }
  )
  
  .get(
    '/:id',
    async ({ params, user, set }) => {
      const plan = await prisma.semesterPlan.findUnique({
        where: { id: params.id },
        include: {
          weeklyPlans: {
            orderBy: { weekNumber: 'asc' },
            include: {
                teachingPlan: {
                    select: { id: true, title: true }
                }
            }
          },
        },
      });
      
      if (!plan) {
        set.status = 404;
        throw new Error('Semester plan not found');
      }
      
      if (plan.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only access your own semester plans');
      }
      
      return {
        success: true,
        data: plan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  .post(
    '/',
    async ({ body, user, set }) => {
      // Auto-generate weekly plans logic
      const startDate = body.startDate ? new Date(body.startDate) : new Date(); // Default to now if not provided, though ideally required
      
      const weeklyPlansData = [];
      let currentWeekStart = new Date(startDate);
      
      for (let i = 1; i <= body.totalWeeks; i++) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeklyPlansData.push({
            weekNumber: i,
            startDate: new Date(currentWeekStart),
            endDate: new Date(weekEnd),
            plannedContent: '',
            status: 'PLANNED' as const
        });
        
        // Next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      const plan = await prisma.semesterPlan.create({
        data: {
          teacherId: user!.userId,
          courseName: body.courseName,
          semester: body.semester,
          startDate: startDate,
          totalWeeks: body.totalWeeks,
          weeklyHours: body.weeklyHours,
          description: body.description,
          status: 'DRAFT',
          weeklyPlans: {
            create: weeklyPlansData
          }
        },
        include: {
            weeklyPlans: true
        }
      });
      
      set.status = 201;
      
      return {
        success: true,
        message: 'Semester plan created successfully',
        data: plan,
      };
    },
    {
      body: t.Object({
        courseName: t.String({ minLength: 1 }),
        semester: t.String({ minLength: 1 }),
        totalWeeks: t.Number({ minimum: 1, maximum: 52 }),
        weeklyHours: t.Number({ minimum: 1 }),
        description: t.Optional(t.String()),
        startDate: t.Optional(t.String()), // ISO Date string
      }),
    }
  )
  
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      const existing = await prisma.semesterPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Semester plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden');
      }
      
      const plan = await prisma.semesterPlan.update({
        where: { id: params.id },
        data: {
            ...body,
            updatedAt: new Date()
        }
      });
      
      return {
        success: true,
        message: 'Semester plan updated successfully',
        data: plan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        courseName: t.Optional(t.String()),
        semester: t.Optional(t.String()),
        totalWeeks: t.Optional(t.Number()),
        weeklyHours: t.Optional(t.Number()),
        description: t.Optional(t.String()),
        status: t.Optional(SemesterPlanStatus),
        startDate: t.Optional(t.String()),
      }),
    }
  )
  
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      const existing = await prisma.semesterPlan.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Semester plan not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden');
      }
      
      await prisma.semesterPlan.delete({
        where: { id: params.id },
      });
      
      return {
        success: true,
        message: 'Semester plan deleted successfully',
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
