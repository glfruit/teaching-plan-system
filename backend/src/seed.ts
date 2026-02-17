import { prisma } from './lib/prisma'
import { hashPassword } from './lib/auth'
import type { UserRole } from '@prisma/client'

interface SeedUser {
  username: string
  email: string
  password: string
  role: UserRole
  department?: string
}

const SEED_USERS: SeedUser[] = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
    department: '信息中心'
  },
  {
    username: 'teacher1',
    email: 'teacher1@example.com',
    password: 'teacher123',
    role: 'TEACHER',
    department: '计算机系'
  },
  {
    username: 'testteacher',
    email: 'testteacher@example.com',
    password: '123456',
    role: 'TEACHER',
    department: '教学研发组'
  }
]

const seed = async (): Promise<void> => {
  for (const user of SEED_USERS) {
    const hashedPassword = await hashPassword(user.password)
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
        department: user.department
      },
      create: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        department: user.department
      }
    })
  }
}

seed()
  .then(async () => {
    console.log('Seed completed')
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
