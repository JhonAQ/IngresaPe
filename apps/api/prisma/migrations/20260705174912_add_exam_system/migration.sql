-- CreateEnum
CREATE TYPE "ExamMode" AS ENUM ('ARCHIVE', 'GENERATED');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- DropForeignKey
ALTER TABLE "AnswerLog" DROP CONSTRAINT "AnswerLog_questionId_fkey";

-- AlterTable
ALTER TABLE "AnswerLog" ADD COLUMN     "examQuestionId" TEXT,
ALTER COLUMN "questionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Career" ADD COLUMN     "minimumScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "freeSimAttemptsResetAt" TIMESTAMP(3),
ADD COLUMN     "freeSimAttemptsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastExamScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "phase" TEXT,
    "type" TEXT,
    "questionCount" INTEGER NOT NULL,
    "timeLimitMinutes" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "explanation" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "topicId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT,
    "mode" "ExamMode" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "questionIds" TEXT[],
    "answers" JSONB,
    "status" "ExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeUsedSeconds" INTEGER,
    "correctCount" INTEGER,
    "incorrectCount" INTEGER,
    "blankCount" INTEGER,
    "score" DOUBLE PRECISION,
    "totalXpEarned" INTEGER NOT NULL DEFAULT 0,
    "totalCoinsEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exam_year_type_idx" ON "Exam"("year", "type");

-- CreateIndex
CREATE INDEX "ExamQuestion_examId_order_idx" ON "ExamQuestion"("examId", "order");

-- CreateIndex
CREATE INDEX "ExamQuestion_topicId_idx" ON "ExamQuestion"("topicId");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_status_startedAt_idx" ON "ExamAttempt"("userId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "AnswerLog_userId_questionId_idx" ON "AnswerLog"("userId", "questionId");

-- CreateIndex
CREATE INDEX "AnswerLog_userId_examQuestionId_idx" ON "AnswerLog"("userId", "examQuestionId");

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_examQuestionId_fkey" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
