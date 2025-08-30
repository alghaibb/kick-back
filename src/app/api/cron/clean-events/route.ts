import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const isVercelCron = req.headers.get("upstash-signature");
  const authHeader = req.headers.get("Authorization");

  // Allow either Vercel cron (upstash-signature) or manual trigger with CRON_SECRET
  if (!isVercelCron && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();

  await prisma.eventAttendee.deleteMany({
    where: {
      event: {
        date: {
          lt: now,
        },
      },
    },
  });

  const deleted = await prisma.event.deleteMany({
    where: {
      date: {
        lt: now,
      },
    },
  });

  return NextResponse.json({ deleted: deleted.count });
}

export async function POST(req: Request) {
  return GET(req);
}
