import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { weeklyPlanRoutes } from './weekly-plans';
import { semesterPlanRoutes } from './semester-plans';
import { teachingPlanRoutes } from './teaching-plans';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

describe('Weekly Plan API', () => {
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(semesterPlanRoutes)
    .use(weeklyPlanRoutes)
    .use(teachingPlanRoutes);
  
  let authToken: string;
  let testUserId: string;
  let semesterPlanId: string;
  let weeklyPlanId: string;
  let teachingPlanId: string;
  
  beforeAll(async () => {
    // Cleanup
    await prisma.semesterPlan.deleteMany({
      where: {
        teacher: {
          username: { in: ['testteacher_week'] }
        }
      }
    });
    await prisma.user.deleteMany({
      where: { username: { in: ['testteacher_week'] } }
    });
    
    // Create User
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testteacher_week',
          email: 'test_week@example.com',
          password: 'password123',
          role: 'TEACHER',
          department: 'Computer Science'
        })
      })
    );
    
    const registerData = await registerResponse.json();
    authToken = registerData.data.accessToken;
    testUserId = registerData.data.user.id;

    // Create Semester Plan
    const planResponse = await app.handle(
      new Request('http://localhost/semester-plans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            courseName: 'Weekly Plan Test Course',
            semester: '2025-2026-1',
            totalWeeks: 18,
            weeklyHours: 4,
            startDate: new Date().toISOString()
        })
      })
    );
    const planData = await planResponse.json();
    semesterPlanId = planData.data.id;
    weeklyPlanId = planData.data.weeklyPlans[0].id; // Get first week

    // Create Teaching Plan (for linking)
    const tpResponse = await app.handle(
        new Request('http://localhost/teaching-plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: 'Test Lesson for Week 1',
                courseName: 'Test Course',
                className: 'Class 1',
                duration: 45,
                objectives: 'Test',
                keyPoints: 'Test',
                process: 'Test',
                htmlContent: '<p>Test</p>'
            })
        })
    );
    const tpData = await tpResponse.json();
    teachingPlanId = tpData.data.id;
  });
  
  afterAll(async () => {
    if (testUserId) {
        await prisma.semesterPlan.deleteMany({
            where: { teacherId: testUserId }
        });
        await prisma.teachingPlan.deleteMany({
            where: { teacherId: testUserId }
        });
        await prisma.user.delete({
            where: { id: testUserId }
        });
    }
  });

  describe('PUT /weekly-plans/:id', () => {
    it('should update weekly plan content and status', async () => {
      const response = await app.handle(
        new Request(`http://localhost/weekly-plans/${weeklyPlanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            plannedContent: 'Updated content for week 1',
            status: 'IN_PROGRESS'
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.plannedContent).toBe('Updated content for week 1');
      expect(data.data.status).toBe('IN_PROGRESS');
    });

    it('should link teaching plan to weekly plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/weekly-plans/${weeklyPlanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            teachingPlanId: teachingPlanId
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.teachingPlanId).toBe(teachingPlanId);
      
      // Verify relation is loaded? Usually update returns the updated object.
      // If we want to verify relation, we might need GET.
    });
  });

  describe('GET /weekly-plans/:id', () => {
    it('should get weekly plan with details', async () => {
        const response = await app.handle(
            new Request(`http://localhost/weekly-plans/${weeklyPlanId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        );
        
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.id).toBe(weeklyPlanId);
        expect(data.data.teachingPlan).toBeDefined();
        expect(data.data.teachingPlan.id).toBe(teachingPlanId);
    });
  });
});
