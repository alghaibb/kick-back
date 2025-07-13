import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { sendSMS } from "@/utils/sendSMS";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import { addDays, startOfDay, endOfDay, format, isWithinInterval, subMinutes, addMinutes } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

// Helper to check if current time is within ±2 minutes of reminder time
function isReminderDue(now: Date, reminderTime: string): boolean {
  const [hourStr, minuteStr] = reminderTime.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const reminder = new Date(now);
  reminder.setHours(hour, minute, 0, 0);

  return isWithinInterval(now, {
    start: subMinutes(reminder, 2),
    end: addMinutes(reminder, 2),
  });
}

async function handleReminderRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = addDays(new Date(), 1);
  const tomorrowStart = startOfDay(tomorrow);
  const tomorrowEnd = endOfDay(tomorrow);

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
              phoneNumber: true,
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
  let smsSent = 0;
  let errors = 0;

  for (const event of events) {
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
        phoneNumber: true,
      },
    });

    const creatorName = creatorInfo?.nickname || `${creatorInfo?.firstName || "Unknown"}${creatorInfo?.lastName ? ` ${creatorInfo.lastName}` : ""}`;
    const attendees = event.attendees.map((a) => ({
      firstName: a.user.firstName,
      lastName: a.user.lastName,
      nickname: a.user.nickname,
    }));

    // Notify Attendees
    for (const attendee of event.attendees) {
      const user = attendee.user;
      const timezone = user.timezone || "UTC";
      const now = toZonedTime(new Date(), timezone);

      if (user.reminderTime && isReminderDue(now, user.reminderTime)) {
        const eventDate = toZonedTime(event.date, timezone);
        const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a");
        const attendeeNames = attendees.map(a => a.nickname || a.firstName).join(", ");
        const smsBody = [
          `Event Reminder: ${event.name}`,
          `Date: ${formattedDate} (${timezone})`,
          event.location ? `Location: ${event.location}` : null,
          event.group?.name ? `Group: ${event.group.name}` : null,
          `Host: ${creatorName}`,
          attendeeNames ? `Attendees: ${attendeeNames}` : null,
          event.description ? `Details: ${event.description}` : null,
        ].filter(Boolean).join("\n");

        try {
          if (["email", "both"].includes(user.reminderType)) {
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
          }

          if (["sms", "both"].includes(user.reminderType) && user.phoneNumber) {
            const phone = formatToE164(user.phoneNumber);
            if (phone) {
              await sendSMS(phone, smsBody);
              smsSent++;
            } else {
              console.warn(`Invalid phone for user ${user.email}: ${user.phoneNumber}`);
              errors++;
            }
          }
        } catch (err) {
          console.error(`Failed to notify attendee ${user.email}`, err);
          errors++;
        }
      }
    }

    // Notify Creator
    if (creatorInfo?.reminderTime && isReminderDue(toZonedTime(new Date(), creatorInfo.timezone || "UTC"), creatorInfo.reminderTime)) {
      const timezone = creatorInfo.timezone || "UTC";
      const eventDate = toZonedTime(event.date, timezone);
      const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a");
      const attendeeNames = attendees.map(a => a.nickname || a.firstName).join(", ");
      const smsBody = [
        `Event Reminder: ${event.name}`,
        `Date: ${formattedDate} (${timezone})`,
        event.location ? `Location: ${event.location}` : null,
        event.group?.name ? `Group: ${event.group.name}` : null,
        `Host: ${creatorName}`,
        attendeeNames ? `Attendees: ${attendeeNames}` : null,
        event.description ? `Details: ${event.description}` : null,
      ].filter(Boolean).join("\n");

      try {
        if (["email", "both"].includes(creatorInfo.reminderType)) {
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
        }

        if (["sms", "both"].includes(creatorInfo.reminderType) && creatorInfo.phoneNumber) {
          const phone = formatToE164(creatorInfo.phoneNumber);
          if (phone) {
            await sendSMS(phone, smsBody);
            smsSent++;
          } else {
            console.warn(`Invalid creator phone: ${creatorInfo.phoneNumber}`);
            errors++;
          }
        }
      } catch (err) {
        console.error(`Failed to notify creator ${creatorInfo.email}`, err);
        errors++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: `✅ ${emailsSent} emails, ${smsSent} SMS sent, ${errors} errors`,
    eventsProcessed: events.length,
    emailsSent,
    smsSent,
    errors,
  });
}

export const POST = verifySignatureAppRouter(handleReminderRequest);
