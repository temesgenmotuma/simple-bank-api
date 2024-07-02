/*
  Warnings:

  - Made the column `fromAccountId` on table `Transfer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toAccountId` on table `Transfer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_fromAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_toAccountId_fkey";

-- AlterTable
ALTER TABLE "Transfer" ALTER COLUMN "fromAccountId" SET NOT NULL,
ALTER COLUMN "toAccountId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
