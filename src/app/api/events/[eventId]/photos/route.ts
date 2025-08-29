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

    // Single optimized query for permissions and photos
    const [event, photos] = await Promise.all([
      // Check permissions
      prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          createdBy: true,
          attendees: {
            where: { userId: session.user.id },
            select: { id: true },
          },
          group: {
            select: {
              members: {
                where: { userId: session.user.id },
                select: { id: true },
              },
            },
          },
        },
      }),

      // Fetch photos (optimistically - cancel if no permission)
      prisma.eventPhoto.findMany({
        where: { eventId },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              firstName: true,
              nickname: true,
              image: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          _count: {
            select: { likes: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

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

    const photosWithLikeStatus = photos.map((photo) => ({
      ...photo,
      isLikedByUser: photo.likes.some(
        (like) => like.userId === session.user.id
      ),
      likes: undefined,
    }));

    return NextResponse.json(
      { photos: photosWithLikeStatus },
      { headers: { "cache-control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("Event photos API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
