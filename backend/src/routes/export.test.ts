import { describe, it, expect, beforeAll } from 'bun:test';
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
  
  // 测试前准备
  beforeAll(async () => {
    // 清理测试数据
    await prisma.teachingPlan.deleteMany({
      where: {
        teacher: {
          username: { in: ['exporttestuser'] }
        }
      }
    });
    await prisma.user.deleteMany({
      where: { username: 'exporttestuser' }
    });
    
    // 创建测试用户
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'exporttestuser',
          email: 'export@test.com',
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
      // 创建另一个用户
      await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'otherexportuser',
            email: 'otherexport@test.com',
            password: 'password123'
          })
        })
      );
      
      const otherLogin = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'otherexportuser',
            password: 'password123'
          })
        })
      );
      const otherData = await otherLogin.json();
      const otherToken = otherData.data.accessToken;
      
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
      
      // 如果导出服务未运行，跳过此测试
      if (response.status === 503) {
        console.log('导出服务未运行，跳过测试');
        return;
      }
      
      expect(response.status).toBe(200);

      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      const contentDisposition = response.headers.get('content-disposition');
      expect(contentDisposition).toContain('.docx');
    });
  });
});
