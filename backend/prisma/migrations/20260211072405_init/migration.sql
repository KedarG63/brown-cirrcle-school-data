-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_visits" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_requirements" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "booksNeeded" BOOLEAN NOT NULL DEFAULT false,
    "booksQuantity" INTEGER,
    "uniformsNeeded" BOOLEAN NOT NULL DEFAULT false,
    "uniformsQuantity" INTEGER,
    "furnitureNeeded" BOOLEAN NOT NULL DEFAULT false,
    "furnitureDetails" TEXT,
    "paintingNeeded" BOOLEAN NOT NULL DEFAULT false,
    "paintingArea" TEXT,
    "otherCoreRequirements" TEXT,
    "tvNeeded" BOOLEAN NOT NULL DEFAULT false,
    "tvQuantity" INTEGER,
    "wifiNeeded" BOOLEAN NOT NULL DEFAULT false,
    "wifiDetails" TEXT,
    "computersNeeded" BOOLEAN NOT NULL DEFAULT false,
    "computersQuantity" INTEGER,
    "otherDevRequirements" TEXT,
    "notes" TEXT,
    "estimatedBudget" DOUBLE PRECISION,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_images" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "imageType" TEXT,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "schools_name_idx" ON "schools"("name");

-- CreateIndex
CREATE INDEX "schools_location_idx" ON "schools"("location");

-- CreateIndex
CREATE INDEX "school_visits_employeeId_idx" ON "school_visits"("employeeId");

-- CreateIndex
CREATE INDEX "school_visits_visitDate_idx" ON "school_visits"("visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "school_requirements_visitId_key" ON "school_requirements"("visitId");

-- CreateIndex
CREATE INDEX "visit_images_visitId_idx" ON "visit_images"("visitId");

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_visits" ADD CONSTRAINT "school_visits_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_visits" ADD CONSTRAINT "school_visits_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_requirements" ADD CONSTRAINT "school_requirements_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "school_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_images" ADD CONSTRAINT "visit_images_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "school_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
