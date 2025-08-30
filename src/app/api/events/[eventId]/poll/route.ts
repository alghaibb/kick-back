import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isHost = event.createdBy === session.user.id;
    const isAttendee = event.attendees.length > 0;
    if (!isHost && !isAttendee) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const poll = await prisma.eventPoll.findFirst({
      where: { eventId, status: "open" },
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    image: true,
                    firstName: true,
                    nickname: true,
                  },
                },
              },
              select: undefined,
            },
          },
          orderBy: [{ votes: { _count: "desc" } }, { createdAt: "asc" }],
        },
        votes: {
          where: { userId: session.user.id },
          select: { optionId: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    const myVoteOptionId = poll.votes[0]?.optionId;
    const options = poll.options.map((o) => {
      const yesVotes = o.votes.filter((v) => v.voteType === "yes");
      const noVotes = o.votes.filter((v) => v.voteType === "no");
      const myYes = yesVotes.some((v) => v.user.id === session.user.id);
      const myNo = noVotes.some((v) => v.user.id === session.user.id);
      return {
        id: o.id,
        label: o.label,
        addressFormatted: o.addressFormatted,
        latitude: o.latitude ?? undefined,
        longitude: o.longitude ?? undefined,
        votes: yesVotes.length,
        votedByMe: myYes,
        myYes,
        myNo,
        voters: yesVotes.map((v) => ({
          user: {
            id: v.user.id,
            image: v.user.image ?? undefined,
            nickname: v.user.nickname ?? undefined,
            firstName: v.user.firstName ?? undefined,
          },
        })),
        noVoters: noVotes.map((v) => ({
          user: {
            id: v.user.id,
            image: v.user.image ?? undefined,
            nickname: v.user.nickname ?? undefined,
            firstName: v.user.firstName ?? undefined,
          },
        })),
      };
    });

    const totalYesVotes = options.reduce((acc, o) => acc + o.votes, 0);
    return NextResponse.json({
      poll: {
        id: poll.id,
        status: poll.status,
        createdAt: poll.createdAt.toISOString(),
        options,
        myVoteOptionId,
        isHost,
        hasEventLocation: !!event.location,
        totalYesVotes,
      },
    });
  } catch (error) {
    console.error("Get event poll API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event poll" },
      { status: 500 }
    );
  }
}

