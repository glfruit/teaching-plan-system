import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

const WeekStatus = t.Union([
  t.Literal('PLANNED'),
  t.Literal('IN_PROGRESS'),
  t.Literal('COMPLETED'),
  t.Literal('ADJUSTED'),
]);

export const weeklyPlanRoutes = new Elysia({ prefix: '/weekly-plans' })
  .use(authMiddleware)
  .use(requireAuth)
  
  .get(
    '/:id',
    async ({ params, user, set }) => {
      const plan = await prisma.weeklyPlan.findUnique({
        where: { id: params.id },
        include: {
          teachingPlan: {
            select: { id: true, title: true }
          },
          semesterPlan: {
            select: { teacherId: true }
          }
        }
      });
      
      if (!plan) {
        set.status = 404;
        throw new Error('Weekly plan not found');
      }
      
      if (plan.semesterPlan.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden');
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
  
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      const existing = await prisma.weeklyPlan.findUnique({
        where: { id: params.id },
        include: {
            semesterPlan: { select: { teacherId: true } }
        }
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Weekly plan not found');
      }
      
      if (existing.semesterPlan.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden');
      }
      
      const plan = await prisma.weeklyPlan.update({
        where: { id: params.id },
        data: {
            ...body,
            updatedAt: new Date()
        },
        include: {
            teachingPlan: { select: { id: true, title: true } }
        }
      });
      
      return {
        success: true,
        message: 'Weekly plan updated successfully',
        data: plan,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        plannedContent: t.Optional(t.String()),
        actualContent: t.Optional(t.String()),
        status: t.Optional(WeekStatus),
        teachingPlanId: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
    }
  );
