import { Elysia, t } from 'elysia'
import { prisma } from '../lib/prisma'
import { authMiddleware, requireAuth } from '../middleware/auth'
import { TemplateCategory } from '@prisma/client'

export const templateRoutes = new Elysia({ prefix: '/templates' })
  .use(authMiddleware)
  .use(requireAuth)
  
  // Get template list
  .get('/', async ({ user, query }) => {
    const where: any = {}
    
    // System templates OR user's own templates
    where.OR = [
      { isSystem: true },
      { creatorId: user!.userId },
    ]
    
    if (query?.category) {
      where.category = query.category as TemplateCategory
    }
    
    const templates = await prisma.teachingTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' },
        { updatedAt: 'desc' },
      ],
    })
    
    return {
      success: true,
      data: templates,
    }
  }, {
    query: t.Object({
      category: t.Optional(t.String()),
    }),
  })
  
  // Get single template
  .get('/:id', async ({ params, user, set }) => {
    const template = await prisma.teachingTemplate.findFirst({
      where: {
        id: params.id,
        OR: [
          { isSystem: true },
          { creatorId: user!.userId },
        ],
      },
    })
    
    if (!template) {
      set.status = 404
      return { success: false, message: 'Template not found' }
    }
    
    return {
      success: true,
      data: template,
    }
  }, {
    params: t.Object({
      id: t.String(),
    })
  })
  
  // Create template
  .post('/', async ({ body, user }) => {
    const template = await prisma.teachingTemplate.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category as TemplateCategory,
        structure: body.structure,
        creatorId: user!.userId,
        isSystem: false,
      },
    })
    
    return {
      success: true,
      data: template,
    }
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      category: t.Enum(TemplateCategory),
      structure: t.Any(),
    }),
  })
  
  // Update template
  .put('/:id', async ({ params, body, user, set }) => {
    // Only update own templates (system templates are protected implicitly by creatorId check)
    const result = await prisma.teachingTemplate.updateMany({
      where: {
        id: params.id,
        creatorId: user!.userId,
        isSystem: false,
      },
      data: {
        name: body.name,
        description: body.description,
        category: body.category ? (body.category as TemplateCategory) : undefined,
        structure: body.structure,
      },
    })
    
    if (result.count === 0) {
      set.status = 404 // or 403
      return { success: false, message: 'Template not found or permission denied' }
    }
    
    return {
      success: true,
      message: 'Template updated successfully',
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      category: t.Optional(t.Enum(TemplateCategory)),
      structure: t.Optional(t.Any()),
    }),
  })
  
  // Delete template
  .delete('/:id', async ({ params, user, set }) => {
    const result = await prisma.teachingTemplate.deleteMany({
      where: {
        id: params.id,
        creatorId: user!.userId,
        isSystem: false,
      },
    })
    
    if (result.count === 0) {
      set.status = 404
      return { success: false, message: 'Template not found or permission denied' }
    }
    
    return {
      success: true,
      message: 'Template deleted successfully',
    }
  }, {
    params: t.Object({
      id: t.String(),
    })
  })
