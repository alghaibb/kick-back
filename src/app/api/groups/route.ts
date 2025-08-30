import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

// Type for formatted member
interface FormattedMember {
  userId: string;
  role: string;
  user: {
    id: string;
    firstName: string | null;
    nickname: string | null;
    email: string;
    image: string | null;
  };
}

// Type for formatted group
interface FormattedGroup {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdBy: string;
  members: FormattedMember[];
}

// Type for group with members from Prisma query
interface GroupWithMembers {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdBy: string;
  members: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      firstName: string | null;
      nickname: string | null;
      email: string;
      image: string | null;
    };
  }>;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const groupsOwned = await prisma.group.findMany({
      where: { createdBy: userId },
      include: {
        members: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const groupsIn = await prisma.group.findMany({
      where: {
        members: { some: { userId } },
        NOT: { createdBy: userId },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the data for client consumption
    const formatGroup = (group: GroupWithMembers): FormattedGroup => ({
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.image,
      createdBy: group.createdBy,
      members: group.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        user: {
          id: member.user.id,
          firstName: member.user.firstName,
          nickname: member.user.nickname,
          email: member.user.email,
          image: member.user.image,
        },
      })),
    });

    return NextResponse.json({
      groupsOwned: groupsOwned.map(formatGroup),
      groupsIn: groupsIn.map(formatGroup),
      currentUser: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        nickname: session.user.nickname,
        lastName: session.user.lastName,
        image: session.user.image,
      },
    });
  } catch (error) {
    console.error("Groups API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
} 