/*
  Warnings:

  - You are about to drop the column `settledAt` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "settledAt";

-- AlterTable
ALTER TABLE "Year" ADD COLUMN     "settledAt" TIMESTAMP(3);
