import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email (including deleted users)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          canRecover: false,
          message: "No account found with this email address",
        },
        { status: 404 }
      );
    }

    // Check if user is deleted
    if (!user.deletedAt) {
      return NextResponse.json(
        {
          canRecover: false,
          message: "This account is not deleted",
        },
        { status: 400 }
      );
    }

    // Check if grace period has expired
    if (user.permanentlyDeletedAt && new Date() > user.permanentlyDeletedAt) {
      return NextResponse.json(
        {
          canRecover: false,
          message:
            "Account recovery period has expired. Please contact support.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      canRecover: true,
      message: "Account can be recovered",
    });
  } catch (error) {
    console.error("Check deleted account error:", error);
    return NextResponse.json(
      { error: "Failed to check account" },
      { status: 500 }
    );
  }
}
