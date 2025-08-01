import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();

    // Get counts in parallel for better performance
    const [totalUsers, activeEvents, contactMessages, totalGroups] =
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
      ]);

    const response = NextResponse.json({
      totalUsers,
      activeEvents,
      contactMessages,
      totalGroups,
    });

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
