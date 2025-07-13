import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { sendSMS } from "@/utils/sendSMS";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

async function handleReminderRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("❌ Unauthorized QStash call.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🔐 Authorized cron job triggered.");

  const tomorrow = addDays(new Date(), 1);
  const tomorrowStart = startOfDay(tomorrow);
  const tomorrowEnd = endOfDay(tomorrow);

  console.log("📆 Checking events from", {
    from: tomorrowStart.toISOString(),
    to: tomorrowEnd.toISOString(),
  });

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

  console.log(`📊 Found ${events.length} event(s) for tomorrow.`);

  let emailsSent = 0;
  let smsSent = 0;
  let errors = 0;

  for (const event of events) {
    console.log(`📍 Event: "${event.name}" on ${event.date.toISOString()}`);

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

    const creatorName =
      creatorInfo?.nickname ||
      `${creatorInfo?.firstName || "Unknown"}${creatorInfo?.lastName ? ` ${creatorInfo.lastName}` : ""}`;

    const attendees = event.attendees.map((attendee) => ({
      firstName: attendee.user.firstName,
      lastName: attendee.user.lastName,
      nickname: attendee.user.nickname,
    }));

    for (const attendee of event.attendees) {
      const user = attendee.user;
      const userTimezone = user.timezone || "UTC";
      const now = new Date();
      const userNow = toZonedTime(now, userTimezone);
      const userCurrentTime = formatTz(userNow, "HH:mm");

      console.log(`👤 Checking ${user.email} | Timezone: ${userTimezone}`);
      console.log(`⏰ Now in user's time: ${userCurrentTime} | Reminder time: ${user.reminderTime}`);

      if (
        user.reminderTime === userCurrentTime &&
        (user.reminderType === "email" || user.reminderType === "both")
      ) {
        try {
          console.log(`📧 Sending reminder email to ${user.email}`);
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
          console.error(`❌ Email failed for ${user.email}:`, error);
          errors++;
        }
      }

      if (
        user.reminderTime === userCurrentTime &&
        (user.reminderType === "sms" || user.reminderType === "both") &&
        user.phoneNumber
      ) {
        try {
          const formattedPhone = formatToE164(user.phoneNumber);
          if (!formattedPhone) {
            console.warn(`⚠️ Invalid phone for ${user.email}: ${user.phoneNumber}`);
            errors++;
            continue;
          }

          const eventDateInUserTz = toZonedTime(event.date, userTimezone);
          const formattedDate = format(
            eventDateInUserTz,
            "EEEE, MMMM d, yyyy 'at' h:mm a"
          );

          const attendeeNames = attendees
            .map((a) => a.nickname || a.firstName)
            .join(", ");

          const smsBody = [
            `Event Reminder: ${event.name}`,
            `Date: ${formattedDate} (${userTimezone})`,
            event.location ? `Location: ${event.location}` : null,
            event.group?.name ? `Group: ${event.group.name}` : null,
            `Host: ${creatorName}`,
            attendeeNames ? `Attendees: ${attendeeNames}` : null,
            event.description ? `Details: ${event.description}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          console.log(`📱 Sending SMS to ${formattedPhone}`);
          await sendSMS(formattedPhone, smsBody);
          smsSent++;
        } catch (error) {
          console.error(`❌ SMS failed for ${user.phoneNumber}:`, error);
          errors++;
        }
      }
    }

    if (creatorInfo) {
      const creatorTimezone = creatorInfo.timezone || "UTC";
      const now = new Date();
      const creatorNow = toZonedTime(now, creatorTimezone);
      const creatorCurrentTime = formatTz(creatorNow, "HH:mm");

      console.log(`🧑‍💼 Creator: ${creatorInfo.email} | Time: ${creatorCurrentTime} | Reminder: ${creatorInfo.reminderTime}`);

      if (
        creatorInfo.reminderTime === creatorCurrentTime &&
        (creatorInfo.reminderType === "email" ||
          creatorInfo.reminderType === "both")
      ) {
        try {
          console.log(`📧 Sending email to creator ${creatorInfo.email}`);
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
          console.error(`❌ Creator email failed:`, error);
          errors++;
        }
      }

      if (
        creatorInfo.reminderTime === creatorCurrentTime &&
        (creatorInfo.reminderType === "sms" ||
          creatorInfo.reminderType === "both") &&
        creatorInfo.phoneNumber
      ) {
        try {
          const formattedPhone = formatToE164(creatorInfo.phoneNumber);
          if (!formattedPhone) {
            console.warn(`⚠️ Invalid creator phone: ${creatorInfo.phoneNumber}`);
            errors++;
            continue;
          }

          const eventDateInCreatorTz = toZonedTime(event.date, creatorTimezone);
          const formattedDate = format(
            eventDateInCreatorTz,
            "EEEE, MMMM d, yyyy 'at' h:mm a"
          );

          const attendeeNames = attendees
            .map((a) => a.nickname || a.firstName)
            .join(", ");
          const smsBody = [
            `Event Reminder: ${event.name}`,
            `Date: ${formattedDate} (${creatorTimezone})`,
            event.location ? `Location: ${event.location}` : null,
            event.group?.name ? `Group: ${event.group.name}` : null,
            `Host: ${creatorName}`,
            attendeeNames ? `Attendees: ${attendeeNames}` : null,
            event.description ? `Details: ${event.description}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          console.log(`📱 Sending SMS to creator ${formattedPhone}`);
          await sendSMS(formattedPhone, smsBody);
          smsSent++;
        } catch (error) {
          console.error(`❌ Creator SMS failed:`, error);
          errors++;
        }
      }
    }
  }

  console.log(`✅ Done. Emails: ${emailsSent} | SMS: ${smsSent} | Errors: ${errors}`);

  return NextResponse.json({
    success: true,
    message: `Event reminders sent: ${emailsSent} emails, ${smsSent} SMS, ${errors} errors`,
    eventsProcessed: events.length,
    emailsSent,
    smsSent,
    errors,
  });
}

export const POST = verifySignatureAppRouter(handleReminderRequest);
