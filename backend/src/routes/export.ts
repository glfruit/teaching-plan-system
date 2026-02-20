import { Elysia, t } from 'elysia';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

const EXPORT_SERVICE_URL = process.env.EXPORT_SERVICE_URL || 'http://localhost:8000';
const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const normalizeText = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildSectionRows = (plan: {
  objectives: string;
  keyPoints: string;
  process: string;
  blackboard: string | null;
  reflection: string | null;
  methods: string | null;
  resources: string | null;
}) => [
  { key: 'objectives', label: 'Teaching Objectives', content: normalizeText(plan.objectives) },
  { key: 'keyPoints', label: 'Key Points', content: normalizeText(plan.keyPoints) },
  { key: 'process', label: 'Teaching Process', content: normalizeText(plan.process) },
  { key: 'blackboard', label: 'Blackboard Design', content: normalizeText(plan.blackboard) },
  { key: 'reflection', label: 'Teaching Reflection', content: normalizeText(plan.reflection) },
  { key: 'methods', label: 'Teaching Methods', content: normalizeText(plan.methods) },
  { key: 'resources', label: 'Teaching Resources', content: normalizeText(plan.resources) },
];

const getPlanWithPermission = async (planId: string, userId: string, set: { status?: number | string }) => {
  const plan = await prisma.teachingPlan.findUnique({
    where: { id: planId },
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

  if (plan.teacherId !== userId) {
    set.status = 403;
    throw new Error('Forbidden: You can only export your own teaching plans');
  }

  return plan;
};

const toDownloadName = (title: string, ext: string): string => `${encodeURIComponent(title)}.${ext}`;

/**
 * 导出路由
 * 提供教案导出功能（调用 Python 导出服务）
 */
export const exportRoutes = new Elysia({ prefix: '/export' })
  .use(authMiddleware)
  .use(requireAuth)

  /**
   * 导出前预览
   */
  .post(
    '/preview/:id',
    async ({ params, user, set }) => {
      const plan = await getPlanWithPermission(params.id, user!.userId, set);
      const sections = buildSectionRows(plan).map(section => ({
        ...section,
        length: section.content.length,
        isEmpty: section.content.length === 0,
        preview: section.content.slice(0, 120),
      }));
      const completedCount = sections.filter(section => !section.isEmpty).length;

      return {
        success: true,
        data: {
          plan: {
            id: plan.id,
            title: plan.title,
            courseName: plan.courseName,
            className: plan.className,
            duration: plan.duration,
            status: plan.status,
            teacherName: plan.teacher?.username || '',
            updatedAt: plan.updatedAt,
          },
          sections,
          readiness: {
            completedSections: completedCount,
            totalSections: sections.length,
            completionRate: sections.length === 0 ? 0 : Math.round((completedCount / sections.length) * 100),
            missingSections: sections.filter(section => section.isEmpty).map(section => section.label),
          },
          availableFormats: ['word', 'excel', 'pdf'],
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  
  /**
   * 导出教案为 Word 文档
   */
  .post(
    '/word/:id',
    async ({ params, user, set }) => {
      const plan = await getPlanWithPermission(params.id, user!.userId, set);
      
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
        set.headers['Content-Type'] = DOCX_CONTENT_TYPE;
        set.headers['Content-Disposition'] = `attachment; filename="${toDownloadName(plan.title, 'docx')}"`;
        
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
   * 导出教案为 Excel
   */
  .post(
    '/excel/:id',
    async ({ params, user, set }) => {
      const plan = await getPlanWithPermission(params.id, user!.userId, set);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Teaching Plan');

      sheet.columns = [
        { header: 'Field', key: 'field', width: 26 },
        { header: 'Value', key: 'value', width: 90 },
      ];
      sheet.getRow(1).font = { bold: true };

      sheet.addRow({ field: 'Title', value: plan.title });
      sheet.addRow({ field: 'Course Name', value: plan.courseName });
      sheet.addRow({ field: 'Class Name', value: plan.className });
      sheet.addRow({ field: 'Duration (min)', value: plan.duration });
      sheet.addRow({ field: 'Status', value: plan.status });
      sheet.addRow({ field: 'Teacher', value: plan.teacher?.username || '' });
      sheet.addRow({ field: 'Department', value: plan.teacher?.department || '' });
      sheet.addRow({ field: 'Last Updated', value: plan.updatedAt.toISOString() });
      sheet.addRow({ field: '', value: '' });

      buildSectionRows(plan).forEach(section => {
        sheet.addRow({
          field: section.label,
          value: section.content || '(empty)',
        });
      });

      sheet.eachRow((row) => {
        row.alignment = { vertical: 'top', wrapText: true };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const output = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

      set.headers['Content-Type'] = XLSX_CONTENT_TYPE;
      set.headers['Content-Disposition'] = `attachment; filename="${toDownloadName(plan.title, 'xlsx')}"`;
      return output;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  /**
   * 导出教案为 PDF
   */
  .post(
    '/pdf/:id',
    async ({ params, user, set }) => {
      const plan = await getPlanWithPermission(params.id, user!.userId, set);
      const sections = buildSectionRows(plan);
      const chunks: Buffer[] = [];

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(18).text('Teaching Plan', { align: 'center' });
        doc.moveDown();
        doc.fontSize(13).text(`Title: ${plan.title}`);
        doc.text(`Course: ${plan.courseName}`);
        doc.text(`Class: ${plan.className}`);
        doc.text(`Duration: ${plan.duration} min`);
        doc.text(`Teacher: ${plan.teacher?.username || ''}`);
        doc.moveDown();

        sections.forEach(section => {
          doc.fontSize(12).text(section.label, { underline: true });
          doc.fontSize(10).text(section.content || '(empty)');
          doc.moveDown(0.8);
        });

        doc.end();
      });

      set.headers['Content-Type'] = 'application/pdf';
      set.headers['Content-Disposition'] = `attachment; filename="${toDownloadName(plan.title, 'pdf')}"`;
      return buffer;
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
