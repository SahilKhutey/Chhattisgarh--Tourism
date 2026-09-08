-- CreateTable
CREATE TABLE "MobileDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceToken" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "appVersion" TEXT,
    "deviceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MobileDevice_deviceToken_key" ON "MobileDevice"("deviceToken");

-- CreateIndex
CREATE INDEX "MobileDevice_userId_idx" ON "MobileDevice"("userId");

-- CreateIndex
CREATE INDEX "MobileDevice_platform_idx" ON "MobileDevice"("platform");

-- CreateIndex
CREATE INDEX "MobileDevice_active_idx" ON "MobileDevice"("active");

-- AddForeignKey
ALTER TABLE "MobileDevice" ADD CONSTRAINT "MobileDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
