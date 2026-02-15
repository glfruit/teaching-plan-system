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
  
  beforeAll(async () => {
    // Cleanup
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
    
    const registerData = await registerResponse.json();
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
  });
  
  afterAll(async () => {
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
      const data = await response.json();
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
      const data = await response.json();
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
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.averageCompleteness).toBeDefined();
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
      const data = await response.json();
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
