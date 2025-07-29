import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string; commentId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, commentId } = await params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor"); // For pagination
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Check if user has access to this event (is attendee or group member)
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

    // Check if user has access (is attendee or group member)
    const isAttendee = event.attendees.length > 0;
    const isGroupMember = (event.group?.members?.length ?? 0) > 0;

    if (!isAttendee && !isGroupMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify the parent comment exists and belongs to this event
    const parentComment = await prisma.eventComment.findUnique({
      where: { id: commentId },
      select: { eventId: true },
    });

    if (!parentComment || parentComment.eventId !== eventId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Build cursor condition for pagination (replies are always oldest first)
    const cursorCondition = cursor
      ? { createdAt: { gt: new Date(cursor) } }
      : {};

    // Fetch replies with pagination
    const replies = await prisma.eventComment.findMany({
      where: {
        parentId: commentId,
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
        createdAt: "asc", // Replies always oldest first
      },
    });

    // Check if there are more replies
    const hasMore = replies.length > limit;
    const repliesToReturn = hasMore ? replies.slice(0, -1) : replies;

    // Get the next cursor
    const nextCursor =
      hasMore && repliesToReturn.length > 0
        ? repliesToReturn[repliesToReturn.length - 1].createdAt.toISOString()
        : null;

    // Get total count
    const totalCount = await prisma.eventComment.count({
      where: {
        parentId: commentId,
      },
    });

    return NextResponse.json({
      replies: repliesToReturn,
      totalCount,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
