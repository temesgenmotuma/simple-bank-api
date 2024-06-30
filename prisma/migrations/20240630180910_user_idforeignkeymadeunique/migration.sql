/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "balance" SET DEFAULT 0.0;

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");
