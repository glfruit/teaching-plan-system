import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './routes/auth'
import { teachingPlanRoutes } from './routes/teaching-plans'
import { exportRoutes } from './routes/export'
import { analyticsRoutes } from './routes/analytics'
import { planTemplateRoutes } from './routes/plan-templates'
import { resolvePort } from './lib/server-config'

const PORT = resolvePort(process.env.PORT)

const app = new Elysia()
  .use(cors({
    origin: '*', // 允许所有来源（开发环境）
    credentials: true
  }))
  .use(authRoutes)
  .use(teachingPlanRoutes)
  .use(planTemplateRoutes)
  .use(exportRoutes)
  .use(analyticsRoutes)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }))
  .listen({
    hostname: '0.0.0.0',
    port: PORT
  })

console.log(`🦊 Elysia is running at:`)
console.log(`  - Local:   http://localhost:${PORT}`)
console.log(`  - Network: http://${process.env.HOSTNAME || '192.168.x.x'}:${PORT}`)
