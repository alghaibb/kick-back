import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Check if this is a Vercel cron job (has upstash headers)
  const isVercelCron = req.headers.get("upstash-signature");
  const authHeader = req.headers.get("Authorization");

  // Allow either Vercel cron (upstash-signature) or manual trigger with CRON_SECRET
  if (!isVercelCron && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.log("❌ Clean events cron - authorization failed");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("🧹 Clean events cron triggered", isVercelCron ? "(Vercel)" : "(Manual)");

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
