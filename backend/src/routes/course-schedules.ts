import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

export const courseScheduleRoutes = new Elysia({ prefix: '/course-schedules' })
  .use(authMiddleware)
  .use(requireAuth)
  
  .get(
    '/',
    async ({ user, query }) => {
      const where: any = {
        teacherId: user!.userId,
      };
      
      if (query?.semester) {
        where.semester = query.semester;
      }
      
      const schedules = await prisma.courseSchedule.findMany({
        where,
        orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }]
      });
      
      return {
        success: true,
        data: schedules,
      };
    },
    {
      query: t.Object({
        semester: t.Optional(t.String()),
      }),
    }
  )
  
  .post(
    '/',
    async ({ body, user, set }) => {
      // Check conflict
      const conflict = await prisma.courseSchedule.findFirst({
        where: {
          teacherId: user!.userId,
          semester: body.semester,
          dayOfWeek: body.dayOfWeek,
          period: body.period
        }
      });
      
      if (conflict) {
        set.status = 409;
        return {
          success: false,
          message: 'Conflict with existing schedule: Same time slot occupied.'
        };
      }
      
      const schedule = await prisma.courseSchedule.create({
        data: {
          ...body,
          teacherId: user!.userId,
        }
      });
      
      set.status = 201;
      return {
        success: true,
        message: 'Course schedule created successfully',
        data: schedule,
      };
    },
    {
      body: t.Object({
        courseName: t.String({ minLength: 1 }),
        className: t.String({ minLength: 1 }),
        dayOfWeek: t.Number({ minimum: 1, maximum: 7 }),
        period: t.Number({ minimum: 1, maximum: 12 }), // Assuming max 12 periods a day
        classroom: t.Optional(t.String()),
        semester: t.String({ minLength: 1 }),
      }),
    }
  )
  
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      const existing = await prisma.courseSchedule.findUnique({
        where: { id: params.id },
      });
      
      if (!existing) {
        set.status = 404;
        throw new Error('Schedule not found');
      }
      
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden');
      }
      
      await prisma.courseSchedule.delete({
        where: { id: params.id },
      });
      
      return {
        success: true,
        message: 'Schedule deleted successfully',
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
