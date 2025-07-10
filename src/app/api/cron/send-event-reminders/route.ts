import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tomorrow's date range
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    // Find events happening tomorrow
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                nickname: true,
                reminderType: true,
                reminderTime: true,
                timezone: true,
              },
            },
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });

    let emailsSent = 0;
    let errors = 0;

    for (const event of events) {
      // Get event creator's info
      const creatorInfo = await prisma.user.findUnique({
        where: { id: event.createdBy },
        select: {
          firstName: true,
          lastName: true,
          nickname: true,
          email: true,
          reminderType: true,
          reminderTime: true,
          timezone: true,
        },
      });

      const creatorName = creatorInfo?.nickname ||
        `${creatorInfo?.firstName || "Unknown"}${creatorInfo?.lastName ? ` ${creatorInfo.lastName}` : ""}`;

      // Get all attendees for the event
      const attendees = event.attendees.map((attendee) => ({
        firstName: attendee.user.firstName,
        lastName: attendee.user.lastName,
        nickname: attendee.user.nickname,
      }));

      // Send reminder emails to attendees who prefer email or both, at their local time
      for (const attendee of event.attendees) {
        const user = attendee.user;
        const userTimezone = user.timezone || "UTC";
        const now = new Date();
        const userNow = toZonedTime(now, userTimezone);
        const userCurrentTime = formatTz(userNow, "HH:mm");

        if (
          user.reminderTime === userCurrentTime &&
          (user.reminderType === "email" || user.reminderType === "both")
        ) {
          try {
            await sendEventReminderEmail(
              user.email,
              event.name,
              event.description,
              event.date,
              event.location,
              creatorName,
              attendees
            );
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send reminder email to ${user.email}:`, error);
            errors++;
          }
        }
      }

      // Also send reminder to event creator if it's their local reminder time
      if (creatorInfo) {
        const creatorTimezone = creatorInfo.timezone || "UTC";
        const now = new Date();
        const creatorNow = toZonedTime(now, creatorTimezone);
        const creatorCurrentTime = formatTz(creatorNow, "HH:mm");

        if (
          creatorInfo.reminderTime === creatorCurrentTime &&
          (creatorInfo.reminderType === "email" || creatorInfo.reminderType === "both")
        ) {
          try {
            await sendEventReminderEmail(
              creatorInfo.email,
              event.name,
              event.description,
              event.date,
              event.location,
              creatorName,
              attendees
            );
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send reminder email to creator ${creatorInfo.email}:`, error);
            errors++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event reminders sent: ${emailsSent} emails, ${errors} errors`,
      eventsProcessed: events.length,
      emailsSent,
      errors,
    });
  } catch (error) {
    console.error("Error sending event reminders:", error);
    return NextResponse.json(
      { error: "Failed to send event reminders" },
      { status: 500 }
    );
  }
} 