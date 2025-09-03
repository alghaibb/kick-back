import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const favorite = await prisma.eventFavorite.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        eventId,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/events");

    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    console.error("Error favoriting event:", error);
    return NextResponse.json(
      { error: "Failed to favorite event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    // Delete favorite if it exists
    await prisma.eventFavorite.deleteMany({
      where: {
        eventId,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/events");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfavoriting event:", error);
    return NextResponse.json(
      { error: "Failed to unfavorite event" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    // Check if user has favorited this event
    const favorite = await prisma.eventFavorite.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/events");

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return NextResponse.json(
      { error: "Failed to check favorite status" },
      { status: 500 }
    );
  }
}
