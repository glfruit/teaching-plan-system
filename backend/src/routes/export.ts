import { Elysia, t } from 'elysia';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireAuth } from '../middleware/auth';

const EXPORT_SERVICE_URL = process.env.EXPORT_SERVICE_URL || 'http://localhost:8000';
const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
type ExportSourceType = 'teaching-plan' | 'teaching-plan-lesson' | 'teaching-plan-book';
const ExportSourceTypeSchema = t.Union([
  t.Literal('teaching-plan'),
  t.Literal('teaching-plan-lesson'),
  t.Literal('teaching-plan-book'),
]);

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

const buildPreviewPayload = (plan: {
  id: string;
  title: string;
  courseName: string;
  className: string;
  duration: number;
  status: string;
  teacher: { username: string; department: string | null } | null;
  updatedAt: Date;
  objectives: string;
  keyPoints: string;
  process: string;
  blackboard: string | null;
  reflection: string | null;
  methods: string | null;
  resources: string | null;
}) => {
  const sections = buildSectionRows(plan).map(section => ({
    ...section,
    length: section.content.length,
    isEmpty: section.content.length === 0,
    preview: section.content.slice(0, 120),
  }));
  const completedSections = sections.filter(section => !section.isEmpty).length;

  return {
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
      completedSections,
      totalSections: sections.length,
      completionRate: sections.length === 0 ? 0 : Math.round((completedSections / sections.length) * 100),
      missingSections: sections.filter(section => section.isEmpty).map(section => section.label),
    },
    availableFormats: ['word', 'excel', 'pdf'],
  };
};

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

const getLessonWithPermission = async (lessonId: string, userId: string, set: { status?: number | string }) => {
  const lesson = await prisma.teachingPlanLesson.findUnique({
    where: { id: lessonId },
    include: {
      book: {
        include: {
          teacher: {
            select: {
              id: true,
              username: true,
              department: true,
            },
          },
          courseOffering: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    set.status = 404;
    throw new Error('Teaching plan lesson not found');
  }

  if (lesson.book.teacherId !== userId) {
    set.status = 403;
    throw new Error('Forbidden: You can only export your own teaching plan lessons');
  }

  return lesson;
};

const getBookWithPermission = async (bookId: string, userId: string, set: { status?: number | string }) => {
  const book = await prisma.teachingPlanBook.findUnique({
    where: { id: bookId },
    include: {
      teacher: {
        select: {
          id: true,
          username: true,
          department: true,
        },
      },
      courseOffering: {
        include: {
          course: true,
        },
      },
      lessons: {
        orderBy: { lessonNo: 'asc' },
      },
    },
  });

  if (!book) {
    set.status = 404;
    throw new Error('Teaching plan book not found');
  }

  if (book.teacherId !== userId) {
    set.status = 403;
    throw new Error('Forbidden: You can only export your own teaching plan books');
  }

  return book;
};

const resolveSourceType = (value: unknown): ExportSourceType =>
  value === 'teaching-plan-lesson'
    ? 'teaching-plan-lesson'
    : value === 'teaching-plan-book'
      ? 'teaching-plan-book'
      : 'teaching-plan';

const getExportSourceWithPermission = async (
  sourceId: string,
  sourceType: ExportSourceType,
  userId: string,
  set: { status?: number | string }
) => {
  if (sourceType === 'teaching-plan-lesson') {
    const lesson = await getLessonWithPermission(sourceId, userId, set);
    return {
      id: lesson.id,
      title: lesson.title,
      courseName: lesson.book.courseOffering.course.name,
      className: lesson.className || lesson.book.targetClass || lesson.book.courseOffering.className || '',
      duration: lesson.duration,
      status: lesson.status,
      objectives: lesson.objectives,
      keyPoints: lesson.keyPoints || '',
      process: lesson.outline,
      blackboard: '',
      reflection: lesson.reflection || '',
      methods: lesson.methods || '',
      resources: lesson.teachingAids || '',
      teacher: lesson.book.teacher
        ? {
            username: lesson.book.teacher.username,
            department: lesson.book.teacher.department,
          }
        : null,
      updatedAt: lesson.updatedAt,
    };
  }

  if (sourceType === 'teaching-plan-book') {
    const book = await getBookWithPermission(sourceId, userId, set);
    const totalLessonDuration = book.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
    const methods = Array.from(new Set(book.lessons.map((lesson) => lesson.methods?.trim()).filter(Boolean))).join('；');
    const resources = Array.from(new Set(book.lessons.map((lesson) => lesson.teachingAids?.trim()).filter(Boolean))).join('；');
    const lessonOutlines = book.lessons
      .map((lesson) => `No.${lesson.lessonNo} ${lesson.title}\n${normalizeText(lesson.outline)}`)
      .join('\n\n');
    const firstLesson = book.lessons[0];

    return {
      id: book.id,
      title: book.title,
      courseName: book.courseOffering.course.name,
      className: book.targetClass || book.courseOffering.className,
      duration: book.totalHours || totalLessonDuration || firstLesson?.duration || 45,
      status: book.status,
      objectives: firstLesson?.objectives || '',
      keyPoints: firstLesson?.keyPoints || '',
      process: lessonOutlines || '',
      blackboard: '',
      reflection: firstLesson?.reflection || '',
      methods,
      resources,
      teacher: book.teacher
        ? {
            username: book.teacher.username,
            department: book.teacher.department,
          }
        : null,
      updatedAt: book.updatedAt,
    };
  }

  return getPlanWithPermission(sourceId, userId, set);
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
    async ({ params, query, user, set }) => {
      const plan = await getExportSourceWithPermission(
        params.id,
        resolveSourceType(query?.sourceType),
        user!.userId,
        set
      );
      const payload = buildPreviewPayload(plan);

      return {
        success: true,
        data: payload,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        sourceType: t.Optional(ExportSourceTypeSchema),
      }),
    }
  )
  
  /**
   * 导出教案为 Word 文档
   */
  .post(
    '/word/:id',
    async ({ params, query, user, set }) => {
      const plan = await getExportSourceWithPermission(
        params.id,
        resolveSourceType(query?.sourceType),
        user!.userId,
        set
      );
      
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
      query: t.Object({
        sourceType: t.Optional(ExportSourceTypeSchema),
      }),
    }
  )

  /**
   * 导出教案为 Excel
   */
  .post(
    '/excel/:id',
    async ({ params, query, user, set }) => {
      const plan = await getExportSourceWithPermission(
        params.id,
        resolveSourceType(query?.sourceType),
        user!.userId,
        set
      );
      const payload = buildPreviewPayload(plan);
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'teaching-plan-system';
      workbook.created = new Date();
      const summarySheet = workbook.addWorksheet('Plan Summary');
      summarySheet.columns = [
        { header: 'Section', key: 'section', width: 28 },
        { header: 'Content', key: 'content', width: 78 },
        { header: 'Chars', key: 'chars', width: 12 },
      ];

      summarySheet.mergeCells('A1:C1');
      const titleCell = summarySheet.getCell('A1');
      titleCell.value = 'Teaching Plan Export Report';
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(1).height = 28;

      summarySheet.addRow(['Metadata', 'Value', '']);
      const metadataHeaderRow = summarySheet.getRow(2);
      metadataHeaderRow.font = { bold: true };
      metadataHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8EEF5' },
      };

      [
        ['Title', payload.plan.title],
        ['Course Name', payload.plan.courseName],
        ['Class Name', payload.plan.className],
        ['Duration (min)', String(payload.plan.duration)],
        ['Status', payload.plan.status],
        ['Teacher', payload.plan.teacherName || ''],
        ['Updated At', new Date(payload.plan.updatedAt).toISOString()],
      ].forEach(([label, value]) => {
        summarySheet.addRow([label, value, '']);
      });

      summarySheet.addRow([]);
      const sectionHeader = summarySheet.addRow(['Section', 'Content Preview', 'Chars']);
      sectionHeader.font = { bold: true };
      sectionHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDCE5ED' },
      };

      payload.sections.forEach((section) => {
        summarySheet.addRow({
          section: section.label,
          content: section.content || '(empty)',
          chars: section.length,
        });
      });

      summarySheet.eachRow((row, rowNumber) => {
        row.alignment = { vertical: 'top', wrapText: true };
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD7DDE4' } },
            left: { style: 'thin', color: { argb: 'FFD7DDE4' } },
            bottom: { style: 'thin', color: { argb: 'FFD7DDE4' } },
            right: { style: 'thin', color: { argb: 'FFD7DDE4' } },
          };
        });
        if (rowNumber >= 3) {
          row.height = 22;
        }
      });

      const readinessSheet = workbook.addWorksheet('Readiness');
      readinessSheet.columns = [
        { header: 'Metric', key: 'metric', width: 28 },
        { header: 'Value', key: 'value', width: 80 },
      ];
      readinessSheet.getRow(1).font = { bold: true };
      readinessSheet.addRow({ metric: 'Completion Rate', value: `${payload.readiness.completionRate}%` });
      readinessSheet.addRow({ metric: 'Completed Sections', value: `${payload.readiness.completedSections}/${payload.readiness.totalSections}` });
      readinessSheet.addRow({
        metric: 'Missing Sections',
        value: payload.readiness.missingSections.length > 0 ? payload.readiness.missingSections.join(', ') : 'None',
      });
      readinessSheet.eachRow((row) => {
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
      query: t.Object({
        sourceType: t.Optional(ExportSourceTypeSchema),
      }),
    }
  )

  /**
   * 导出教案为 PDF
   */
  .post(
    '/pdf/:id',
    async ({ params, query, user, set }) => {
      const plan = await getExportSourceWithPermission(
        params.id,
        resolveSourceType(query?.sourceType),
        user!.userId,
        set
      );
      const payload = buildPreviewPayload(plan);
      const chunks: Buffer[] = [];

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).text('Teaching Plan Export Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Generated At: ${new Date().toISOString()}`, { align: 'right' });
        doc.moveDown();

        const metadataRows: Array<[string, string]> = [
          ['Title', payload.plan.title],
          ['Course', payload.plan.courseName],
          ['Class', payload.plan.className],
          ['Duration', `${payload.plan.duration} min`],
          ['Teacher', payload.plan.teacherName || ''],
          ['Status', payload.plan.status],
        ];

        metadataRows.forEach(([label, value]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`${label}: `, { continued: true });
          doc.font('Helvetica').text(value || '-');
        });

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(13).text('Readiness Summary');
        doc.font('Helvetica').fontSize(10).text(`Completion: ${payload.readiness.completionRate}%`);
        doc.text(`Completed Sections: ${payload.readiness.completedSections}/${payload.readiness.totalSections}`);
        doc.text(
          `Missing Sections: ${
            payload.readiness.missingSections.length > 0
              ? payload.readiness.missingSections.join(', ')
              : 'None'
          }`
        );
        doc.moveDown();

        doc.font('Helvetica-Bold').fontSize(13).text('Content Sections');
        doc.moveDown(0.4);

        payload.sections.forEach((section, index) => {
          if (doc.y > 730) {
            doc.addPage();
          }
          doc.font('Helvetica-Bold').fontSize(11).text(`${index + 1}. ${section.label}`);
          doc.font('Helvetica').fontSize(10).text(section.content || '(empty)');
          doc.fillColor('#6B7280').text(`Characters: ${section.length}`);
          doc.fillColor('#111827');
          doc.moveDown(0.7);
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
      query: t.Object({
        sourceType: t.Optional(ExportSourceTypeSchema),
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
