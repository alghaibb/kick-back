import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

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

    // Fetch groups the user owns
    const groupsOwned = await prisma.group.findMany({
      where: { createdBy: userId },
      include: {
        members: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch groups the user is a member of (but not owner)
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
    const formatGroup = (group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      image: group.image,
      createdBy: group.createdBy,
      members: group.members.map((member: any) => ({
        userId: member.userId,
        role: member.role,
        user: {
          id: member.user.id,
          firstName: member.user.firstName,
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