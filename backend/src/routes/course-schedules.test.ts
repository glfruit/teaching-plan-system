import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { courseScheduleRoutes } from './course-schedules';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

describe('Course Schedule API', () => {
  const app = new Elysia()
    .use(authMiddleware)
    .use(authRoutes)
    .use(courseScheduleRoutes);
  
  let authToken: string;
  let testUserId: string;
  let scheduleId: string;
  
  beforeAll(async () => {
    // Cleanup
    await prisma.courseSchedule.deleteMany({
      where: {
        teacher: {
          username: { in: ['testteacher_sch'] }
        }
      }
    });
    await prisma.user.deleteMany({
      where: { username: { in: ['testteacher_sch'] } }
    });
    
    // Create User
    const registerResponse = await app.handle(
      new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testteacher_sch',
          email: 'test_sch@example.com',
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
        await prisma.courseSchedule.deleteMany({
            where: { teacherId: testUserId }
        });
        await prisma.user.delete({
            where: { id: testUserId }
        });
    }
  });

  describe('POST /course-schedules', () => {
    it('should create a new course schedule', async () => {
      const response = await app.handle(
        new Request('http://localhost/course-schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            courseName: 'Data Structures',
            className: 'CS2024',
            dayOfWeek: 1, // Monday
            period: 1, // 1st period
            classroom: 'Room 101',
            semester: '2025-2026-1'
          })
        })
      );
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.courseName).toBe('Data Structures');
      
      scheduleId = data.data.id;
    });

    it('should detect conflict', async () => {
      const response = await app.handle(
        new Request('http://localhost/course-schedules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            courseName: 'Algorithms',
            className: 'CS2025',
            dayOfWeek: 1, // Monday
            period: 1, // 1st period (Conflict!)
            classroom: 'Room 102',
            semester: '2025-2026-1'
          })
        })
      );
      
      expect(response.status).toBe(409); // Conflict
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Conflict');
    });
  });

  describe('GET /course-schedules', () => {
    it('should list schedules', async () => {
        const response = await app.handle(
            new Request('http://localhost/course-schedules?semester=2025-2026-1', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        );
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DELETE /course-schedules/:id', () => {
      it('should delete schedule', async () => {
          const response = await app.handle(
              new Request(`http://localhost/course-schedules/${scheduleId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${authToken}` }
              })
          );
          expect(response.status).toBe(200);
      });
  });
});
