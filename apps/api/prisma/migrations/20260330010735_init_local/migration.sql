-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "inventory" TEXT[] DEFAULT ARRAY['default']::TEXT[];
