import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find and validate invite without accepting it
    const invite = await prisma.groupInvite.findUnique({
      where: { token },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
          },
        },
        inviter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation has already been processed" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Return invite data for display
    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        groupId: invite.groupId,
        groupName: invite.group.name,
        groupDescription: invite.group.description,
        groupImage: invite.group.image,
        inviterName: invite.inviter.firstName || invite.inviter.email,
        email: invite.email,
      },
    });
  } catch (error) {
    console.error("Validate invite error:", error);
    return NextResponse.json(
      { error: "Failed to validate invitation" },
      { status: 500 }
    );
  }
}
