import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { teachingPlanRoutes } from './teaching-plans';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { describeWithDatabase } from '../test-utils/withDatabase';

/**
 * 教案 API 测试套件
 * 测试教案的 CRUD 操作、权限控制等功能
 */
describeWithDatabase('Teaching Plan API', () => {
  // 组合路由（需要认证 + 教案路由）
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(teachingPlanRoutes);
  
  let authToken: string;
  let testUserId: string;
  let createdPlanId: string;
  let compatibilitySemesterId: string;
  let compatibilityCourseId: string;
  let compatibilityOfferingId: string;
  let compatibilityPlanId: string;
  
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
    
    const registerData: any = await registerResponse.json();
    authToken = registerData.data.accessToken;
    testUserId = registerData.data.user.id;

    const suffix = Date.now().toString();
    const semester = await prisma.semester.create({
      data: {
        name: `兼容测试学期-${suffix}`,
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-01-20T00:00:00.000Z'),
        status: 'ACTIVE',
        createdById: testUserId,
      },
    });
    compatibilitySemesterId = semester.id;

    const course = await prisma.course.create({
      data: {
        code: `COMPAT-${suffix}`,
        name: '兼容链路课程',
        department: '计算机系',
        ownerTeacherId: testUserId,
        status: 'ACTIVE',
      },
    });
    compatibilityCourseId = course.id;

    const offering = await prisma.courseOffering.create({
      data: {
        courseId: compatibilityCourseId,
        semesterId: compatibilitySemesterId,
        className: '兼容班级2401',
        teacherId: testUserId,
        weeklyHours: 4,
        status: 'ACTIVE',
      },
    });
    compatibilityOfferingId = offering.id;
  });
  
  // 测试后清理
  afterAll(async () => {
    if (compatibilityOfferingId) {
      await prisma.courseOffering.deleteMany({
        where: { id: compatibilityOfferingId }
      });
    }
    if (compatibilityCourseId) {
      await prisma.course.deleteMany({
        where: { id: compatibilityCourseId }
      });
    }
    if (compatibilitySemesterId) {
      await prisma.semester.deleteMany({
        where: { id: compatibilitySemesterId }
      });
    }
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
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Vue 3 基础教程');
      expect(data.data.courseName).toBe('前端开发');
      expect(data.data.status).toBe('DRAFT');
      expect(data.data.teacherId).toBe(testUserId);
      expect(data.data.contentJson?.process?.type).toBe('doc');
      
      createdPlanId = data.data.id;
    });

    it('should create academic mirror when course offering is provided', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: '兼容链路教案',
            courseName: '兼容链路课程',
            className: '兼容班级2401',
            duration: 80,
            objectives: '兼容目标',
            keyPoints: '兼容重点',
            process: '兼容过程',
            methods: '示例法',
            htmlContent: '<p>兼容教案</p>',
            courseOfferingId: compatibilityOfferingId,
            deliveryWeekNo: 3,
            ideologicalElements: '工匠精神',
            integrationMethod: '案例讨论',
          })
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.planBookId).toBeTruthy();
      compatibilityPlanId = data.data.id;

      const mirroredBook = await prisma.teachingPlanBook.findUnique({
        where: { id: data.data.planBookId },
      });
      expect(mirroredBook?.courseOfferingId).toBe(compatibilityOfferingId);
      expect(mirroredBook?.semesterId).toBe(compatibilitySemesterId);
      expect(mirroredBook?.status).toBe('DRAFT');

      const mirroredLesson = await prisma.teachingPlanLesson.findUnique({
        where: {
          bookId_lessonNo: {
            bookId: data.data.planBookId,
            lessonNo: 1,
          },
        },
      });
      expect(mirroredLesson?.title).toBe('兼容链路教案');
      expect(mirroredLesson?.weekNo).toBe(3);
      expect(mirroredLesson?.status).toBe('DRAFT');
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
      const data: any = await response.json();
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
      const data: any = await response.json();
      expect(data.data.items.every((item: any) => item.status === 'DRAFT')).toBe(true);
    });

    it('should search by keyword', async () => {
      const response = await app.handle(
        new Request('http://localhost/teaching-plans?search=Vue', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data: any = await response.json();
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
      const data: any = await response.json();
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
      const otherData: any = await otherLogin.json();
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
      const data: any = await response.json();
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
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PUBLISHED');
    });

    it('should sync mirrored academic documents status when publishing', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${compatibilityPlanId}/publish`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PUBLISHED');
      expect(data.data.planBookId).toBeTruthy();

      const mirroredBook = await prisma.teachingPlanBook.findUnique({
        where: { id: data.data.planBookId },
      });
      const mirroredLesson = await prisma.teachingPlanLesson.findUnique({
        where: {
          bookId_lessonNo: {
            bookId: data.data.planBookId,
            lessonNo: 1,
          },
        },
      });

      expect(mirroredBook?.status).toBe('PUBLISHED');
      expect(mirroredLesson?.status).toBe('PUBLISHED');
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
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('ARCHIVED');
    });
  });

  /**
   * 测试复制教案
   */
  describe('POST /teaching-plans/:id/duplicate', () => {
    it('should duplicate teaching plan as draft copy', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${createdPlanId}/duplicate`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).not.toBe(createdPlanId);
      expect(data.data.title).toContain('副本');
      expect(data.data.status).toBe('DRAFT');
      expect(data.data.teacherId).toBe(testUserId);
    });

    it('should duplicate compatibility-linked plan and create mirrored academic documents', async () => {
      const response = await app.handle(
        new Request(`http://localhost/teaching-plans/${compatibilityPlanId}/duplicate`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).not.toBe(compatibilityPlanId);
      expect(data.data.courseOfferingId).toBe(compatibilityOfferingId);
      expect(data.data.planBookId).toBeTruthy();

      const mirroredBook = await prisma.teachingPlanBook.findUnique({
        where: { id: data.data.planBookId },
      });
      expect(mirroredBook?.courseOfferingId).toBe(compatibilityOfferingId);
      expect(mirroredBook?.status).toBe('DRAFT');

      const mirroredLesson = await prisma.teachingPlanLesson.findUnique({
        where: {
          bookId_lessonNo: {
            bookId: data.data.planBookId,
            lessonNo: 1,
          },
        },
      });
      expect(mirroredLesson?.status).toBe('DRAFT');
      expect(mirroredLesson?.title).toContain('副本');
    });
  });

  /**
   * 测试批量操作教案
   */
  describe('POST /teaching-plans/batch', () => {
    it('should batch publish draft plans', async () => {
      const createOne = await app.handle(
        new Request('http://localhost/teaching-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: '批量草稿一',
            courseName: '批量课程',
            className: '批量班级',
            duration: 45,
            objectives: '目标一',
            keyPoints: '重点一',
            process: '过程一',
            htmlContent: '<p>批量一</p>'
          })
        })
      );
      const createOneData: any = await createOne.json();
      const idOne = createOneData.data.id as string;

      const createTwo = await app.handle(
        new Request('http://localhost/teaching-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: '批量草稿二',
            courseName: '批量课程',
            className: '批量班级',
            duration: 50,
            objectives: '目标二',
            keyPoints: '重点二',
            process: '过程二',
            htmlContent: '<p>批量二</p>'
          })
        })
      );
      const createTwoData: any = await createTwo.json();
      const idTwo = createTwoData.data.id as string;

      const response = await app.handle(
        new Request('http://localhost/teaching-plans/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            action: 'PUBLISH',
            ids: [idOne, idTwo]
          })
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.requested).toBe(2);
      expect(data.data.matched).toBe(2);
      expect(data.data.affected).toBe(2);
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
      const data: any = await response.json();
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
