import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { planTemplateRoutes } from './plan-templates';
import { prisma } from '../lib/prisma';
import { describeWithDatabase } from '../test-utils/withDatabase';

describeWithDatabase('Plan Template API', () => {
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(planTemplateRoutes);

  let authToken = '';
  let otherToken = '';
  let testUserId = '';
  let otherUserId = '';
  let templateId = '';

  const templatePayload = {
    title: '高效导入课模板',
    courseName: '小学语文',
    className: '三年级1班',
    duration: 40,
    objectives: '<p>目标</p>',
    keyPoints: '<p>重点</p>',
    process: '<p>流程</p>',
    blackboard: '<p>板书</p>',
    reflection: '<p>反思</p>',
    methods: '<p>讲授+讨论</p>',
    resources: '<p>课件</p>',
    htmlContent: '<p>流程</p>',
    contentJson: {
      process: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '流程' }] }],
      },
    },
  };

  beforeAll(async () => {
    await prisma.planTemplate.deleteMany({
      where: {
        teacher: {
          username: { in: ['template-owner', 'template-other'] },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        username: { in: ['template-owner', 'template-other'] },
      },
    });

    const ownerRegister = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'template-owner',
          email: 'template-owner@example.com',
          password: 'password123',
          role: 'TEACHER',
        }),
      })
    );
    const ownerData = await ownerRegister.json();
    authToken = ownerData.data.accessToken;
    testUserId = ownerData.data.user.id;

    const otherRegister = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'template-other',
          email: 'template-other@example.com',
          password: 'password123',
          role: 'TEACHER',
        }),
      })
    );
    const otherData = await otherRegister.json();
    otherToken = otherData.data.accessToken;
    otherUserId = otherData.data.user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.planTemplate.deleteMany({ where: { teacherId: testUserId } });
    }
    if (otherUserId) {
      await prisma.planTemplate.deleteMany({ where: { teacherId: otherUserId } });
    }
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUserId, otherUserId].filter(Boolean) as string[] },
      },
    });
  });

  it('should create template for current teacher', async () => {
    const response = await app.handle(
      new Request('http://localhost/plan-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(templatePayload),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.teacherId).toBe(testUserId);
    expect(data.data.title).toBe(templatePayload.title);
    templateId = data.data.id;
  });

  it('should list only current teacher templates', async () => {
    await app.handle(
      new Request('http://localhost/plan-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({
          ...templatePayload,
          title: '其他人模板',
        }),
      })
    );

    const response = await app.handle(
      new Request('http://localhost/plan-templates?page=1&limit=10', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.items)).toBe(true);
    expect(data.data.items.every((item: any) => item.teacherId === testUserId)).toBe(true);
  });

  it('should reject cross-user access on get/update/delete', async () => {
    const getResponse = await app.handle(
      new Request(`http://localhost/plan-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${otherToken}` },
      })
    );
    expect(getResponse.status).toBe(403);

    const updateResponse = await app.handle(
      new Request(`http://localhost/plan-templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({ title: '越权修改' }),
      })
    );
    expect(updateResponse.status).toBe(403);

    const deleteResponse = await app.handle(
      new Request(`http://localhost/plan-templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${otherToken}` },
      })
    );
    expect(deleteResponse.status).toBe(403);
  });

  it('should delete own template', async () => {
    const response = await app.handle(
      new Request(`http://localhost/plan-templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    const getAfterDelete = await app.handle(
      new Request(`http://localhost/plan-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
    );
    expect(getAfterDelete.status).toBe(404);
  });
});
