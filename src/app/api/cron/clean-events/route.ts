import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();

  // Delete attendees for past events
  await prisma.eventAttendee.deleteMany({
    where: {
      event: {
        date: {
          lt: now,
        },
      },
    },
  });

  // Delete past events
  const deleted = await prisma.event.deleteMany({
    where: {
      date: {
        lt: now,
      },
    },
  });

  return NextResponse.json({ deleted: deleted.count });
}

// Add POST handler for Vercel cron jobs (Vercel sends POST requests to cron endpoints)
export async function POST(req: Request) {
  return GET(req);
}
