-- CreateEnum
CREATE TYPE "Division" AS ENUM ('HUEVITO', 'POLLITO', 'DINOSAURIO', 'FOSIL', 'CACHIMBO');

-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "calculatedRatingDelta" INTEGER,
ADD COLUMN     "calculatedScore" DOUBLE PRECISION,
ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRevealed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seasonId" TEXT,
ADD COLUMN     "serverSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "serverTimeLimitSec" INTEGER NOT NULL DEFAULT 7200,
ADD COLUMN     "timerStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "division" "Division" NOT NULL DEFAULT 'HUEVITO',
ADD COLUMN     "gems" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highestDivision" "Division" NOT NULL DEFAULT 'HUEVITO',
ADD COLUMN     "highestRating" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "ratingFrozenUntil" TIMESTAMP(3),
ADD COLUMN     "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seasonBestDivision" "Division" NOT NULL DEFAULT 'HUEVITO',
ADD COLUMN     "seasonHighestRating" INTEGER NOT NULL DEFAULT 400;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "eventStartsAt" TIMESTAMP(3) NOT NULL,
    "eventEndsAt" TIMESTAMP(3) NOT NULL,
    "revealedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRevealed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "examAttemptId" TEXT,
    "mode" "ExamMode" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "oldRating" INTEGER NOT NULL,
    "newRating" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "divisionAtTime" "Division" NOT NULL,
    "kFactorUsed" INTEGER NOT NULL,
    "avgOpponentRating" INTEGER NOT NULL,
    "protectorsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "RatingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonStanding" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "division" "Division" NOT NULL,
    "startOfSeasonRating" INTEGER NOT NULL,
    "endOfSeasonRating" INTEGER NOT NULL,
    "bestRating" INTEGER NOT NULL,
    "simulacrosCompleted" INTEGER NOT NULL DEFAULT 0,
    "rankInDivision" INTEGER,

    CONSTRAINT "SeasonStanding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "simulacrosCompleted" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "nodesCompleted" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "gemsEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceGems" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_weekIndex_key" ON "Season"("weekIndex");

-- CreateIndex
CREATE INDEX "Season_isActive_isRevealed_idx" ON "Season"("isActive", "isRevealed");

-- CreateIndex
CREATE UNIQUE INDEX "RatingHistory_examAttemptId_key" ON "RatingHistory"("examAttemptId");

-- CreateIndex
CREATE INDEX "RatingHistory_userId_createdAt_idx" ON "RatingHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RatingHistory_seasonId_idx" ON "RatingHistory"("seasonId");

-- CreateIndex
CREATE INDEX "SeasonStanding_seasonId_division_rankInDivision_idx" ON "SeasonStanding"("seasonId", "division", "rankInDivision");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonStanding_seasonId_userId_key" ON "SeasonStanding"("seasonId", "userId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_date_idx" ON "ActivityLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_userId_date_key" ON "ActivityLog"("userId", "date");

-- CreateIndex
CREATE INDEX "UserItem_userId_idx" ON "UserItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserItem_userId_itemKey_key" ON "UserItem"("userId", "itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_key_key" ON "ShopItem"("key");

-- CreateIndex
CREATE INDEX "ExamAttempt_seasonId_idx" ON "ExamAttempt"("seasonId");

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_examAttemptId_fkey" FOREIGN KEY ("examAttemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonStanding" ADD CONSTRAINT "SeasonStanding_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonStanding" ADD CONSTRAINT "SeasonStanding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
