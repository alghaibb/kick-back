/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EventAttendee" ADD COLUMN     "lastReminderSent" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "timezone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");
