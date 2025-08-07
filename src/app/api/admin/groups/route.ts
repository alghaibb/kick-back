import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(true); // Skip rate limiting for read operations

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Get groups with pagination and include user and member info
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              events: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.group.count(),
    ]);

    // Get user info for each group (for the 'createdBy' user)
    const userIds = [...new Set(groups.map(group => group.createdBy))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
      },
    });

    const userMap = new Map(users.map(user => [user.id, user]));

    const totalPages = Math.ceil(total / limit);

    const mappedGroups = groups.map((group) => ({
      ...group,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      user: userMap.get(group.createdBy), // Add the createdBy user
    }));

    return NextResponse.json({
      groups: mappedGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
} 