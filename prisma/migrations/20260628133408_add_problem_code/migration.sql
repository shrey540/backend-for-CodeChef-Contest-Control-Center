/*
  Warnings:

  - A unique constraint covering the columns `[contest_id,code]` on the table `problems` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "code" VARCHAR(10);

-- CreateIndex
CREATE UNIQUE INDEX "problems_contest_id_code_key" ON "problems"("contest_id", "code");
