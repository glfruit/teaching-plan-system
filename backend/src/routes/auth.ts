import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    })
  )
  .post(
    '/register',
    async ({ body, jwt }) => {
      const { username, email, password, role, department } = body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error('Username already exists');
        }
        if (existingUser.email === email) {
          throw new Error('Email already exists');
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: role || 'TEACHER',
          department,
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          department: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const accessToken = await jwt.sign({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        data: {
          user,
          accessToken,
        },
      };
    },
    {
      body: t.Object({
        username: t.String({
          minLength: 3,
          maxLength: 50,
        }),
        email: t.String({
          format: 'email',
        }),
        password: t.String({
          minLength: 6,
        }),
        role: t.Optional(t.Union([t.Literal('ADMIN'), t.Literal('TEACHER')])),
        department: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, jwt }) => {
      const { username, password } = body;

      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Generate JWT token
      const accessToken = await jwt.sign({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            department: user.department,
            createdAt: user.createdAt,
          },
          accessToken,
        },
      };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  );
