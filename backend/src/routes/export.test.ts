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
  let exportSemesterId: string;
  let exportCourseId: string;
  let exportOfferingId: string;
  let exportBookId: string;
  let exportLessonId: string;
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
    
    const registerData: any = await registerResponse.json();
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
    
    const planData: any = await planResponse.json();
    testPlanId = planData.data.id;

    const semester = await prisma.semester.create({
      data: {
        name: `导出测试学期-${suffix}`,
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-01-20T00:00:00.000Z'),
        status: 'ACTIVE',
        createdById: testUserId,
      },
    });
    exportSemesterId = semester.id;

    const course = await prisma.course.create({
      data: {
        code: `EXPORT-${suffix}`,
        name: '导出链路课程',
        department: '测试系',
        ownerTeacherId: testUserId,
        status: 'ACTIVE',
      },
    });
    exportCourseId = course.id;

    const offering = await prisma.courseOffering.create({
      data: {
        courseId: exportCourseId,
        semesterId: exportSemesterId,
        className: '导出班级2401',
        teacherId: testUserId,
        weeklyHours: 4,
        status: 'ACTIVE',
      },
    });
    exportOfferingId = offering.id;

    const book = await prisma.teachingPlanBook.create({
      data: {
        title: '导出测试教案册',
        courseOfferingId: exportOfferingId,
        semesterId: exportSemesterId,
        teacherId: testUserId,
        teacherName: primaryUsername,
        targetClass: '导出班级2401',
        totalHours: 64,
        status: 'DRAFT',
      },
    });
    exportBookId = book.id;

    const lesson = await prisma.teachingPlanLesson.create({
      data: {
        bookId: exportBookId,
        lessonNo: 1,
        title: '导出测试单次课',
        className: '导出班级2401',
        duration: 90,
        objectives: '导出目标',
        keyPoints: '导出重点',
        outline: '<p>导出流程内容</p>',
        methods: '讲授+讨论',
        teachingAids: 'PPT+实验箱',
        status: 'DRAFT',
      },
    });
    exportLessonId = lesson.id;

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
    const otherData: any = await otherLogin.json();
    otherToken = otherData.data.accessToken;
    otherUserId = otherData.data.user.id;
  });

  afterAll(async () => {
    if (exportCourseId) {
      await prisma.course.deleteMany({
        where: { id: exportCourseId }
      });
    }
    if (exportSemesterId) {
      await prisma.semester.deleteMany({
        where: { id: exportSemesterId }
      });
    }

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

    it('should support exporting teaching plan book as Word source', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/word/${exportBookId}?sourceType=teaching-plan-book`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect([200, 500, 503]).toContain(response.status);
      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
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
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.plan.id).toBe(testPlanId);
      expect(data.data.plan.title).toBe('测试导出教案');
      expect(Array.isArray(data.data.sections)).toBe(true);
      expect(data.data.sections.length).toBeGreaterThan(0);
    });

    it('should return export preview for lesson source', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/preview/${exportLessonId}?sourceType=teaching-plan-lesson`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.plan.id).toBe(exportLessonId);
      expect(data.data.plan.title).toBe('导出测试单次课');
      expect(data.data.plan.courseName).toBe('导出链路课程');
    });

    it('should return export preview for teaching plan book source', async () => {
      const response = await app.handle(
        new Request(`http://localhost/export/preview/${exportBookId}?sourceType=teaching-plan-book`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.plan.id).toBe(exportBookId);
      expect(data.data.plan.title).toBe('导出测试教案册');
      expect(data.data.plan.className).toBe('导出班级2401');
      expect(data.data.plan.courseName).toBe('导出链路课程');
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
