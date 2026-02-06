import { Elysia, t } from 'elysia';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

const EXPORT_SERVICE_URL = process.env.EXPORT_SERVICE_URL || 'http://localhost:8000';

/**
 * 导出路由
 * 提供教案导出功能（调用 Python 导出服务）
 */
export const exportRoutes = new Elysia({ prefix: '/export' })
  .use(authMiddleware)
  .use(requireAuth)
  
  /**
   * 导出教案为 Word 文档
   */
  .post(
    '/word/:id',
    async ({ params, user, set }) => {
      // 获取教案详情
      const plan = await prisma.teachingPlan.findUnique({
        where: { id: params.id },
        include: {
          teacher: {
            select: {
              username: true,
              department: true,
            },
          },
        },
      });
      
      if (!plan) {
        set.status = 404;
        throw new Error('Teaching plan not found');
      }
      
      // 检查权限
      if (plan.teacherId !== user!.userId) {
        set.status = 403;
        throw new Error('Forbidden: You can only export your own teaching plans');
      }
      
      // 准备导出数据
      const exportData = {
        title: plan.title,
        courseName: plan.courseName,
        className: plan.className,
        duration: plan.duration,
        objectives: plan.objectives || '',
        keyPoints: plan.keyPoints || '',
        process: plan.process || '',
        blackboard: plan.blackboard || '',
        reflection: plan.reflection || '',
        methods: plan.methods || '',
        resources: plan.resources || '',
        teacherName: plan.teacher?.username || '',
        department: plan.teacher?.department || '',
      };
      
      // 调用 Python 导出服务
      try {
        const response = await fetch(`${EXPORT_SERVICE_URL}/export/word`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exportData),
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Export service error: ${error}`);
        }
        
        // 获取导出的文件内容
        const buffer = await response.arrayBuffer();
        
        // 返回 Word 文件
        set.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        set.headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(plan.title)}.docx"`;
        
        return Buffer.from(buffer);
      } catch (error: any) {
        console.error('Export error:', error);
        set.status = 500;
        throw new Error('Failed to export teaching plan: ' + error.message);
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  /**
   * 检查导出服务状态
   */
  .get(
    '/health',
    async ({ set }) => {
      try {
        const response = await fetch(`${EXPORT_SERVICE_URL}/health`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: {
              exportService: 'connected',
              serviceInfo: data,
            },
          };
        } else {
          throw new Error('Export service not responding');
        }
      } catch (error: any) {
        set.status = 503;
        return {
          success: false,
          message: 'Export service unavailable',
          error: error.message,
        };
      }
    }
  );
