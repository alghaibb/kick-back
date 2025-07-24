import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

    const { inviteId } = await params;

    // Check if user has permission to cancel this invite
    const invite = await prisma.groupInvite.findFirst({
      where: {
        id: inviteId,
        invitedBy: session.user.id,
        status: "pending"
      }
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found or you don't have permission to cancel it" },
        { status: 404 }
      );
    }

    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: { status: "cancelled" }
    });

    revalidatePath("/groups");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel invite error:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
} 