import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

/**
 * 统计分析路由
 */
export const analyticsRoutes = new Elysia({ prefix: '/analytics' })
  .use(authMiddleware)
  .use(requireAuth)
  
  /**
   * 教学工作量统计
   */
  .get('/workload', async ({ user }) => {
    const cacheKey = `workload:${user!.userId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const result = await prisma.teachingPlan.aggregate({
      _sum: {
        duration: true
      },
      _count: {
        id: true
      },
      where: { teacherId: user!.userId }
    });
    
    const data = {
      success: true,
      data: {
        totalPlans: result._count.id,
        totalDuration: result._sum.duration || 0
      }
    };
    cache.set(cacheKey, data);
    return data;
  })

  /**
   * 计划执行分析
   */
  .get('/execution', async ({ user }) => {
    const cacheKey = `execution:${user!.userId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const plans = await prisma.teachingPlan.groupBy({
      by: ['status'],
      where: { teacherId: user!.userId },
      _count: { status: true }
    });

    const statusDistribution: Record<string, number> = {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0
    };

    plans.forEach(p => {
      statusDistribution[p.status] = p._count.status;
    });

    const data = {
      success: true,
      data: {
        statusDistribution
      }
    };
    cache.set(cacheKey, data);
    return data;
  })

  /**
   * 教案质量分析
   */
  .get('/quality', async ({ user }) => {
    const cacheKey = `quality:${user!.userId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const plans = await prisma.teachingPlan.findMany({
      where: { teacherId: user!.userId },
      select: {
        objectives: true,
        keyPoints: true,
        process: true,
        reflection: true,
        methods: true,
        resources: true,
        blackboard: true
      }
    });

    if (plans.length === 0) {
      return {
        success: true,
        data: { averageCompleteness: 0 }
      };
    }

    let totalScore = 0;

    for (const plan of plans) {
      let score = 0;
      // 必填字段检查
      if (plan.objectives && plan.objectives.length > 10) score += 20;
      if (plan.keyPoints && plan.keyPoints.length > 5) score += 20;
      if (plan.process && plan.process.length > 20) score += 20;

      // 选填字段检查
      if (plan.reflection && plan.reflection.length > 0) score += 10;
      if (plan.methods && plan.methods.length > 0) score += 10;
      if (plan.resources && plan.resources.length > 0) score += 10;
      if (plan.blackboard && plan.blackboard.length > 0) score += 10;
      
      totalScore += Math.min(score, 100);
    }

    const data = {
      success: true,
      data: {
        averageCompleteness: Math.round(totalScore / plans.length)
      }
    };
    cache.set(cacheKey, data);
    return data;
  })

  /**
   * 趋势分析 (Plan creation trend over last 6 months)
   */
  .get('/trend', async ({ user }) => {
    const cacheKey = `trend:${user!.userId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1); // Set to 1st to avoid month overflow
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const plans = await prisma.teachingPlan.findMany({
      where: {
        teacherId: user!.userId,
        createdAt: { gte: sixMonthsAgo }
      },
      select: { createdAt: true }
    });

    const monthlyStats: Record<string, number> = {};
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const d = new Date(today);
        d.setDate(1); // Avoid end-of-month issues
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyStats[key] = 0;
    }

    plans.forEach(plan => {
      const d = new Date(plan.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyStats[key] !== undefined) {
        monthlyStats[key]++;
      }
    });

    const monthlyTrend = Object.entries(monthlyStats)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const data = {
      success: true,
      data: {
        monthlyTrend
      }
    };
    cache.set(cacheKey, data);
    return data;
  })

  /**
   * 导出统计数据
   */
  .get('/export', async ({ user, query, set }) => {
    // 1. 获取工作量数据
    const workload = await prisma.teachingPlan.aggregate({
      _sum: { duration: true },
      _count: { id: true },
      where: { teacherId: user!.userId }
    });
    
    // 2. 获取执行状态数据
    const execution = await prisma.teachingPlan.groupBy({
      by: ['status'],
      where: { teacherId: user!.userId },
      _count: { status: true }
    });
    
    // 3. 简单的质量概览 (仅计算平均分)
    const plans = await prisma.teachingPlan.findMany({
      where: { teacherId: user!.userId },
      select: {
        objectives: true,
        keyPoints: true,
        process: true
      }
    });
    
    let totalScore = 0;
    if (plans.length > 0) {
      for (const plan of plans) {
        let score = 0;
        if (plan.objectives?.length > 10) score += 33;
        if (plan.keyPoints?.length > 5) score += 33;
        if (plan.process?.length > 20) score += 34;
        totalScore += Math.min(score, 100);
      }
    }
    const qualityScore = plans.length > 0 ? Math.round(totalScore / plans.length) : 0;
    
    // 构造完整数据对象
    const analyticsData = {
      workload: {
        totalPlans: workload._count.id,
        totalDuration: workload._sum.duration || 0
      },
      execution: execution.map(e => ({ status: e.status, count: e._count.status })),
      quality: {
        averageScore: qualityScore
      },
      trend: {
        // 简化起见，导出时不重新计算复杂的月度趋势，或者仅导出最近一个月的
        timestamp: new Date().toISOString()
      }
    };

    if (query.format === 'csv') {
      let csv = 'Metric,Value\n';
      csv += `Total Plans,${analyticsData.workload.totalPlans}\n`;
      csv += `Total Duration (min),${analyticsData.workload.totalDuration}\n`;
      csv += `Average Quality Score,${analyticsData.quality.averageScore}\n`;
      
      analyticsData.execution.forEach(e => {
        csv += `Status: ${e.status},${e.count}\n`;
      });
      
      set.headers['Content-Type'] = 'text/csv';
      set.headers['Content-Disposition'] = 'attachment; filename="analytics.csv"';
      return csv;
    }
    
    // Default JSON
    set.headers['Content-Type'] = 'application/json';
    return analyticsData;
  }, {
    query: t.Object({
      format: t.Optional(t.String())
    })
  });
