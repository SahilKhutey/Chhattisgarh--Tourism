-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceText" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL DEFAULT 'en',
    "targetLang" TEXT NOT NULL,
    "translated" TEXT NOT NULL,
    "apiProvider" TEXT NOT NULL DEFAULT 'google',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "TranslationCache_targetLang_idx" ON "TranslationCache"("targetLang");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_sourceText_sourceLang_targetLang_key" ON "TranslationCache"("sourceText", "sourceLang", "targetLang");
