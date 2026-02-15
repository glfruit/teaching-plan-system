import { describe, it, expect, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { authRoutes } from './auth';
import { prisma } from '../lib/prisma';
import { describeWithDatabase } from '../test-utils/withDatabase';

/**
 * 认证 API 测试套件
 * 测试注册、登录、JWT 验证等功能
 */
describeWithDatabase('Auth API', () => {
  const app = new Elysia().use(authRoutes);
  
  // 测试前清理测试数据
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        username: {
          in: ['testuser', 'testlogin', 'duplicateuser']
        }
      }
    });
  });

  /**
   * 测试用户注册
   */
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'TEACHER',
            department: '计算机系'
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.username).toBe('testuser');
      expect(data.data.user.email).toBe('test@example.com');
      expect(data.data.user.role).toBe('TEACHER');
      expect(data.data.user.department).toBe('计算机系');
      expect(data.data.accessToken).toBeDefined();
      // 密码不应返回
      expect(data.data.user.password).toBeUndefined();
    });

    it('should reject duplicate username', async () => {
      // 先创建一个用户
      await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'duplicateuser',
            email: 'dup1@example.com',
            password: 'password123'
          })
        })
      );
      
      // 尝试使用相同用户名注册
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'duplicateuser',
            email: 'dup2@example.com',
            password: 'password123'
          })
        })
      );
      
      // 错误状态码可能是 500 或 400
      expect(response.status).toBeGreaterThanOrEqual(400);
      const text = await response.text();
      expect(text).toContain('Username already exists');
    });

    it('should reject duplicate email', async () => {
      // 尝试使用相同邮箱注册
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'differentuser',
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );
      
      expect(response.status).toBeGreaterThanOrEqual(400);
      const text = await response.text();
      expect(text).toContain('Email already exists');
    });

    it('should validate email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'emailtest',
            email: 'invalid-email',
            password: 'password123'
          })
        })
      );
      
      expect(response.status).toBe(422);
    });

    it('should enforce password minimum length', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'shortpass',
            email: 'short@example.com',
            password: '123'
          })
        })
      );
      
      expect(response.status).toBe(422);
    });

    it('should enforce username minimum length', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'ab',
            email: 'shortname@example.com',
            password: 'password123'
          })
        })
      );
      
      expect(response.status).toBe(422);
    });
  });

  /**
   * 测试用户登录
   */
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // 先创建用户
      await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testlogin',
            email: 'login@example.com',
            password: 'mypassword'
          })
        })
      );
      
      // 登录
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testlogin',
            password: 'mypassword'
          })
        })
      );
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.username).toBe('testlogin');
      expect(data.data.accessToken).toBeDefined();
    });

    it('should reject invalid username', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'nonexistentuser',
            password: 'password123'
          })
        })
      );
      
      expect(response.status).toBeGreaterThanOrEqual(400);
      const text = await response.text();
      expect(text).toContain('Invalid username or password');
    });

    it('should reject invalid password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testlogin',
            password: 'wrongpassword'
          })
        })
      );
      
      expect(response.status).toBeGreaterThanOrEqual(400);
      const text = await response.text();
      expect(text).toContain('Invalid username or password');
    });
  });
});
