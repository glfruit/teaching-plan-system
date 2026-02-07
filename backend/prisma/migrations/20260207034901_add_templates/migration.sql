-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "TeachingPlanStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('THEORY', 'EXPERIMENT', 'PRACTICE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TEACHER',
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 45,
    "objectives" TEXT NOT NULL,
    "keyPoints" TEXT NOT NULL,
    "process" TEXT NOT NULL,
    "blackboard" TEXT,
    "reflection" TEXT,
    "methods" TEXT,
    "resources" TEXT,
    "htmlContent" TEXT NOT NULL,
    "status" "TeachingPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TemplateCategory" NOT NULL,
    "structure" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "teaching_templates_category_idx" ON "teaching_templates"("category");

-- CreateIndex
CREATE INDEX "teaching_templates_creatorId_idx" ON "teaching_templates"("creatorId");

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
