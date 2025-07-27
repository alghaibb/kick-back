-- CreateTable
CREATE TABLE "event_photos" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_photo_likes" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_photo_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_photos_eventId_idx" ON "event_photos"("eventId");

-- CreateIndex
CREATE INDEX "event_photos_userId_idx" ON "event_photos"("userId");

-- CreateIndex
CREATE INDEX "event_photos_eventId_createdAt_idx" ON "event_photos"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "event_photo_likes_photoId_idx" ON "event_photo_likes"("photoId");

-- CreateIndex
CREATE INDEX "event_photo_likes_userId_idx" ON "event_photo_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_photo_likes_photoId_userId_key" ON "event_photo_likes"("photoId", "userId");

-- AddForeignKey
ALTER TABLE "event_photos" ADD CONSTRAINT "event_photos_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_photos" ADD CONSTRAINT "event_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_photo_likes" ADD CONSTRAINT "event_photo_likes_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "event_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_photo_likes" ADD CONSTRAINT "event_photo_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
