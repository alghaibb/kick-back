import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";
import { sendGroupInviteEmail } from "@/utils/sendEmails";

const limiter = rateLimit({ interval: 3600000 }); // 1 hour

export async function POST(
  _request: Request,
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

    // Rate limiting for resend
    try {
      await limiter.check(5, 'email', session.user.id);
    } catch (error) {
      console.error("Rate limit error:", error);
      return NextResponse.json(
        { error: "Too many resend requests. Please try again later." },
        { status: 429 }
      );
    }

    const { inviteId } = await params;

    // Find and validate invite
    const invite = await prisma.groupInvite.findFirst({
      where: {
        id: inviteId,
        invitedBy: session.user.id,
        status: "pending"
      },
      include: {
        group: true,
        inviter: {
          select: { firstName: true, email: true }
        }
      }
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found or you don't have permission to resend it" },
        { status: 404 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Update expiry date to extend the invitation
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 7); // Extend by 7 days

    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: { expiresAt: newExpiryDate }
    });

    // Resend the email
    await sendGroupInviteEmail(
      invite.email,
      invite.inviter.firstName,
      invite.group.name,
      invite.token
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend invite error:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
} 