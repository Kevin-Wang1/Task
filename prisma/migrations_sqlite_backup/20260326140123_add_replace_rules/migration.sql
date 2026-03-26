-- CreateTable
CREATE TABLE "ReplaceRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromModuleId" TEXT NOT NULL,
    "toModuleId" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ReplaceRule_fromModuleId_fkey" FOREIGN KEY ("fromModuleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReplaceRule_toModuleId_fkey" FOREIGN KEY ("toModuleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplaceRule_fromModuleId_toModuleId_key" ON "ReplaceRule"("fromModuleId", "toModuleId");
