-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "geoFeatureId" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "power" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StackItem" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "moduleId" TEXT NOT NULL,

    CONSTRAINT "StackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StackHistory" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "oldModuleId" TEXT NOT NULL,
    "newModuleId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StackHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplaceRule" (
    "id" SERIAL NOT NULL,
    "fromModuleId" TEXT NOT NULL,
    "toModuleId" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReplaceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_geoFeatureId_key" ON "Device"("geoFeatureId");

-- CreateIndex
CREATE UNIQUE INDEX "StackItem_deviceId_slotIndex_key" ON "StackItem"("deviceId", "slotIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ReplaceRule_fromModuleId_toModuleId_key" ON "ReplaceRule"("fromModuleId", "toModuleId");

-- AddForeignKey
ALTER TABLE "StackItem" ADD CONSTRAINT "StackItem_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackItem" ADD CONSTRAINT "StackItem_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackHistory" ADD CONSTRAINT "StackHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplaceRule" ADD CONSTRAINT "ReplaceRule_fromModuleId_fkey" FOREIGN KEY ("fromModuleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplaceRule" ADD CONSTRAINT "ReplaceRule_toModuleId_fkey" FOREIGN KEY ("toModuleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
