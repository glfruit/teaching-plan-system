import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

/**
 * JWT 认证中间件
 * 验证请求中的 Authorization header，提取用户信息
 */
export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    })
  )
  .derive({ as: 'scoped' }, async ({ jwt, request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }
    
    const token = authHeader.slice(7);
    
    try {
      const payload = await jwt.verify(token);
      
      if (!payload) {
        return {
          user: null,
          isAuthenticated: false,
        };
      }
      
      return {
        user: {
          userId: payload.userId as string,
          username: payload.username as string,
          email: payload.email as string,
          role: payload.role as string,
        },
        isAuthenticated: true,
      };
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }
  });

/**
 * 需要登录的装饰器
 * 如果用户未认证，返回 401 错误
 */
export const requireAuth = new Elysia()
  .onBeforeHandle(({ user, isAuthenticated, set }) => {
    if (!isAuthenticated || !user) {
      set.status = 401;
      throw new Error('Unauthorized: Please login first');
    }
  });
