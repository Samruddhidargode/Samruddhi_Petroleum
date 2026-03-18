-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DSM', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('HSD', 'MS');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'ONLINE', 'CREDIT');

-- CreateEnum
CREATE TYPE "MduTripStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "dsmCode" TEXT,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "timeIn" TIMESTAMP(3) NOT NULL,
    "timeOut" TIMESTAMP(3),
    "shiftNumber" INTEGER NOT NULL,
    "qrScannerNo" TEXT,
    "status" "ShiftStatus" NOT NULL DEFAULT 'DRAFT',
    "totalSales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCollected" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "difference" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "confirmedIp" TEXT,
    "confirmedDevice" TEXT,
    "dsmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NozzleEntry" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "pointNo" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "openingReading" DECIMAL(65,30) NOT NULL,
    "closingReading" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "pumpTestLiters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "ownUseLiters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "dispensedQty" DECIMAL(65,30) NOT NULL,
    "effectiveQty" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NozzleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashDrop" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "den500" INTEGER NOT NULL DEFAULT 0,
    "den200" INTEGER NOT NULL DEFAULT 0,
    "den100" INTEGER NOT NULL DEFAULT 0,
    "den50" INTEGER NOT NULL DEFAULT 0,
    "den20" INTEGER NOT NULL DEFAULT 0,
    "den10" INTEGER NOT NULL DEFAULT 0,
    "coins" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "droppedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashDrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrEntry" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardEntry" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetEntry" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyCreditEntry" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyCreditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MduTrip" (
    "id" TEXT NOT NULL,
    "tripDate" TIMESTAMP(3) NOT NULL,
    "openingTime" TIMESTAMP(3) NOT NULL,
    "closingTime" TIMESTAMP(3),
    "vehicleNo" TEXT NOT NULL,
    "openingMeter" DECIMAL(65,30),
    "closingMeter" DECIMAL(65,30),
    "status" "MduTripStatus" NOT NULL DEFAULT 'OPEN',
    "dsmId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MduTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MduClient" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MduClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MduEod" (
    "id" TEXT NOT NULL,
    "eodDate" TIMESTAMP(3) NOT NULL,
    "totalTrips" INTEGER NOT NULL,
    "totalClients" INTEGER NOT NULL,
    "totalSales" DECIMAL(65,30) NOT NULL,
    "cashTotal" DECIMAL(65,30) NOT NULL,
    "onlineTotal" DECIMAL(65,30) NOT NULL,
    "creditTotal" DECIMAL(65,30) NOT NULL,
    "confirmedById" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedIp" TEXT,
    "confirmedDevice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MduEod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dsmCode_key" ON "User"("dsmCode");

-- CreateIndex
CREATE INDEX "Shift_shiftDate_shiftNumber_idx" ON "Shift"("shiftDate", "shiftNumber");

-- CreateIndex
CREATE INDEX "Shift_dsmId_idx" ON "Shift"("dsmId");

-- CreateIndex
CREATE INDEX "NozzleEntry_shiftId_idx" ON "NozzleEntry"("shiftId");

-- CreateIndex
CREATE INDEX "NozzleEntry_pointNo_fuelType_idx" ON "NozzleEntry"("pointNo", "fuelType");

-- CreateIndex
CREATE INDEX "CashDrop_shiftId_idx" ON "CashDrop"("shiftId");

-- CreateIndex
CREATE INDEX "QrEntry_shiftId_idx" ON "QrEntry"("shiftId");

-- CreateIndex
CREATE INDEX "CardEntry_shiftId_idx" ON "CardEntry"("shiftId");

-- CreateIndex
CREATE INDEX "CardEntry_cardType_idx" ON "CardEntry"("cardType");

-- CreateIndex
CREATE INDEX "FleetEntry_shiftId_idx" ON "FleetEntry"("shiftId");

-- CreateIndex
CREATE INDEX "PartyCreditEntry_shiftId_idx" ON "PartyCreditEntry"("shiftId");

-- CreateIndex
CREATE INDEX "PartyCreditEntry_partyName_idx" ON "PartyCreditEntry"("partyName");

-- CreateIndex
CREATE INDEX "MduTrip_tripDate_idx" ON "MduTrip"("tripDate");

-- CreateIndex
CREATE INDEX "MduTrip_dsmId_idx" ON "MduTrip"("dsmId");

-- CreateIndex
CREATE INDEX "MduClient_tripId_idx" ON "MduClient"("tripId");

-- CreateIndex
CREATE INDEX "MduClient_paymentMode_idx" ON "MduClient"("paymentMode");

-- CreateIndex
CREATE UNIQUE INDEX "MduEod_eodDate_key" ON "MduEod"("eodDate");

-- CreateIndex
CREATE INDEX "MduEod_confirmedById_idx" ON "MduEod"("confirmedById");

-- CreateIndex
CREATE INDEX "Image_entityType_entityId_idx" ON "Image"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_dsmId_fkey" FOREIGN KEY ("dsmId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NozzleEntry" ADD CONSTRAINT "NozzleEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashDrop" ADD CONSTRAINT "CashDrop_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrEntry" ADD CONSTRAINT "QrEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEntry" ADD CONSTRAINT "CardEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetEntry" ADD CONSTRAINT "FleetEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyCreditEntry" ADD CONSTRAINT "PartyCreditEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MduTrip" ADD CONSTRAINT "MduTrip_dsmId_fkey" FOREIGN KEY ("dsmId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MduClient" ADD CONSTRAINT "MduClient_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "MduTrip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MduEod" ADD CONSTRAINT "MduEod_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
