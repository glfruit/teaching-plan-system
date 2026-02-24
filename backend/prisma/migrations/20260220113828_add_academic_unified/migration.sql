-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('PLANNING', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CourseOfferingStatus" AS ENUM ('PLANNING', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "AcademicDocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TemplateScope" AS ENUM ('ORG', 'PERSONAL');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "TemplateDocType" AS ENUM ('COURSE_STANDARD', 'DELIVERY_PLAN', 'TEACHING_PLAN_BOOK', 'TEACHING_PLAN_LESSON');

-- CreateEnum
CREATE TYPE "TraceLinkType" AS ENUM ('STANDARD_TO_DELIVERY', 'DELIVERY_TO_LESSON', 'LESSON_TO_COURSEWARE');

-- CreateEnum
CREATE TYPE "LegacyMappingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- AlterTable
ALTER TABLE "teaching_plans" ADD COLUMN     "courseOfferingId" TEXT,
ADD COLUMN     "courseStandardRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deliveryPlanId" TEXT,
ADD COLUMN     "deliveryWeekNo" INTEGER,
ADD COLUMN     "ideologicalElements" TEXT,
ADD COLUMN     "integrationMethod" TEXT,
ADD COLUMN     "planBookId" TEXT;

-- CreateTable
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SemesterStatus" NOT NULL DEFAULT 'PLANNING',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "credits" DOUBLE PRECISION,
    "hours" INTEGER,
    "ownerTeacherId" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_offerings" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "weeklyHours" INTEGER,
    "totalWeeks" INTEGER,
    "status" "CourseOfferingStatus" NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_standards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semesterId" TEXT,
    "templateVersionId" TEXT,
    "contentJson" JSONB,
    "htmlContent" TEXT NOT NULL,
    "status" "AcademicDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedSnapshotJson" JSONB,
    "ownerId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_standard_modules" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_standard_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_standard_topics" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "topicCode" TEXT,
    "title" TEXT NOT NULL,
    "recommendedHours" INTEGER,
    "ideologicalElements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "integrationMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "objectiveMapping" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableMajors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_standard_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "courseStandardId" TEXT,
    "templateVersionId" TEXT,
    "contentJson" JSONB,
    "status" "AcademicDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedSnapshotJson" JSONB,
    "ownerId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_plan_weeks" (
    "id" TEXT NOT NULL,
    "deliveryPlanId" TEXT NOT NULL,
    "weekNo" INTEGER NOT NULL,
    "hours" INTEGER NOT NULL,
    "grouping" TEXT,
    "teachingMode" TEXT,
    "unitOrTask" TEXT NOT NULL,
    "ideologicalElements" TEXT,
    "integrationMethod" TEXT,
    "theoreticalPoints" TEXT,
    "practiceProject" TEXT,
    "practiceInstructor" TEXT,
    "remarks" TEXT,
    "linkedStandardTopicIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_plan_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_plan_books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "templateVersionId" TEXT,
    "teacherName" TEXT,
    "teacherTitle" TEXT,
    "teacherUnit" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "totalHours" INTEGER,
    "theoryHours" INTEGER,
    "practicalHours" INTEGER,
    "weeklyHours" INTEGER,
    "assessmentMethod" TEXT,
    "targetUnit" TEXT,
    "targetClass" TEXT,
    "researchReview" TEXT,
    "deptReview" TEXT,
    "status" "AcademicDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedSnapshotJson" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_plan_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_plan_lessons" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "lessonNo" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "lessonType" TEXT,
    "className" TEXT,
    "weekNo" INTEGER,
    "weekday" TEXT,
    "period" TEXT,
    "lessonDate" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 45,
    "objectives" TEXT NOT NULL,
    "ideologicalElements" TEXT,
    "integrationMethod" TEXT,
    "keyPoints" TEXT,
    "difficulty" TEXT,
    "methods" TEXT,
    "teachingAids" TEXT,
    "outline" TEXT NOT NULL,
    "reflection" TEXT,
    "contentJson" JSONB,
    "status" "AcademicDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedSnapshotJson" JSONB,
    "publishedAt" TIMESTAMP(3),
    "deliveryPlanId" TEXT,
    "deliveryPlanWeekId" TEXT,
    "templateVersionId" TEXT,
    "courseStandardTopicRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_plan_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courseware_assets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "courseOfferingId" TEXT,
    "deliveryPlanWeekId" TEXT,
    "teachingPlanLessonId" TEXT,
    "chapterRef" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ideologicalElements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courseware_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_definitions" (
    "id" TEXT NOT NULL,
    "docType" "TemplateDocType" NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "TemplateScope" NOT NULL,
    "ownerId" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_versions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "schemaJson" JSONB NOT NULL,
    "defaultContentJson" JSONB,
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trace_links" (
    "id" TEXT NOT NULL,
    "type" "TraceLinkType" NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "evidence" JSONB,
    "severity" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trace_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_mapping_queue" (
    "id" TEXT NOT NULL,
    "legacyTeachingPlanId" TEXT NOT NULL,
    "suggestedCourseOfferingId" TEXT,
    "suggestedSemesterId" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "LegacyMappingStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_mapping_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "semesters_name_startDate_endDate_key" ON "semesters"("name", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "course_offerings_courseId_semesterId_className_teacherId_key" ON "course_offerings"("courseId", "semesterId", "className", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_plan_weeks_deliveryPlanId_weekNo_key" ON "delivery_plan_weeks"("deliveryPlanId", "weekNo");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_plan_lessons_bookId_lessonNo_key" ON "teaching_plan_lessons"("bookId", "lessonNo");

-- CreateIndex
CREATE UNIQUE INDEX "template_definitions_docType_name_scope_ownerId_key" ON "template_definitions"("docType", "name", "scope", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_templateId_version_key" ON "template_versions"("templateId", "version");

-- CreateIndex
CREATE INDEX "trace_links_sourceType_sourceId_idx" ON "trace_links"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "trace_links_targetType_targetId_idx" ON "trace_links"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_mapping_queue_legacyTeachingPlanId_key" ON "legacy_mapping_queue"("legacyTeachingPlanId");

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_ownerTeacherId_fkey" FOREIGN KEY ("ownerTeacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_standards" ADD CONSTRAINT "course_standards_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_standards" ADD CONSTRAINT "course_standards_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_standards" ADD CONSTRAINT "course_standards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_standards" ADD CONSTRAINT "course_standards_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_standard_modules" ADD CONSTRAINT "course_standard_modules_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "course_standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_standard_topics" ADD CONSTRAINT "course_standard_topics_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_standard_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_courseStandardId_fkey" FOREIGN KEY ("courseStandardId") REFERENCES "course_standards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plan_weeks" ADD CONSTRAINT "delivery_plan_weeks_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "delivery_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_books" ADD CONSTRAINT "teaching_plan_books_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_books" ADD CONSTRAINT "teaching_plan_books_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_books" ADD CONSTRAINT "teaching_plan_books_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_books" ADD CONSTRAINT "teaching_plan_books_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_lessons" ADD CONSTRAINT "teaching_plan_lessons_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "teaching_plan_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_lessons" ADD CONSTRAINT "teaching_plan_lessons_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "delivery_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_lessons" ADD CONSTRAINT "teaching_plan_lessons_deliveryPlanWeekId_fkey" FOREIGN KEY ("deliveryPlanWeekId") REFERENCES "delivery_plan_weeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_lessons" ADD CONSTRAINT "teaching_plan_lessons_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseware_assets" ADD CONSTRAINT "courseware_assets_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseware_assets" ADD CONSTRAINT "courseware_assets_deliveryPlanWeekId_fkey" FOREIGN KEY ("deliveryPlanWeekId") REFERENCES "delivery_plan_weeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseware_assets" ADD CONSTRAINT "courseware_assets_teachingPlanLessonId_fkey" FOREIGN KEY ("teachingPlanLessonId") REFERENCES "teaching_plan_lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseware_assets" ADD CONSTRAINT "courseware_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_definitions" ADD CONSTRAINT "template_definitions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "template_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trace_links" ADD CONSTRAINT "trace_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_mapping_queue" ADD CONSTRAINT "legacy_mapping_queue_legacyTeachingPlanId_fkey" FOREIGN KEY ("legacyTeachingPlanId") REFERENCES "teaching_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_mapping_queue" ADD CONSTRAINT "legacy_mapping_queue_suggestedCourseOfferingId_fkey" FOREIGN KEY ("suggestedCourseOfferingId") REFERENCES "course_offerings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_mapping_queue" ADD CONSTRAINT "legacy_mapping_queue_suggestedSemesterId_fkey" FOREIGN KEY ("suggestedSemesterId") REFERENCES "semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_mapping_queue" ADD CONSTRAINT "legacy_mapping_queue_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "course_offerings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "delivery_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_planBookId_fkey" FOREIGN KEY ("planBookId") REFERENCES "teaching_plan_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
