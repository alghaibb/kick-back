/*
  Warnings:

  - You are about to drop the column `color` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `ownderId` on the `Group` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_ownderId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "color",
DROP COLUMN "ownderId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
