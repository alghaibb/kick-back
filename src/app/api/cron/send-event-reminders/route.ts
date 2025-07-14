import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { sendSMS } from "@/utils/sendSMS";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import {
  addDays,
  startOfDay,
  endOfDay,
  format,
  subMinutes,
  addMinutes,
} from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export async function GET() {
  console.log("🔐 Vercel Cron job triggered for event reminders");

  // Get events for the next 2 days to account for timezone differences
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const startDate = startOfDay(tomorrow);
  const endDate = endOfDay(dayAfter);

  console.log("📆 Checking events from", {
    from: startDate.toISOString(),
    to: endDate.toISOString(),
  });

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
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

  console.log(`📊 Found ${events.length} event(s) for the next 2 days.`);

  let emailsSent = 0;
  let smsSent = 0;
  let errors = 0;

  // Helper function to check if current time is within reminder window
  // Expanded to 5-minute window since cron runs every 5 minutes
  const isWithinReminderWindow = (
    userTime: Date,
    reminderTime: string
  ): boolean => {
    // Parse reminder time
    const [reminderHour, reminderMinute] = reminderTime.split(":").map(Number);

    // Create reminder time for today
    const reminderDateTime = new Date(userTime);
    reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);

    // Create a 5-minute window around the reminder time to account for cron frequency
    const windowStart = subMinutes(reminderDateTime, 2);
    const windowEnd = addMinutes(reminderDateTime, 3);

    const isInWindow = userTime >= windowStart && userTime <= windowEnd;

    if (isInWindow) {
      console.log(
        `⏰ Within reminder window: ${formatTz(userTime, "HH:mm:ss", { timeZone: "UTC" })} vs ${reminderTime} (±2-3min)`
      );
    }

    return isInWindow;
  };

  // Helper function to check if event is tomorrow in user's timezone
  const isEventTomorrow = (eventDate: Date, userTimezone: string): boolean => {
    const userNow = toZonedTime(new Date(), userTimezone);
    const userEventDate = toZonedTime(eventDate, userTimezone);
    const userTomorrowStart = startOfDay(addDays(userNow, 1));
    const userTomorrowEnd = endOfDay(addDays(userNow, 1));

    return (
      userEventDate >= userTomorrowStart && userEventDate <= userTomorrowEnd
    );
  };

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
      const userNow = toZonedTime(new Date(), userTimezone);

      console.log(`👤 Checking ${user.email} | Timezone: ${userTimezone}`);
      console.log(
        `⏰ User time: ${formatTz(userNow, "HH:mm", { timeZone: userTimezone })} | Reminder time: ${user.reminderTime}`
      );

      // Check if event is tomorrow in user's timezone and if it's within reminder window
      if (!isEventTomorrow(event.date, userTimezone)) {
        console.log(`⏭️ Event not tomorrow for ${user.email}, skipping`);
        continue;
      }

      if (!isWithinReminderWindow(userNow, user.reminderTime)) {
        console.log(`⏰ Not within reminder window for ${user.email}`);
        continue;
      }

      // Check if reminder was already sent today to prevent duplicates
      const today = startOfDay(userNow);
      if (attendee.lastReminderSent && attendee.lastReminderSent >= today) {
        console.log(`✅ Reminder already sent today for ${user.email}`);
        continue;
      }

      if (user.reminderType === "email" || user.reminderType === "both") {
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

          // Update lastReminderSent timestamp
          await prisma.eventAttendee.update({
            where: { id: attendee.id },
            data: { lastReminderSent: new Date() },
          });
        } catch (error) {
          console.error(`❌ Email failed for ${user.email}:`, error);
          errors++;
        }
      }

      if (
        (user.reminderType === "sms" || user.reminderType === "both") &&
        user.phoneNumber
      ) {
        try {
          const formattedPhone = formatToE164(user.phoneNumber);
          if (!formattedPhone) {
            console.warn(
              `⚠️ Invalid phone for ${user.email}: ${user.phoneNumber}`
            );
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

          // Update lastReminderSent timestamp if not already updated by email
          if (user.reminderType === "sms") {
            await prisma.eventAttendee.update({
              where: { id: attendee.id },
              data: { lastReminderSent: new Date() },
            });
          }
        } catch (error) {
          console.error(`❌ SMS failed for ${user.phoneNumber}:`, error);
          errors++;
        }
      }
    }

    if (creatorInfo) {
      const creatorTimezone = creatorInfo.timezone || "UTC";
      const creatorNow = toZonedTime(new Date(), creatorTimezone);

      console.log(
        `🧑‍💼 Creator: ${creatorInfo.email} | Time: ${formatTz(creatorNow, "HH:mm", { timeZone: creatorTimezone })} | Reminder: ${creatorInfo.reminderTime}`
      );

      // Check if event is tomorrow in creator's timezone and if it's within reminder window
      if (!isEventTomorrow(event.date, creatorTimezone)) {
        console.log(
          `⏭️ Event not tomorrow for creator ${creatorInfo.email}, skipping`
        );
      } else if (isWithinReminderWindow(creatorNow, creatorInfo.reminderTime)) {
        if (
          creatorInfo.reminderType === "email" ||
          creatorInfo.reminderType === "both"
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
          (creatorInfo.reminderType === "sms" ||
            creatorInfo.reminderType === "both") &&
          creatorInfo.phoneNumber
        ) {
          try {
            const formattedPhone = formatToE164(creatorInfo.phoneNumber);
            if (!formattedPhone) {
              console.warn(
                `⚠️ Invalid creator phone: ${creatorInfo.phoneNumber}`
              );
              errors++;
            } else {
              const eventDateInCreatorTz = toZonedTime(
                event.date,
                creatorTimezone
              );
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
            }
          } catch (error) {
            console.error(`❌ Creator SMS failed:`, error);
            errors++;
          }
        }
      }
    }
  }

  console.log(
    `✅ Done. Emails: ${emailsSent} | SMS: ${smsSent} | Errors: ${errors}`
  );

  return NextResponse.json({
    success: true,
    message: `Event reminders sent: ${emailsSent} emails, ${smsSent} SMS, ${errors} errors`,
    eventsProcessed: events.length,
    emailsSent,
    smsSent,
    errors,
  });
}
