-- CreateIndex
CREATE INDEX "event_comments_eventId_parentId_idx" ON "event_comments"("eventId", "parentId");
