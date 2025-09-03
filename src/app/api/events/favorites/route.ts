import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all favorited events for the user
    const favorites = await prisma.eventFavorite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          include: {
            group: true,
            attendees: {
              where: {
                userId: user.id,
              },
            },
            _count: {
              select: {
                attendees: true,
                comments: true,
                photos: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to return just the events with favorite info
    const favoriteEvents = favorites.map((favorite) => ({
      ...favorite.event,
      isFavorited: true,
      favoritedAt: favorite.createdAt,
    }));

    return NextResponse.json({ events: favoriteEvents });
  } catch (error) {
    console.error("Error fetching favorite events:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite events" },
      { status: 500 }
    );
  }
}
