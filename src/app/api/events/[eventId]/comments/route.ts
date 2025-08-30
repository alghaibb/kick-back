export const dynamic = "force-dynamic";
export const revalidate = 0;
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sortBy") || "newest";
    const cursor = url.searchParams.get("cursor"); // For pagination
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: session.user.id },
        },
        group: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isAttendee = event.attendees.length > 0;
    const isGroupMember = (event.group?.members?.length ?? 0) > 0;

    if (!isAttendee && !isGroupMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build cursor condition for pagination
    const cursorCondition = cursor
      ? sortBy === "oldest"
        ? { createdAt: { gt: new Date(cursor) } }
        : { createdAt: { lt: new Date(cursor) } }
      : {};

    const comments = await prisma.eventComment.findMany({
      where: {
        eventId,
        parentId: null, // Only top-level comments
        ...cursorCondition,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            image: true,
          },
        },
        replies: {
          take: 3, // Only show first 3 replies initially
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
                image: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    nickname: true,
                  },
                },
              },
            },
            _count: {
              select: {
                replies: true,
                reactions: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc", // Replies always oldest first
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
      take: limit + 1, // Take one extra to check if there's more
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      },
    });

    const hasMore = comments.length > limit;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;

    const nextCursor =
      hasMore && commentsToReturn.length > 0
        ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString()
        : null;

    const totalCount = await prisma.eventComment.count({
      where: {
        eventId,
        parentId: null,
      },
    });

    return NextResponse.json(
      {
        comments: commentsToReturn,
        totalCount,
        hasMore,
        nextCursor,
      },
      { headers: { "cache-control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
