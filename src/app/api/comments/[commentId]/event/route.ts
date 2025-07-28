import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    const comment = await prisma.eventComment.findUnique({
      where: { id: commentId },
      select: { eventId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ eventId: comment.eventId });
  } catch (error) {
    console.error("Error fetching comment event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 