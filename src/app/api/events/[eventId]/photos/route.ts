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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: { where: { userId: session.user.id } },
        group: {
          include: {
            members: { where: { userId: session.user.id } },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const canView =
      event.createdBy === session.user.id ||
      event.attendees.length > 0 ||
      (event.group && event.group.members.length > 0);

    if (!canView) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const photos = await prisma.eventPhoto.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            nickname: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const photosWithLikeStatus = photos.map((photo) => ({
      ...photo,
      isLikedByUser: photo.likes.some(
        (like) => like.userId === session.user.id
      ),
      likes: undefined,
    }));

    return NextResponse.json({ photos: photosWithLikeStatus });
  } catch (error) {
    console.error("Event photos API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
