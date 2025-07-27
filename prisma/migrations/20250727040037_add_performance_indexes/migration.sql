-- CreateIndex
CREATE INDEX "event_attendees_userId_idx" ON "event_attendees"("userId");

-- CreateIndex
CREATE INDEX "event_attendees_eventId_idx" ON "event_attendees"("eventId");

-- CreateIndex
CREATE INDEX "event_attendees_rsvpStatus_idx" ON "event_attendees"("rsvpStatus");

-- CreateIndex
CREATE INDEX "event_attendees_userId_rsvpStatus_idx" ON "event_attendees"("userId", "rsvpStatus");

-- CreateIndex
CREATE INDEX "event_attendees_lastReminderSent_idx" ON "event_attendees"("lastReminderSent");

-- CreateIndex
CREATE INDEX "event_comments_eventId_idx" ON "event_comments"("eventId");

-- CreateIndex
CREATE INDEX "event_comments_userId_idx" ON "event_comments"("userId");

-- CreateIndex
CREATE INDEX "event_comments_eventId_createdAt_idx" ON "event_comments"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "events_createdBy_idx" ON "events"("createdBy");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_groupId_idx" ON "events"("groupId");

-- CreateIndex
CREATE INDEX "events_date_createdBy_idx" ON "events"("date", "createdBy");

-- CreateIndex
CREATE INDEX "events_groupId_date_idx" ON "events"("groupId", "date");

-- CreateIndex
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

-- CreateIndex
CREATE INDEX "group_members_groupId_idx" ON "group_members"("groupId");

-- CreateIndex
CREATE INDEX "groups_createdBy_idx" ON "groups"("createdBy");
