import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './routes/auth'
import { teachingPlanRoutes } from './routes/teaching-plans'

const app = new Elysia()
  .use(cors())
  .use(authRoutes)
  .use(teachingPlanRoutes)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }))
  .listen(3000)

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`)
