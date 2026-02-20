import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { exportRoutes } from './export';
import { authRoutes } from './auth';
import { teachingPlanRoutes } from './teaching-plans';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { describeWithDatabase } from '../test-utils/withDatabase';

/**
 * 导出 API 测试套件
 * 测试 Word 导出功能
 */
describeWithDatabase('Export API', () => {
  // 组合路由
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(teachingPlanRoutes)
    .use(exportRoutes);
  
  let authToken: string;
  let testUserId: string;
  let testPlanId: string;
  let otherToken: string;
  let otherUserId: string;
  const suffix = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const primaryUsername = `exporttestuser_${suffix}`;
  const otherUsername = `otherexportuser_${suffix}`;
  
  // 测试前准备
  beforeAll(async () => {
    // 创建测试用户
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: primaryUsername,
          email: `${primaryUsername}@test.com`,
          password: 'password123',
          role: 'TEACHER',
          department: '测试系'
        })
      })
    );
    
    const registerData = await registerResponse.json();
    authToken = registerData.data.accessToken;
    testUserId = registerData.data.user.id;
    
    // 创建测试教案
    const planResponse = await app.handle(
      new Request('http://localhost/teaching-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: '测试导出教案',
          courseName: '测试课程',
          className: '测试班级',
          duration: 90,
          objectives: '测试目标',
          keyPoints: '测试重点',
          process: '测试过程',
          blackboard: '测试板书',
          reflection: '测试反思',
          methods: '讲授法',
          resources: 'PPT',
          htmlContent: '<p>测试内容</p>'
        })
      })
    );
    
    if (!planResponse.ok) {
      const errorText = await planResponse.text();
      console.log('Create plan error:', errorText);
      throw new Error('Failed to create test plan');
    }
    
    const planData = await planResponse.json();
    testPlanId = planData.data.id;

    // 创建另一个用户，用于权限测试
    await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: otherUsername,
          email: `${otherUsername}@test.com`,
          password: 'password123'
        })
      })
    );
    
    const otherLogin = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: otherUsername,
          password: 'password123'
        })
      })
    );
    const otherData = await otherLogin.json();
    otherToken = otherData.data.accessToken;
    otherUserId = otherData.data.user.id;
  });

  afterAll(async () => {
    const userIds = [testUserId, otherUserId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.teachingPlan.deleteMany({
        where: { teacherId: { in: userIds } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } }
      });
    }
  });

  /**
   * 测试导出服务健康检查
   */
  describe('GET /export/health', () => {
    it('should check export service health', async () => {
      const response = await app.handle(
        new Request('http://localhost/export/health', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      // 如果导出服务未运行，应该返回 503
      expect([200, 503]).toContain(response.status);
    });
  });

  /**
   * 测试导出 Word 文档
   */
  describe('POST /export/word/:id', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/word/${testPlanId}`, {
          method: 'POST'
        })
      );
      
      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it('should return 404 for non-existent plan', async () => {
      const response = await app.handle(
        new Request('http://localhost/export/word/non-existent-id', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(404);
    });

    it('should prevent exporting other user\'s plans', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/word/${testPlanId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${otherToken}` }
        })
      );
      
      expect(response.status).toBe(403);
    });

    it('should export teaching plan to Word', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/word/${testPlanId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      // 外部导出服务不可用时允许 500/503，避免本地缺少 Python 服务导致测试不稳定
      expect([200, 500, 503]).toContain(response.status);

      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        const contentDisposition = response.headers.get('content-disposition');
        expect(contentDisposition).toContain('.docx');
      }
    });
  });

  describe('POST /export/preview/:id', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/preview/${testPlanId}`, {
          method: 'POST'
        })
      );

      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it('should return 404 for non-existent plan', async () => {
      const response = await app.handle(
        new Request('http://localhost/export/preview/non-existent-id', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(404);
    });

    it('should prevent previewing other user\'s plans', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/preview/${testPlanId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${otherToken}` }
        })
      );

      expect(response.status).toBe(403);
    });

    it('should return export preview for own plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/preview/${testPlanId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.plan.id).toBe(testPlanId);
      expect(data.data.plan.title).toBe('测试导出教案');
      expect(Array.isArray(data.data.sections)).toBe(true);
      expect(data.data.sections.length).toBeGreaterThan(0);
    });
  });

  describe('POST /export/excel/:id', () => {
    it('should export teaching plan to Excel', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/excel/${testPlanId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      expect(buffer.toString('hex').startsWith('504b0304')).toBe(true);
    });
  });

  describe('POST /export/pdf/:id', () => {
    it('should export teaching plan to PDF', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/pdf/${testPlanId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/pdf');

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      expect(buffer.toString().startsWith('%PDF')).toBe(true);
    });
  });
});
