/*
  Warnings:

  - Made the column `code` on table `problems` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "problems" ALTER COLUMN "code" SET NOT NULL;
