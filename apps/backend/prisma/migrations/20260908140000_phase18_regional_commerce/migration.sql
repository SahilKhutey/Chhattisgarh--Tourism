-- Phase 18 Regional Commerce & Partner Network Migration

-- CreateEnums
DO $$ BEGIN
    CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'SUSPENDED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InventoryType" AS ENUM ('HOMESTAY', 'GUIDE', 'EXPERIENCE', 'EVENT', 'TRANSPORT', 'ACTIVITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'AUTHORIZED', 'PAID', 'REFUND_PENDING', 'REFUNDED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable Booking for marketplace compatibility
ALTER TABLE "Booking" ALTER COLUMN "placeId" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "visitDate" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "unitPricePaise" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "subtotalPaise" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "platformFeePaise" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "totalPricePaise" DROP NOT NULL;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "availabilityId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(12,2);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(12,2);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "bookingReference" TEXT;

-- Create Unique Index on bookingReference if not exists
DO $$ BEGIN
    CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "Booking_partnerId_idx" ON "Booking"("partnerId");
CREATE INDEX IF NOT EXISTS "Booking_productId_idx" ON "Booking"("productId");

-- CreateTable Partner
CREATE TABLE IF NOT EXISTS "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "districtId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Partner_slug_key" ON "Partner"("slug");
CREATE INDEX IF NOT EXISTS "Partner_status_idx" ON "Partner"("status");
CREATE INDEX IF NOT EXISTS "Partner_districtId_idx" ON "Partner"("districtId");

-- CreateTable TourismProduct
CREATE TABLE IF NOT EXISTS "TourismProduct" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "InventoryType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "capacity" INTEGER NOT NULL,
    "durationMin" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourismProduct_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TourismProduct_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TourismProduct_slug_key" ON "TourismProduct"("slug");
CREATE INDEX IF NOT EXISTS "TourismProduct_partnerId_idx" ON "TourismProduct"("partnerId");
CREATE INDEX IF NOT EXISTS "TourismProduct_type_idx" ON "TourismProduct"("type");
CREATE INDEX IF NOT EXISTS "TourismProduct_active_idx" ON "TourismProduct"("active");

-- CreateTable ProductAvailability
CREATE TABLE IF NOT EXISTS "ProductAvailability" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAvailability_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductAvailability_productId_fkey" FOREIGN KEY ("productId") REFERENCES "TourismProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductAvailability_productId_idx" ON "ProductAvailability"("productId");
CREATE INDEX IF NOT EXISTS "ProductAvailability_startAt_idx" ON "ProductAvailability"("startAt");

-- CreateTable PartnerCommission
CREATE TABLE IF NOT EXISTS "PartnerCommission" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "partnerAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerCommission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PartnerCommission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerCommission_bookingId_key" ON "PartnerCommission"("bookingId");
CREATE INDEX IF NOT EXISTS "PartnerCommission_partnerId_idx" ON "PartnerCommission"("partnerId");

-- CreateTable ProductReview
CREATE TABLE IF NOT EXISTS "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "TourismProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductReview_bookingId_key" ON "ProductReview"("bookingId");
CREATE INDEX IF NOT EXISTS "ProductReview_productId_idx" ON "ProductReview"("productId");
CREATE INDEX IF NOT EXISTS "ProductReview_userId_idx" ON "ProductReview"("userId");
CREATE INDEX IF NOT EXISTS "ProductReview_rating_idx" ON "ProductReview"("rating");

-- CreateTable CancellationPolicy
CREATE TABLE IF NOT EXISTS "CancellationPolicy" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fullRefundHours" INTEGER NOT NULL DEFAULT 48,
    "partialRefundHours" INTEGER NOT NULL DEFAULT 24,
    "partialRefundPercent" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationPolicy_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CancellationPolicy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "TourismProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CancellationPolicy_productId_key" ON "CancellationPolicy"("productId");

-- CreateTable CommerceAuditLog
CREATE TABLE IF NOT EXISTS "CommerceAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommerceAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommerceAuditLog_entityType_idx" ON "CommerceAuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "CommerceAuditLog_entityId_idx" ON "CommerceAuditLog"("entityId");
CREATE INDEX IF NOT EXISTS "CommerceAuditLog_actorId_idx" ON "CommerceAuditLog"("actorId");
CREATE INDEX IF NOT EXISTS "CommerceAuditLog_createdAt_idx" ON "CommerceAuditLog"("createdAt");

-- CreateTable IdempotencyKey
CREATE TABLE IF NOT EXISTS "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "userId" TEXT,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IdempotencyKey_key_key" ON "IdempotencyKey"("key");
CREATE INDEX IF NOT EXISTS "IdempotencyKey_userId_idx" ON "IdempotencyKey"("userId");
CREATE INDEX IF NOT EXISTS "IdempotencyKey_operation_idx" ON "IdempotencyKey"("operation");

-- Add foreign key constraints to Booking
DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "TourismProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
