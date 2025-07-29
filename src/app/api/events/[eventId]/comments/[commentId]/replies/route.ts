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

    // Recursive function to get all replies in a thread
    async function getAllRepliesInThread(
      rootCommentId: string
    ): Promise<any[]> {
      const allReplies: any[] = [];
      const idsToProcess = [rootCommentId];
      const processedIds = new Set<string>();

      while (idsToProcess.length > 0) {
        const currentIds = idsToProcess.splice(0); // Take all current IDs

        if (currentIds.length === 0) break;

        // Fetch direct children of current IDs
        const replies = await prisma.eventComment.findMany({
          where: {
            parentId: { in: currentIds },
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
          orderBy: {
            createdAt: "asc",
          },
        });

        // Add new replies to our collection and queue their IDs for next iteration
        for (const reply of replies) {
          if (!processedIds.has(reply.id)) {
            allReplies.push(reply);
            idsToProcess.push(reply.id);
            processedIds.add(reply.id);
          }
        }
      }

      return allReplies;
    }

    // Get all replies in the thread (excluding the root comment itself)
    const allReplies = await getAllRepliesInThread(commentId);

    // Apply cursor filtering for pagination
    const filteredReplies = cursorCondition.createdAt
      ? allReplies.filter(
          (reply) => reply.createdAt > cursorCondition.createdAt!.gt!
        )
      : allReplies;

    // Apply pagination
    const hasMore = filteredReplies.length > limit;
    const repliesToReturn = hasMore
      ? filteredReplies.slice(0, limit)
      : filteredReplies;

    // Get the next cursor
    const nextCursor =
      hasMore && repliesToReturn.length > 0
        ? repliesToReturn[repliesToReturn.length - 1].createdAt.toISOString()
        : null;

    // Get total count
    const totalCount = allReplies.length;

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
