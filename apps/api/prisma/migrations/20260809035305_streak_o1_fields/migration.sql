-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActivityDate" DATE,
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "streakAtEndOfDay" INTEGER,
ADD COLUMN     "usedStreakFreeze" BOOLEAN NOT NULL DEFAULT false;
