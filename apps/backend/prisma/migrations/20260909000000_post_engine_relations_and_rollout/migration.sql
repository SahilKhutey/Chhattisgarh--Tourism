-- AlterTable ContentTemplate
ALTER TABLE "ContentTemplate" ADD COLUMN "publishedVersion" INTEGER;
ALTER TABLE "ContentTemplate" ADD COLUMN "createdById" TEXT;
ALTER TABLE "ContentTemplate" ADD COLUMN "updatedById" TEXT;

-- CreateIndex
CREATE INDEX "ContentTemplate_createdById_idx" ON "ContentTemplate"("createdById");

-- AddForeignKey
ALTER TABLE "ContentTemplate" ADD CONSTRAINT "ContentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTemplate" ADD CONSTRAINT "ContentTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable TemplateVersion
ALTER TABLE "TemplateVersion" ADD COLUMN "createdById" TEXT;
ALTER TABLE "TemplateVersion" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TemplateVersion_templateId_idx" ON "TemplateVersion"("templateId");

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable ContentEntry
ALTER TABLE "ContentEntry" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "ContentEntry" ADD COLUMN "longitude" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "ContentEntry" ADD CONSTRAINT "ContentEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
