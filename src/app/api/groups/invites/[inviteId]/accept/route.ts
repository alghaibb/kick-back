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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { inviteId } = await params;

    // Find and validate invite
    const invite = await prisma.groupInvite.findUnique({
      where: { token: inviteId },
      include: {
        group: { select: { id: true, name: true } },
        inviter: { select: { firstName: true, email: true } },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation has already been used or cancelled" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    if (invite.email !== session.user.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      // Mark invite as accepted even though user is already a member
      await prisma.groupInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      );
    }

    // Add user to group and existing events
    await prisma.$transaction(async (tx) => {
      // Add user to group
      await tx.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId: session.user.id,
          role: "member",
        },
      });

      // Add user to all existing events in this group
      const groupEvents = await tx.event.findMany({
        where: {
          groupId: invite.groupId,
          date: { gte: new Date() }, // Only future events
        },
        select: { id: true },
      });

      if (groupEvents.length > 0) {
        await tx.eventAttendee.createMany({
          data: groupEvents.map((event) => ({
            eventId: event.id,
            userId: session.user.id,
            rsvpStatus: "pending",
          })),
          skipDuplicates: true,
        });
      }

      // Mark invite as accepted
      await tx.groupInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined "${invite.group.name}"!`,
      group: invite.group,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
