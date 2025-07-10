-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "reminderTime" TEXT NOT NULL DEFAULT '09:00',
ADD COLUMN     "reminderType" TEXT NOT NULL DEFAULT 'email';
