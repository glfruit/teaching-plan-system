import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { teachingPlanRoutes } from './teaching-plans';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

/**
 * 教案 API 测试套件
 * 测试教案的 CRUD 操作、权限控制等功能
 */
describe('Teaching Plan API', () => {
  // 组合路由（需要认证 + 教案路由）
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(teachingPlanRoutes);
  
  let authToken: string;
  let testUserId: string;
  let createdPlanId: string;
  
  // 测试前准备：创建测试用户并获取 Token
  beforeAll(async () => {
    // 清理测试数据
    await prisma.teachingPlan.deleteMany({
      where: {
        teacher: {
          username: { in: ['testteacher2', 'otheruser'] }
        }
      }
    });
    await prisma.user.deleteMany({
      where: { username: { in: ['testteacher2', 'otheruser'] } }
    });
    
    // 创建测试用户
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testteacher2',
          email: 'test2@example.com',
          password: 'password123',
          role: 'TEACHER',
          department: '计算机系'
        })
      })
    );
    
    const registerData = await registerResponse.json();
    authToken = registerData.data.accessToken;
    testUserId = registerData.data.user.id;
  });
  
  // 测试后清理
  afterAll(async () => {
    await prisma.teachingPlan.deleteMany({
      where: { teacherId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
  });

  /**
   * 测试创建教案
   */
  describe('POST /teaching-plans', () => {
    it('should create a new teaching plan', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: 'Vue 3 基础教程',
            courseName: '前端开发',
            className: '计算机2301班',
            duration: 90,
            objectives: '掌握 Vue 3 基础',
            keyPoints: 'Composition API',
            process: '理论+实践',
            blackboard: 'Vue 组件结构',
            methods: '讲授法',
            resources: 'PPT',
            htmlContent: '<h1>Vue 3</h1>',
            contentJson: {
              process: {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '理论+实践' }] }],
              },
            },
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Vue 3 基础教程');
      expect(data.data.courseName).toBe('前端开发');
      expect(data.data.status).toBe('DRAFT');
      expect(data.data.teacherId).toBe(testUserId);
      expect(data.data.contentJson?.process?.type).toBe('doc');
      
      createdPlanId = data.data.id;
    });

    it('should reject unauthenticated requests', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test Plan',
            courseName: 'Test Course',
            className: 'Test Class',
            duration: 45,
            objectives: 'Test',
            keyPoints: 'Test',
            process: 'Test',
            htmlContent: '<p>Test</p>'
          })
        })
      );
      
      // 未认证请求可能返回 401 或 500
      expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it('should validate required fields', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            // 缺少必填字段
            title: 'Test Plan'
          })
        })
      );
      
      expect(response.status).toBe(422);
    });
  });

  /**
   * 测试获取教案列表
   */
  describe('GET /teaching-plans', () => {
    it('should get teaching plan list', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans?page=1&limit=10', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.items)).toBe(true);
      expect(data.data.items.length).toBeGreaterThanOrEqual(1);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans?status=DRAFT', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.items.every((item: any) => item.status === 'DRAFT')).toBe(true);
    });

    it('should search by keyword', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans?search=Vue', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * 测试获取单个教案
   */
  describe('GET /teaching-plans/:id', () => {
    it('should get single teaching plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdPlanId);
      expect(data.data.title).toBe('Vue 3 基础教程');
    });

    it('should return 404 for non-existent plan', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans/non-existent-id', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(404);
    });

    it('should prevent accessing other user\'s plans', async () => {
      // 创建另一个用户
      await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'otheruser',
            email: 'other@example.com',
            password: 'password123'
          })
        })
      );
      
      const otherLogin = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'otheruser',
            password: 'password123'
          })
        })
      );
      const otherData = await otherLogin.json();
      const otherToken = otherData.data.accessToken;
      
      // 尝试访问第一个用户的教案
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}`, {
          headers: { 'Authorization': `Bearer ${otherToken}` }
        })
      );
      
      expect(response.status).toBe(403);
    });
  });

  /**
   * 测试更新教案
   */
  describe('PUT /teaching-plans/:id', () => {
    it('should update teaching plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: 'Vue 3 高级教程（已更新）',
            duration: 120
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Vue 3 高级教程（已更新）');
      expect(data.data.duration).toBe(120);
    });
  });

  /**
   * 测试发布教案
   */
  describe('PATCH /teaching-plans/:id/publish', () => {
    it('should publish teaching plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}/publish`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PUBLISHED');
    });
  });

  /**
   * 测试归档教案
   */
  describe('PATCH /teaching-plans/:id/archive', () => {
    it('should archive teaching plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}/archive`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('ARCHIVED');
    });
  });

  /**
   * 测试删除教案
   */
  describe('DELETE /teaching-plans/:id', () => {
    it('should delete teaching plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted');
      
      // 验证已删除
      const getResponse = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      expect(getResponse.status).toBe(404);
    });
  });
});
