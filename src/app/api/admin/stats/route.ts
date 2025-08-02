import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// Cache stats for 2 minutes to reduce database load
interface StatsData {
  totalUsers: number;
  activeEvents: number;
  contactMessages: number;
  totalGroups: number;
}

let statsCache: {
  data: StatsData;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function GET() {
  try {
    // Skip rate limiting for stats read operations
    await requireAdmin(true);

    // Check cache first
    const now = Date.now();
    if (statsCache && (now - statsCache.timestamp) < CACHE_DURATION) {
      const response = NextResponse.json({
        ...statsCache.data,
        cached: true,
        cacheAge: Math.floor((now - statsCache.timestamp) / 1000),
      });

      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return response;
    }

    // Get counts in parallel for better performance with optimized queries
    const [totalUsers, activeEvents, contactMessages, totalGroups, recentActivity] =
      await Promise.all([
        prisma.user.count({
          where: { deletedAt: null }, // Only count active users
        }),
        prisma.event.count({
          where: {
            date: {
              gte: new Date(),
            },
          },
        }),
        prisma.contact.count(),
        prisma.group.count(),
        // Get recent activity metrics
        prisma.user.count({
          where: {
            deletedAt: null,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

    // Calculate growth metrics
    const [usersLastWeek, eventsLastWeek] = await Promise.all([
      prisma.user.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          },
        },
      }),
      prisma.event.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const data = {
      totalUsers,
      activeEvents,
      contactMessages,
      totalGroups,
      recentActivity,
      growth: {
        usersThisWeek: recentActivity,
        usersLastWeek,
        userGrowthRate: usersLastWeek > 0 ? ((recentActivity - usersLastWeek) / usersLastWeek * 100) : 0,
        eventsGrowthRate: eventsLastWeek > 0 ? ((activeEvents - eventsLastWeek) / eventsLastWeek * 100) : 0,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    statsCache = {
      data,
      timestamp: now,
    };

    const response = NextResponse.json({
      ...data,
      cached: false,
    });

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error("Error fetching admin stats:", error);

    // Return cached data if available, even if stale
    if (statsCache) {
      return NextResponse.json({
        ...statsCache.data,
        cached: true,
        stale: true,
        error: "Failed to fetch fresh stats",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}

// Add endpoint to clear cache if needed
export async function DELETE() {
  try {
    await requireAdmin();
    statsCache = null;
    return NextResponse.json({ message: "Cache cleared successfully" });
  } catch (error) {
    console.error("Error clearing admin stats cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}