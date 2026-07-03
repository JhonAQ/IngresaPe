-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE_SWIPE', 'FLASHCARD', 'ORDERING');

-- AlterTable
ALTER TABLE "AnswerLog" ADD COLUMN     "answer" JSONB;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "content" JSONB,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
ALTER COLUMN "options" DROP NOT NULL;
