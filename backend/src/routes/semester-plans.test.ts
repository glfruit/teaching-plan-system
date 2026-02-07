import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { semesterPlanRoutes } from './semester-plans';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

describe('Semester Plan API', () => {
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(semesterPlanRoutes);
  
  let authToken: string;
  let testUserId: string;
  let createdPlanId: string;
  
  beforeAll(async () => {
    // Cleanup
    await prisma.semesterPlan.deleteMany({
      where: {
        teacher: {
          username: { in: ['testteacher_sem'] }
        }
      }
    });
    await prisma.user.deleteMany({
      where: { username: { in: ['testteacher_sem'] } }
    });
    
    // Create User
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testteacher_sem',
          email: 'test_sem@example.com',
          password: 'password123',
          role: 'TEACHER',
          department: 'Computer Science'
        })
      })
    );
    
    const registerData = await registerResponse.json();
    authToken = registerData.data.accessToken;
    testUserId = registerData.data.user.id;
  });
  
  afterAll(async () => {
    if (testUserId) {
        await prisma.semesterPlan.deleteMany({
            where: { teacherId: testUserId }
        });
        await prisma.user.delete({
            where: { id: testUserId }
        });
    }
  });

  describe('POST /semester-plans', () => {
    it('should create a new semester plan and auto-generate weekly plans', async () => {
      const response = await app.handle(
        new Request('http://localhost/semester-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            courseName: 'Advanced Web Development',
            semester: '2025-2026-1',
            totalWeeks: 18,
            weeklyHours: 4,
            description: 'Focus on full-stack development'
          })
        })
      );
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.courseName).toBe('Advanced Web Development');
      expect(data.data.semester).toBe('2025-2026-1');
      expect(data.data.totalWeeks).toBe(18);
      expect(data.data.status).toBe('DRAFT');
      
      createdPlanId = data.data.id;

      // Check if weekly plans are generated
      const weeklyPlans = await prisma.weeklyPlan.findMany({
        where: { semesterPlanId: createdPlanId }
      });
      expect(weeklyPlans.length).toBe(18);
      expect(weeklyPlans[0].weekNumber).toBe(1);
      expect(weeklyPlans[17].weekNumber).toBe(18);
    });
  });

  describe('GET /semester-plans', () => {
    it('should get semester plan list', async () => {
      const response = await app.handle(
        new Request('http://localhost/semester-plans', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.items)).toBe(true);
      expect(data.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /semester-plans/:id', () => {
    it('should get single semester plan with weekly plans', async () => {
      const response = await app.handle(
        new Request(`http://localhost/semester-plans/${createdPlanId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdPlanId);
      expect(data.data.weeklyPlans).toBeDefined();
      expect(data.data.weeklyPlans.length).toBe(18);
    });
  });

  describe('PUT /semester-plans/:id', () => {
    it('should update semester plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/semester-plans/${createdPlanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            description: 'Updated description'
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.description).toBe('Updated description');
    });
  });

  describe('DELETE /semester-plans/:id', () => {
    it('should delete semester plan', async () => {
      const response = await app.handle(
        new Request(`http://localhost/semester-plans/${createdPlanId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // Verify deletion
      const check = await prisma.semesterPlan.findUnique({
        where: { id: createdPlanId }
      });
      expect(check).toBeNull();
    });
  });
});
