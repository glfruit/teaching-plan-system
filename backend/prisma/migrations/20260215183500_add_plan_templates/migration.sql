CREATE TABLE "plan_templates" (
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
    "contentJson" JSONB,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_templates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "plan_templates" ADD CONSTRAINT "plan_templates_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
