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

    // Check if user is an attendee OR the event creator
    const [eventAttendee, event] = await Promise.all([
      prisma.eventAttendee.findFirst({
        where: {
          eventId,
          userId: session.user.id,
        },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
        select: { createdBy: true },
      }),
    ]);

    // Allow RSVP if user is either an attendee OR the event creator
    const isAttendee = !!eventAttendee;
    const isCreator = event?.createdBy === session.user.id;

    if (!isAttendee && !isCreator) {
      return NextResponse.json(
        { error: "You are not invited to this event" },
        { status: 403 }
      );
    }

    // If user is creator but not an attendee, add them as an attendee first
    let attendeeRecord = eventAttendee;
    if (!isAttendee && isCreator) {
      attendeeRecord = await prisma.eventAttendee.create({
        data: {
          eventId,
          userId: session.user.id,
          rsvpStatus: "pending", // Will be updated below
        },
      });
    }

    const updatedAttendee = await prisma.eventAttendee.update({
      where: {
        id: attendeeRecord!.id,
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

    // Check if user is an attendee OR the event creator
    const [attendee, event] = await Promise.all([
      prisma.eventAttendee.findFirst({
        where: {
          eventId,
          userId: session.user.id,
        },
        select: {
          rsvpStatus: true,
          rsvpAt: true,
        },
      }),
      prisma.event.findUnique({
        where: { id: eventId },
        select: { createdBy: true },
      }),
    ]);

    // Allow access if user is either an attendee OR the event creator
    const isAttendee = !!attendee;
    const isCreator = event?.createdBy === session.user.id;

    if (!isAttendee && !isCreator) {
      return NextResponse.json(
        { error: "You are not invited to this event" },
        { status: 403 }
      );
    }

    // If user is creator but not an attendee, return default status
    if (!isAttendee && isCreator) {
      return NextResponse.json({
        rsvpStatus: "yes", // Creators automatically say yes
        rsvpAt: null,
      });
    }

    return NextResponse.json({
      rsvpStatus: attendee?.rsvpStatus,
      rsvpAt: attendee?.rsvpAt,
    });
  } catch (error) {
    console.error("Get RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to get RSVP status" },
      { status: 500 }
    );
  }
}
