-- Admin performance optimization indexes
-- Run this migration to improve admin query performance

-- User table indexes for admin searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_firstName_idx" ON "User" USING gin(to_tsvector('english', "firstName"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_lastName_idx" ON "User" USING gin(to_tsvector('english', "lastName"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_email_idx" ON "User" USING gin(to_tsvector('english', "email"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_nickname_idx" ON "User" USING gin(to_tsvector('english', "nickname"));

-- Composite indexes for common admin queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_deletedAt_role_idx" ON "User" ("deletedAt", "role");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_deletedAt_createdAt_idx" ON "User" ("deletedAt", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_role_createdAt_idx" ON "User" ("role", "createdAt" DESC);

-- Event indexes for admin stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_date_createdAt_idx" ON "Event" ("date", "createdAt" DESC);

-- Contact indexes for admin management
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Contact_createdAt_idx" ON "Contact" ("createdAt" DESC);

-- Group indexes for admin stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Group_createdAt_idx" ON "Group" ("createdAt" DESC);

-- Indexes for counting relationships (used in admin user queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "GroupMember_userId_idx" ON "GroupMember" ("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "EventComment_userId_idx" ON "EventComment" ("userId");

-- Partial indexes for better performance on common admin filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_active_users_idx" ON "User" ("createdAt" DESC) WHERE "deletedAt" IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_deleted_users_idx" ON "User" ("deletedAt" DESC) WHERE "deletedAt" IS NOT NULL;

-- Statistics indexes for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_weekly_stats_idx" ON "User" ("createdAt") WHERE "deletedAt" IS NULL AND "createdAt" >= NOW() - INTERVAL '14 days';
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_future_events_idx" ON "Event" ("date") WHERE "date" >= NOW();

-- Optimize user role queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_admin_role_idx" ON "User" ("id") WHERE "role" = 'ADMIN';

COMMENT ON INDEX "User_firstName_idx" IS 'Full-text search index for user first names in admin';
COMMENT ON INDEX "User_lastName_idx" IS 'Full-text search index for user last names in admin';
COMMENT ON INDEX "User_email_idx" IS 'Full-text search index for user emails in admin';
COMMENT ON INDEX "User_nickname_idx" IS 'Full-text search index for user nicknames in admin';
COMMENT ON INDEX "User_deletedAt_role_idx" IS 'Composite index for admin user filtering by deletion status and role';
COMMENT ON INDEX "User_active_users_idx" IS 'Partial index for active users queries in admin';
COMMENT ON INDEX "User_deleted_users_idx" IS 'Partial index for deleted users queries in admin';