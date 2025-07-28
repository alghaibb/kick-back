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

    // Fetch top-level comments with nested replies and reactions
    const comments = await prisma.eventComment.findMany({
      where: {
        eventId,
        parentId: null, // Only top-level comments
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
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      },
    });

    // Get total count
    const totalCount = await prisma.eventComment.count({
      where: {
        eventId,
        parentId: null,
      },
    });

    return NextResponse.json({
      comments,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
