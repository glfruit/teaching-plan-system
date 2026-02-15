import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

const createBodySchema = t.Object({
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
});

const updateBodySchema = t.Object({
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
});

export const planTemplateRoutes = new Elysia({ prefix: '/plan-templates' })
  .use(authMiddleware)
  .use(requireAuth)
  .get(
    '/',
    async ({ user, query }) => {
      const page = Number(query?.page || 1);
      const limit = Number(query?.limit || 10);
      const skip = (page - 1) * limit;

      const where: any = { teacherId: user!.userId };
      if (query?.search) {
        where.title = { contains: query.search };
      }

      const [items, total] = await Promise.all([
        prisma.planTemplate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.planTemplate.count({ where }),
      ]);

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
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  )
  .get(
    '/:id',
    async ({ user, params, set }) => {
      const template = await prisma.planTemplate.findUnique({
        where: { id: params.id },
      });
      if (!template) {
        set.status = 404;
        throw new Error('Plan template not found');
      }
      if (template.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only access your own plan templates');
      }
      return { success: true, data: template };
    },
    { params: t.Object({ id: t.String() }) }
  )
  .post(
    '/',
    async ({ user, body }) => {
      const template = await prisma.planTemplate.create({
        data: {
          ...body,
          teacherId: user!.userId,
        },
      });
      return {
        success: true,
        message: 'Plan template created successfully',
        data: template,
      };
    },
    { body: createBodySchema }
  )
  .patch(
    '/:id',
    async ({ user, params, body, set }) => {
      const existing = await prisma.planTemplate.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        throw new Error('Plan template not found');
      }
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only update your own plan templates');
      }

      const template = await prisma.planTemplate.update({
        where: { id: params.id },
        data: {
          ...body,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Plan template updated successfully',
        data: template,
      };
    },
    {
      params: t.Object({ id: t.String() }),
      body: updateBodySchema,
    }
  )
  .delete(
    '/:id',
    async ({ user, params, set }) => {
      const existing = await prisma.planTemplate.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        throw new Error('Plan template not found');
      }
      if (existing.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only delete your own plan templates');
      }

      await prisma.planTemplate.delete({ where: { id: params.id } });
      return {
        success: true,
        message: 'Plan template deleted successfully',
      };
    },
    { params: t.Object({ id: t.String() }) }
  );
