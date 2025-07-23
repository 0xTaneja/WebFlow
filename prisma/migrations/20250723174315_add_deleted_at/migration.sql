-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Project_id_deletedAt_idx" ON "Project"("id", "deletedAt");
