import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { inviteId } = await params;

    const invite = await prisma.eventInvite.findFirst({
      where: {
        token: inviteId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: {
        event: true,
        inviter: {
          select: { firstName: true, email: true },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    const existingAttendee = await prisma.eventAttendee.findFirst({
      where: {
        eventId: invite.eventId,
        userId: session.user.id,
      },
    });

    if (existingAttendee) {
      // Mark invite as accepted even though user is already an attendee
      await prisma.eventInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });
      return NextResponse.json(
        { error: "You are already invited to this event" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventAttendee.create({
        data: {
          eventId: invite.eventId,
          userId: session.user.id,
          rsvpStatus: "pending",
        },
      });

      // Mark invite as accepted
      await tx.eventInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined "${invite.event.name}"!`,
      event: invite.event,
    });
  } catch (error) {
    console.error("Accept event invite error:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
} 