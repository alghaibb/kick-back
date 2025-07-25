import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { detectCountryForSMS } from "@/utils/detectCountry";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { sendSMS } from "@/utils/sendSMS";
import {
  addDays,
  addMinutes,
  endOfDay,
  format,
  startOfDay,
  subMinutes,
} from "date-fns";
import { format as formatTz, fromZonedTime, toZonedTime } from "date-fns-tz";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Check if this is a Vercel cron job (has upstash headers)
  const isVercelCron = request.headers.get("upstash-signature");
  const authHeader = request.headers.get("authorization");

  // Allow either Vercel cron (upstash-signature) or manual trigger with CRON_SECRET
  if (!isVercelCron && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.log("❌ Authorization failed - neither Vercel cron nor valid CRON_SECRET");
    console.log("Has upstash signature:", !!isVercelCron);
    console.log("Auth header:", authHeader);
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  console.log("🔐 Cron job triggered", isVercelCron ? "(Vercel)" : "(Manual)");

  // Get events for the next 2 days to account for timezone differences
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const startDate = startOfDay(tomorrow);
  const endDate = endOfDay(dayAfter);

  console.log(`🕐 Current server time: ${new Date().toISOString()}`);
  console.log(`📅 Today: ${format(today, "yyyy-MM-dd")}`);
  console.log(`📅 Tomorrow: ${format(tomorrow, "yyyy-MM-dd")}`);
  console.log(`📅 Day after: ${format(dayAfter, "yyyy-MM-dd")}`);

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
  // Expanded to 15-minute window since cron runs every 15 minutes
  const isWithinReminderWindow = (
    userTime: Date,
    reminderTime: string
  ): boolean => {
    // Parse reminder time
    const [reminderHour, reminderMinute] = reminderTime.split(":").map(Number);

    // Create reminder time for today
    const reminderDateTime = new Date(userTime);
    reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);

    // Create a narrow 3-minute window around the reminder time (2min before, 1min after)
    const windowStart = subMinutes(reminderDateTime, 2);
    const windowEnd = addMinutes(reminderDateTime, 1);

    const isInWindow = userTime >= windowStart && userTime <= windowEnd;

    if (isInWindow) {
      console.log(
        `⏰ Within reminder window: ${formatTz(userTime, "HH:mm:ss", { timeZone: "UTC" })} vs ${reminderTime} (±1-2min)`
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
    console.log(`📊 Event has ${event.attendees.length} attendees`);

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

      // 🚨 NEW: Only send reminders to confirmed attendees
      if (attendee.rsvpStatus !== 'yes') {
        console.log(`⏭️ Skipping ${user.email} - RSVP status: ${attendee.rsvpStatus}`);
        continue;
      }

      const userTimezone = user.timezone || "UTC";
      const userNow = toZonedTime(new Date(), userTimezone);

      console.log(`👤 Checking ${user.email} | Timezone: ${userTimezone} | RSVP: ${attendee.rsvpStatus}`);
      console.log(
        `⏰ User time: ${formatTz(userNow, "HH:mm", { timeZone: userTimezone })} | Reminder time: ${user.reminderTime}`
      );

      // Check if event is tomorrow in user's timezone and if it's within reminder window
      if (!isEventTomorrow(event.date, userTimezone)) {
        console.log(`⏭️ Event not tomorrow for ${user.email}, skipping`);
        console.log(`   📅 Event date in user TZ: ${formatTz(toZonedTime(event.date, userTimezone), "yyyy-MM-dd HH:mm", { timeZone: userTimezone })}`);
        console.log(`   📅 Tomorrow range: ${formatTz(startOfDay(addDays(userNow, 1)), "yyyy-MM-dd", { timeZone: userTimezone })} to ${formatTz(endOfDay(addDays(userNow, 1)), "yyyy-MM-dd", { timeZone: userTimezone })}`);
        continue;
      }

      if (!isWithinReminderWindow(userNow, user.reminderTime)) {
        console.log(`⏰ Not within reminder window for ${user.email}`);
        console.log(`   ⏰ Current user time: ${formatTz(userNow, "HH:mm:ss", { timeZone: userTimezone })}`);
        console.log(`   ⏰ Reminder time: ${user.reminderTime}`);

        // Calculate and show the next reminder window
        const [reminderHour, reminderMinute] = user.reminderTime.split(":").map(Number);
        const reminderDateTime = new Date(userNow);
        reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);
        const windowStart = subMinutes(reminderDateTime, 2);
        const windowEnd = addMinutes(reminderDateTime, 3);
        console.log(`   ⏰ Window: ${formatTz(windowStart, "HH:mm:ss", { timeZone: userTimezone })} to ${formatTz(windowEnd, "HH:mm:ss", { timeZone: userTimezone })}`);
        continue;
      }

      // Check if reminder was already sent today to prevent duplicates
      // Convert user's "today" to UTC for proper comparison with lastReminderSent (which is in UTC)
      const todayInUserTz = startOfDay(userNow);
      const todayStartUTC = fromZonedTime(todayInUserTz, userTimezone);

      if (attendee.lastReminderSent && attendee.lastReminderSent >= todayStartUTC) {
        console.log(`✅ Reminder already sent today for ${user.email}`);
        console.log(`   📅 Last sent: ${attendee.lastReminderSent.toISOString()}`);
        console.log(`   📅 Today starts (UTC): ${todayStartUTC.toISOString()}`);
        console.log(`   📅 Today starts (${userTimezone}): ${formatTz(todayInUserTz, "yyyy-MM-dd HH:mm:ss", { timeZone: userTimezone })}`);
        continue;
      }

      console.log(`🚀 PROCEEDING TO SEND REMINDER to ${user.email}`);
      console.log(`   📧 Reminder type: ${user.reminderType}`);
      console.log(`   📱 Phone number: ${user.phoneNumber || 'N/A'}`);

      let reminderSent = false;

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
          reminderSent = true;
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
          const country = detectCountryForSMS(user.phoneNumber, user.timezone);
          const formattedPhone = formatToE164(user.phoneNumber, country);
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
          await sendSMS(formattedPhone, smsBody, {
            timezone: userTimezone,
            fallbackCountry: "AU"
          });
          smsSent++;
          reminderSent = true;
        } catch (error) {
          console.error(`❌ SMS failed for ${user.phoneNumber}:`, error);
          errors++;
        }
      }

      // Update lastReminderSent timestamp once if any reminder was sent successfully
      if (reminderSent) {
        try {
          await prisma.eventAttendee.update({
            where: { id: attendee.id },
            data: { lastReminderSent: new Date() },
          });
          console.log(`✅ Updated lastReminderSent timestamp for ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to update lastReminderSent for ${user.email}:`, error);
        }
      }
    }

    if (creatorInfo) {
      const creatorTimezone = creatorInfo.timezone || "UTC";
      const creatorNow = toZonedTime(new Date(), creatorTimezone);

      console.log(
        `🧑‍💼 Creator: ${creatorInfo.email} | Time: ${formatTz(creatorNow, "HH:mm", { timeZone: creatorTimezone })} | Reminder: ${creatorInfo.reminderTime}`
      );
      console.log(`🧑‍💼 Creator timezone: ${creatorTimezone} | Reminder type: ${creatorInfo.reminderType}`);

      // Check if event is tomorrow in creator's timezone and if it's within reminder window
      if (!isEventTomorrow(event.date, creatorTimezone)) {
        console.log(
          `⏭️ Event not tomorrow for creator ${creatorInfo.email}, skipping`
        );
        console.log(`   📅 Event date in creator TZ: ${formatTz(toZonedTime(event.date, creatorTimezone), "yyyy-MM-dd HH:mm", { timeZone: creatorTimezone })}`);
        console.log(`   📅 Tomorrow range: ${formatTz(startOfDay(addDays(creatorNow, 1)), "yyyy-MM-dd", { timeZone: creatorTimezone })} to ${formatTz(endOfDay(addDays(creatorNow, 1)), "yyyy-MM-dd", { timeZone: creatorTimezone })}`);
      } else if (isWithinReminderWindow(creatorNow, creatorInfo.reminderTime)) {

        // Check if creator already received reminder today (DUPLICATE PROTECTION)
        const todayInCreatorTz = startOfDay(creatorNow);
        const todayStartUTC = fromZonedTime(todayInCreatorTz, creatorTimezone);

        // Check if creator is also an attendee and their RSVP status
        const creatorAsAttendee = event.attendees.find(attendee => attendee.user.email === creatorInfo.email);

        // NEW: Only send creator reminders if they confirmed attendance
        if (creatorAsAttendee && creatorAsAttendee.rsvpStatus !== 'yes') {
          console.log(`⏭️ Skipping creator ${creatorInfo.email} - RSVP status: ${creatorAsAttendee.rsvpStatus}`);
        } else if (creatorAsAttendee?.lastReminderSent && creatorAsAttendee.lastReminderSent >= todayStartUTC) {
          console.log(`✅ Creator reminder already sent today as attendee for ${creatorInfo.email}`);
          console.log(`   📅 Last sent: ${creatorAsAttendee.lastReminderSent.toISOString()}`);
        } else {
          console.log(`🚀 PROCEEDING TO SEND REMINDER to creator ${creatorInfo.email}`);

          // Add a flag to track if reminder was sent for this creator
          let creatorReminderSent = false;

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
              creatorReminderSent = true;
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
              const country = detectCountryForSMS(creatorInfo.phoneNumber, creatorInfo.timezone);
              const formattedPhone = formatToE164(creatorInfo.phoneNumber, country);
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
                await sendSMS(formattedPhone, smsBody, {
                  timezone: creatorTimezone,
                  fallbackCountry: "AU"
                });
                smsSent++;
                creatorReminderSent = true;
              }
            } catch (error) {
              console.error(`❌ Creator SMS failed:`, error);
              errors++;
            }
          }

          // If creator got a reminder as attendee, update their attendee record
          if (creatorAsAttendee && creatorReminderSent) {
            try {
              await prisma.eventAttendee.update({
                where: { id: creatorAsAttendee.id },
                data: { lastReminderSent: new Date() },
              });
              console.log(`✅ Updated lastReminderSent timestamp for creator as attendee ${creatorInfo.email}`);
            } catch (error) {
              console.error(`❌ Failed to update lastReminderSent for creator as attendee ${creatorInfo.email}:`, error);
            }
          }
        }
      } else {
        console.log(`⏰ Creator not within reminder window`);
        console.log(`   ⏰ Current creator time: ${formatTz(creatorNow, "HH:mm:ss", { timeZone: creatorTimezone })}`);
        console.log(`   ⏰ Reminder time: ${creatorInfo.reminderTime}`);

        // Calculate and show the next reminder window
        const [reminderHour, reminderMinute] = creatorInfo.reminderTime.split(":").map(Number);
        const reminderDateTime = new Date(creatorNow);
        reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);
        const windowStart = subMinutes(reminderDateTime, 2);
        const windowEnd = addMinutes(reminderDateTime, 3);
        console.log(`   ⏰ Window: ${formatTz(windowStart, "HH:mm:ss", { timeZone: creatorTimezone })} to ${formatTz(windowEnd, "HH:mm:ss", { timeZone: creatorTimezone })}`);
      }
    } else {
      console.log(`❌ No creator info found for event ${event.name}`);
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

// Add POST handler for Vercel cron jobs (Vercel sends POST requests to cron endpoints)
export async function POST(request: Request) {
  return GET(request);
}
