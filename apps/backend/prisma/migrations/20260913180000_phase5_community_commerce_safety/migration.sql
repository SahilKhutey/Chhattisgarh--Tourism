-- CreateEnum
CREATE TYPE "CreatorStatus" AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FLAGGED', 'REMOVED');

-- CreateEnum
CREATE TYPE "BookingLifecycleStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmergencySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'DISPATCHED', 'RESPONDING', 'ON_SCENE', 'RESOLVED', 'ESCALATED');

-- AlterTable
ALTER TABLE "CreatorProfile" ADD COLUMN "creatorStatus" "CreatorStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "CreatorProfile" ADD COLUMN "followersCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CreatorProfile" ADD COLUMN "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "verifiedVisit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Review" ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE "CreatorContent" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STORY',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT,
    "location" TEXT,
    "placeId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "moderationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "moderationReason" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyIncident" (
    "id" TEXT NOT NULL,
    "incidentNumber" TEXT NOT NULL,
    "userId" TEXT,
    "tripId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MEDICAL',
    "severity" "EmergencySeverity" NOT NULL DEFAULT 'HIGH',
    "status" "IncidentStatus" NOT NULL DEFAULT 'TRIGGERED',
    "description" TEXT,
    "primaryResponder" TEXT,
    "primaryResponderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "EmergencyIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "bookingId" TEXT,
    "payload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorContent_creatorId_idx" ON "CreatorContent"("creatorId");
CREATE INDEX "CreatorContent_status_idx" ON "CreatorContent"("status");
CREATE INDEX "CreatorContent_moderationStatus_idx" ON "CreatorContent"("moderationStatus");
CREATE INDEX "CreatorContent_placeId_idx" ON "CreatorContent"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyIncident_incidentNumber_key" ON "EmergencyIncident"("incidentNumber");
CREATE INDEX "EmergencyIncident_status_idx" ON "EmergencyIncident"("status");
CREATE INDEX "EmergencyIncident_userId_idx" ON "EmergencyIncident"("userId");
CREATE INDEX "EmergencyIncident_createdAt_idx" ON "EmergencyIncident"("createdAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_availableAt_idx" ON "OutboxEvent"("status", "availableAt");
CREATE INDEX "OutboxEvent_aggregateType_aggregateId_idx" ON "OutboxEvent"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhookEvent_provider_eventId_key" ON "PaymentWebhookEvent"("provider", "eventId");
CREATE INDEX "PaymentWebhookEvent_bookingId_idx" ON "PaymentWebhookEvent"("bookingId");
CREATE INDEX "PaymentWebhookEvent_receivedAt_idx" ON "PaymentWebhookEvent"("receivedAt");

-- AddForeignKey
ALTER TABLE "CreatorContent" ADD CONSTRAINT "CreatorContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorContent" ADD CONSTRAINT "CreatorContent_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
