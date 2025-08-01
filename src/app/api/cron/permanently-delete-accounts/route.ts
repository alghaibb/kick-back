import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find users whose grace period has expired
    const expiredUsers = await prisma.user.findMany({
      where: {
        deletedAt: { not: null },
        permanentlyDeletedAt: { not: null, lte: now },
      },
      include: {
        eventPhotos: true,
        groupMembers: {
          include: {
            group: true,
          },
        },
      },
    });

    if (expiredUsers.length === 0) {
      return NextResponse.json({
        message: "No accounts to permanently delete",
        deletedCount: 0,
      });
    }

    let deletedCount = 0;
    const imagesToDelete: string[] = [];

    for (const user of expiredUsers) {
      try {
        // Collect all images to delete
        if (user.image) {
          imagesToDelete.push(user.image);
        }

        // Collect event photos
        user.eventPhotos.forEach((photo) => {
          if (photo.imageUrl) {
            imagesToDelete.push(photo.imageUrl);
          }
        });

        // Collect group images
        user.groupMembers.forEach((member) => {
          if (member.group.image) {
            imagesToDelete.push(member.group.image);
          }
        });

        // Delete the user (this will cascade delete most related data)
        await prisma.user.delete({
          where: { id: user.id },
        });

        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete user ${user.id}:`, error);
      }
    }

    // Delete all collected images from Vercel Blob
    const deletePromises = imagesToDelete.map(async (imageUrl) => {
      try {
        await del(imageUrl);
      } catch (error) {
        console.error(`Failed to delete image ${imageUrl}:`, error);
      }
    });

    await Promise.allSettled(deletePromises);

    return NextResponse.json({
      message: `Successfully permanently deleted ${deletedCount} accounts`,
      deletedCount,
      imagesDeleted: imagesToDelete.length,
    });
  } catch (error) {
    console.error("Error in permanently delete accounts cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
