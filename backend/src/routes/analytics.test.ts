import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { analyticsRoutes } from './analytics';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { describeWithDatabase } from '../test-utils/withDatabase';

/**
 * 统计分析 API 测试套件
 */
describeWithDatabase('Analytics API', () => {
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(analyticsRoutes);
  
  let authToken: string;
  let testUserId: string;
  let semesterId: string;
  let courseId: string;
  
  beforeAll(async () => {
    // Cleanup
    await prisma.traceLink.deleteMany({
      where: {
        createdBy: {
          username: 'analyst_test'
        }
      }
    });
    await prisma.coursewareAsset.deleteMany({
      where: {
        uploadedBy: {
          username: 'analyst_test'
        }
      }
    });
    await prisma.teachingPlanLesson.deleteMany({
      where: {
        book: {
          teacher: {
            username: 'analyst_test'
          }
        }
      }
    });
    await prisma.teachingPlanBook.deleteMany({
      where: {
        teacher: {
          username: 'analyst_test'
        }
      }
    });
    await prisma.courseOffering.deleteMany({
      where: {
        teacher: {
          username: 'analyst_test'
        }
      }
    });
    await prisma.course.deleteMany({
      where: {
        code: 'ANALYTICS-101'
      }
    });
    await prisma.semester.deleteMany({
      where: {
        name: '2026-2027学年第1学期（分析测试）'
      }
    });
    await prisma.teachingPlan.deleteMany({
      where: {
        teacher: {
          username: 'analyst_test'
        }
      }
    });
    await prisma.user.deleteMany({
      where: { username: 'analyst_test' }
    });
    
    // Create test user
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'analyst_test',
          email: 'analyst@example.com',
          password: 'password123',
          role: 'TEACHER',
          department: 'Mathematics'
        })
      })
    );
    
    const registerData: any = await registerResponse.json();
    authToken = registerData.data.accessToken;
    testUserId = registerData.data.user.id;

    // Create some test plans
    await prisma.teachingPlan.createMany({
      data: [
        {
          title: 'Plan 1',
          courseName: 'Math 101',
          className: 'Class A',
          duration: 45,
          objectives: 'Obj 1',
          keyPoints: 'Key 1',
          process: 'Process 1',
          htmlContent: '<p>Content 1</p>',
          status: 'DRAFT',
          teacherId: testUserId
        },
        {
          title: 'Plan 2',
          courseName: 'Math 101',
          className: 'Class B',
          duration: 90,
          objectives: 'Obj 2',
          keyPoints: 'Key 2',
          process: 'Process 2',
          htmlContent: '<p>Content 2</p>',
          status: 'PUBLISHED',
          teacherId: testUserId
        },
         {
          title: 'Plan 3',
          courseName: 'Math 102',
          className: 'Class C',
          duration: 45,
          objectives: 'Obj 3',
          keyPoints: 'Key 3',
          process: 'Process 3',
          htmlContent: '<p>Content 3</p>',
          status: 'ARCHIVED',
          teacherId: testUserId
        }
      ]
    });

    const semester = await prisma.semester.create({
      data: {
        name: '2026-2027学年第1学期（分析测试）',
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-01-20T00:00:00.000Z'),
        status: 'ACTIVE',
        createdById: testUserId,
      }
    });
    semesterId = semester.id;

    const course = await prisma.course.create({
      data: {
        code: 'ANALYTICS-101',
        name: '分析接口课程',
        department: 'Mathematics',
        ownerTeacherId: testUserId,
        status: 'ACTIVE',
      }
    });
    courseId = course.id;

    const offering = await prisma.courseOffering.create({
      data: {
        courseId,
        semesterId,
        className: '分析班级A',
        teacherId: testUserId,
        weeklyHours: 4,
        status: 'ACTIVE',
      }
    });

    const book = await prisma.teachingPlanBook.create({
      data: {
        title: '分析测试教案册',
        courseOfferingId: offering.id,
        semesterId,
        teacherId: testUserId,
        teacherName: 'analyst_test',
        targetClass: '分析班级A',
        totalHours: 32,
        status: 'PUBLISHED',
      }
    });

    const deliveryPlan = await prisma.deliveryPlan.create({
      data: {
        title: '分析授课计划',
        courseOfferingId: offering.id,
        ownerId: testUserId,
        status: 'PUBLISHED',
      }
    });
    const deliveryWeek = await prisma.deliveryPlanWeek.create({
      data: {
        deliveryPlanId: deliveryPlan.id,
        weekNo: 1,
        hours: 4,
        unitOrTask: '分析任务',
        linkedStandardTopicIds: [],
      }
    });

    const lessonA = await prisma.teachingPlanLesson.create({
      data: {
        bookId: book.id,
        lessonNo: 1,
        title: '分析单次课A',
        weekNo: 1,
        duration: 90,
        objectives: '目标A',
        keyPoints: '重点A',
        outline: '<p>过程A</p>',
        status: 'PUBLISHED',
        deliveryPlanId: deliveryPlan.id,
        deliveryPlanWeekId: deliveryWeek.id,
        ideologicalElements: '工匠精神',
        integrationMethod: '案例讨论',
        courseStandardTopicRefs: ['topic-a'],
      }
    });

    const lessonB = await prisma.teachingPlanLesson.create({
      data: {
        bookId: book.id,
        lessonNo: 2,
        title: '分析单次课B',
        weekNo: 2,
        duration: 45,
        objectives: '目标B',
        keyPoints: '重点B',
        outline: '<p>过程B</p>',
        status: 'DRAFT',
      }
    });

    await prisma.traceLink.create({
      data: {
        type: 'DELIVERY_TO_LESSON',
        sourceType: 'delivery-plan',
        sourceId: deliveryPlan.id,
        targetType: 'teaching-plan-lesson',
        targetId: lessonA.id,
        createdById: testUserId,
      }
    });

    await prisma.traceLink.create({
      data: {
        type: 'LESSON_TO_COURSEWARE',
        sourceType: 'teaching-plan-lesson',
        sourceId: lessonA.id,
        targetType: 'courseware',
        targetId: 'courseware-a',
        createdById: testUserId,
      }
    });
  });
  
  afterAll(async () => {
    await prisma.traceLink.deleteMany({
      where: {
        createdById: testUserId
      }
    });
    await prisma.coursewareAsset.deleteMany({
      where: {
        uploadedById: testUserId
      }
    });
    await prisma.teachingPlanLesson.deleteMany({
      where: {
        book: {
          teacherId: testUserId
        }
      }
    });
    await prisma.teachingPlanBook.deleteMany({
      where: {
        teacherId: testUserId
      }
    });
    if (courseId) {
      await prisma.course.deleteMany({
        where: { id: courseId }
      });
    }
    if (semesterId) {
      await prisma.semester.deleteMany({
        where: { id: semesterId }
      });
    }
    await prisma.teachingPlan.deleteMany({
      where: { teacherId: testUserId }
    });
    await prisma.user.delete({
      where: { id: testUserId }
    });
  });

  describe('GET /analytics/workload', () => {
    it('should return workload statistics', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/workload', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.totalPlans).toBe(3);
      expect(data.data.totalDuration).toBe(180); // 45 + 90 + 45
    });
  });

  describe('GET /analytics/execution', () => {
    it('should return plan execution analysis', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/execution', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.statusDistribution.DRAFT).toBe(1);
      expect(data.data.statusDistribution.PUBLISHED).toBe(1);
      expect(data.data.statusDistribution.ARCHIVED).toBe(1);
    });
  });

  describe('GET /analytics/quality', () => {
    it('should return quality analysis', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/quality', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.averageCompleteness).toBeDefined();
    });
  });

  describe('GET /analytics/teaching-chain', () => {
    it('should return teaching-chain analytics with semester/course/week dimensions', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/teaching-chain', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.summary.totalLessons).toBe(2);
      expect(data.data.summary.publishedLessons).toBe(1);
      expect(data.data.summary.totalSemesters).toBe(1);
      expect(data.data.summary.totalCourses).toBe(1);
      expect(data.data.summary.totalWeeks).toBe(2);
      expect(data.data.summary.consistencyScore).toBe(50);
      expect(data.data.summary.deliveryTraceCoverage).toBe(50);
      expect(data.data.summary.coursewareTraceCoverage).toBe(50);
      expect(data.data.bySemester.length).toBe(1);
      expect(data.data.byCourse.length).toBe(1);
      expect(data.data.byWeek.length).toBe(2);
    });

    it('should support semester/course/week filters', async () => {
      const response = await app.handle(
        new Request(`http://localhost/analytics/teaching-chain?semesterId=${semesterId}&courseId=${courseId}&weekNo=1`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(200);
      const data: any = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.summary.totalLessons).toBe(1);
      expect(data.data.summary.publishedLessons).toBe(1);
      expect(data.data.byWeek.length).toBe(1);
      expect(data.data.byWeek[0].weekNo).toBe(1);
      expect(data.data.filters.semesterId).toBe(semesterId);
      expect(data.data.filters.courseId).toBe(courseId);
      expect(data.data.filters.weekNo).toBe(1);
    });

    it('should reject invalid weekNo filter', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/teaching-chain?weekNo=0', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      expect(response.status).toBe(422);
      const data: any = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('GET /analytics/export', () => {
    it('should export analytics data as JSON', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/export?format=json', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');
      const data: any = await response.json();
      expect(data.workload).toBeDefined();
      expect(data.execution).toBeDefined();
      expect(data.quality).toBeDefined();
      expect(data.trend).toBeDefined();
    });

    it('should export analytics data as CSV', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/export?format=csv', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/csv');
      const text = await response.text();
      expect(text).toContain('Metric,Value');
      expect(text).toContain('Total Plans,3');
    });
  });

  describe('POST /analytics/export', () => {
    it('should export analytics data as CSV via POST', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/export', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ format: 'csv' })
        })
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/csv');
      const text = await response.text();
      expect(text).toContain('Metric,Value');
    });

    it('should export analytics data as Excel', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/export', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ format: 'excel' })
        })
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Check for ZIP signature (PK\x03\x04)
      expect(buffer.toString('hex').startsWith('504b0304')).toBe(true);
    });

    it('should export analytics data as PDF', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/export', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ format: 'pdf' })
        })
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/pdf');
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Check for PDF signature (%PDF)
      expect(buffer.toString().startsWith('%PDF')).toBe(true);
    });

    it('should export analytics data as Word', async () => {
      const response = await app.handle(
        new Request('http://localhost/analytics/export', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ format: 'word' })
        })
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });
  });
});
