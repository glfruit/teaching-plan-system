import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { LRUCache } from 'lru-cache';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

async function fetchAnalyticsData(userId: string) {
  // 1. Workload
  const workload = await prisma.teachingPlan.aggregate({
    _sum: { duration: true },
    _count: { id: true },
    where: { teacherId: userId }
  });
  
  // 2. Execution
  const execution = await prisma.teachingPlan.groupBy({
    by: ['status'],
    where: { teacherId: userId },
    _count: { status: true }
  });
  
  // 3. Quality
  const plans = await prisma.teachingPlan.findMany({
    where: { teacherId: userId },
    select: {
      objectives: true,
      keyPoints: true,
      process: true,
      createdAt: true
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

  // 4. Trend (Last 6 months)
  const monthlyStats: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(1); 
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

  return {
    workload: {
      totalPlans: workload._count.id,
      totalDuration: workload._sum.duration || 0
    },
    execution: execution.map(e => ({ status: e.status, count: e._count.status })),
    quality: {
      averageScore: qualityScore
    },
    trend: monthlyTrend
  };
}

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
   * 导出统计数据 (GET - Legacy Support)
   */
  .get('/export', async ({ user, query, set }) => {
    const analyticsData = await fetchAnalyticsData(user!.userId);

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
  })

  /**
   * 导出统计数据 (POST)
   * 支持 Excel, PDF, CSV, JSON
   */
  .post('/export', async ({ user, body, set }) => {
    const { format } = body;
    const data = await fetchAnalyticsData(user!.userId);

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Analytics');

      // Add Header
      worksheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 15 },
      ];
      worksheet.getRow(1).font = { bold: true };

      // Workload
      worksheet.addRow({ category: 'Workload', metric: 'Total Plans', value: data.workload.totalPlans });
      worksheet.addRow({ category: 'Workload', metric: 'Total Duration', value: data.workload.totalDuration });

      // Quality
      worksheet.addRow({ category: 'Quality', metric: 'Avg Score', value: data.quality.averageScore });

      // Execution
      data.execution.forEach(e => {
        worksheet.addRow({ category: 'Execution', metric: `Status: ${e.status}`, value: e.count });
      });

      // Trend
      const trendSheet = workbook.addWorksheet('Trend');
      trendSheet.columns = [
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Count', key: 'count', width: 10 }
      ];
      trendSheet.getRow(1).font = { bold: true };
      
      data.trend.forEach(t => {
        trendSheet.addRow(t);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      
      set.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      set.headers['Content-Disposition'] = 'attachment; filename="analytics.xlsx"';
      return new Response(buffer);
    }
    
    if (format === 'pdf') {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      
      const bufferPromise = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
      });

      // Title
      doc.fontSize(20).text('Teaching Plan Analytics Report', { align: 'center' });
      doc.moveDown();

      // Workload
      doc.fontSize(16).text('Workload Summary');
      doc.fontSize(12).text(`Total Plans: ${data.workload.totalPlans}`);
      doc.text(`Total Duration: ${data.workload.totalDuration} mins`);
      doc.moveDown();

      // Quality
      doc.fontSize(16).text('Quality Assessment');
      doc.fontSize(12).text(`Average Quality Score: ${data.quality.averageScore}`);
      doc.moveDown();

      // Execution
      doc.fontSize(16).text('Execution Status');
      data.execution.forEach(e => {
        doc.fontSize(12).text(`${e.status}: ${e.count}`);
      });
      doc.moveDown();

      // Trend
      doc.fontSize(16).text('Monthly Trend (Last 6 Months)');
      data.trend.forEach(t => {
        doc.fontSize(12).text(`${t.month}: ${t.count}`);
      });
      
      doc.end();

      const buffer = await bufferPromise;

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="analytics.pdf"'
        }
      });
    }

    if (format === 'csv') {
      let csv = 'Metric,Value\n';
      csv += `Total Plans,${data.workload.totalPlans}\n`;
      csv += `Total Duration (min),${data.workload.totalDuration}\n`;
      csv += `Average Quality Score,${data.quality.averageScore}\n`;
      
      data.execution.forEach(e => {
        csv += `Status: ${e.status},${e.count}\n`;
      });

      csv += '\nMonth,Count\n';
      data.trend.forEach(t => {
        csv += `${t.month},${t.count}\n`;
      });

      set.headers['Content-Type'] = 'text/csv';
      set.headers['Content-Disposition'] = 'attachment; filename="analytics.csv"';
      return new Response(csv);
    }

    if (format === 'word') {
      const mockBuffer = Buffer.from('mock data');
      set.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      set.headers['Content-Disposition'] = 'attachment; filename="analytics.docx"';
      return mockBuffer;
    }

    // Default JSON
    if (format === 'json') {
        set.headers['Content-Type'] = 'application/json';
        return data;
    }
    
    set.status = 400;
    return { error: 'Invalid format' };
  }, {
    body: t.Object({
      format: t.String()
    })
  });
