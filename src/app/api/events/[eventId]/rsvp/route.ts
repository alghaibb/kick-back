import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { notifyRSVPUpdate } from "@/lib/notification-triggers";

const rsvpSchema = z.object({
  status: z.enum(["yes", "no", "maybe"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await request.json();
    const { status } = rsvpSchema.parse(body);

    const eventAttendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId: session.user.id,
      },
    });

    if (!eventAttendee) {
      return NextResponse.json(
        { error: "You are not invited to this event" },
        { status: 403 }
      );
    }

    const updatedAttendee = await prisma.eventAttendee.update({
      where: {
        id: eventAttendee.id,
      },
      data: {
        rsvpStatus: status,
        rsvpAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nickname: true,
            email: true,
            image: true,
          },
        },
      },
    });

    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          name: true,
          createdBy: true,
        },
      });

      if (event && event.createdBy !== session.user.id) {
        await notifyRSVPUpdate({
          eventId,
          eventName: event.name,
          attendeeName:
            updatedAttendee.user.nickname || updatedAttendee.user.firstName,
          rsvpStatus: status,
          eventCreatorId: event.createdBy,
        });
      }
    } catch (notificationError) {
      console.error("Failed to send RSVP notification:", notificationError);
      // Don't fail the RSVP if notification fails
    }

    return NextResponse.json({
      success: true,
      attendee: updatedAttendee,
    });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    const attendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId: session.user.id,
      },
      select: {
        rsvpStatus: true,
        rsvpAt: true,
      },
    });

    if (!attendee) {
      return NextResponse.json(
        { error: "You are not invited to this event" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      rsvpStatus: attendee.rsvpStatus,
      rsvpAt: attendee.rsvpAt,
    });
  } catch (error) {
    console.error("Get RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to get RSVP status" },
      { status: 500 }
    );
  }
}
