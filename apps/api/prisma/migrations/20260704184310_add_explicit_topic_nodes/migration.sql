-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "nodeCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nodeSize" INTEGER NOT NULL DEFAULT 7;

-- CreateTable
CREATE TABLE "UserTopicNodeCompletion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "nodeIndex" INTEGER NOT NULL,

    CONSTRAINT "UserTopicNodeCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTopicNodeCompletion_userId_topicId_idx" ON "UserTopicNodeCompletion"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicNodeCompletion_userId_topicId_nodeIndex_key" ON "UserTopicNodeCompletion"("userId", "topicId", "nodeIndex");

-- AddForeignKey
ALTER TABLE "UserTopicNodeCompletion" ADD CONSTRAINT "UserTopicNodeCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopicNodeCompletion" ADD CONSTRAINT "UserTopicNodeCompletion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
