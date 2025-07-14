import { getGroupInvites } from "@/lib/group-invites";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const invites = await getGroupInvites(groupId);
    return NextResponse.json({ success: true, invites });
  } catch (error) {
    console.error("Error fetching group invites:", error);

    if (error instanceof Error) {
      if (error.message === "Not authenticated") {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }
      if (error.message === "Not authorized to view group invites") {
        return NextResponse.json(
          { error: "Not authorized to view group invites" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch group invites" },
      { status: 500 }
    );
  }
}
