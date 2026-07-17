-- Convert existing coins into gems
UPDATE "User" SET "gems" = COALESCE("gems", 0) + COALESCE("coins", 0);

-- New users start with 150 gems
ALTER TABLE "User" ALTER COLUMN "gems" SET DEFAULT 150;

-- Track daily economy details
ALTER TABLE "ActivityLog" ADD COLUMN "loginBonusGems" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ActivityLog" ADD COLUMN "streakMilestoneGems" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ActivityLog" ADD COLUMN "energyRefillsUsed" INTEGER NOT NULL DEFAULT 0;

-- Shop item categories
CREATE TYPE "ShopItemCategory" AS ENUM ('CONSUMABLE', 'BOOST', 'RATING', 'COSMETIC');
ALTER TABLE "ShopItem" ADD COLUMN "category" "ShopItemCategory" NOT NULL DEFAULT 'CONSUMABLE';
ALTER TABLE "ShopItem" ADD COLUMN "effectData" JSONB;

-- Simulacro gem rewards
ALTER TABLE "ExamAttempt" ADD COLUMN "totalGemsEarned" INTEGER NOT NULL DEFAULT 0;

-- Drop after frontend is fully migrated
-- ALTER TABLE "User" DROP COLUMN "coins";
