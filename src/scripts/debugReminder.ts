import "dotenv/config";
import prisma from "@/lib/prisma";
import {
  addDays,
  startOfDay,
  endOfDay,
  subMinutes,
  addMinutes,
} from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

async function debugReminderLogic() {
  console.log("🔍 DEBUG: Reminder Logic Analysis\n");

  // Get events for tomorrow/day after (same as main logic)
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const startDate = startOfDay(tomorrow);
  const endDate = endOfDay(dayAfter);

  console.log("📅 Date Range:");
  console.log("  Today:", today.toISOString());
  console.log("  Tomorrow start:", startDate.toISOString());
  console.log("  Day after end:", endDate.toISOString());

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
              reminderTime: true,
              timezone: true,
              reminderType: true,
            },
          },
        },
      },
    },
  });

  console.log(`\n📊 Found ${events.length} event(s)\n`);

  for (const event of events) {
    console.log(`📍 Event: "${event.name}"`);
    console.log(`   Date: ${event.date.toISOString()}`);
    console.log(`   Created by: ${event.createdBy}`);
    console.log(`   Attendees: ${event.attendees.length}`);

    // Get creator info
    const creator = await prisma.user.findUnique({
      where: { id: event.createdBy },
      select: {
        email: true,
        reminderTime: true,
        timezone: true,
        reminderType: true,
      },
    });

    if (creator) {
      console.log(`\n🧑‍💼 CREATOR ANALYSIS:`);
      console.log(`   Email: ${creator.email}`);
      console.log(`   Timezone: ${creator.timezone}`);
      console.log(`   Reminder time: ${creator.reminderTime}`);
      console.log(`   Reminder type: ${creator.reminderType}`);

      const userTimezone = creator.timezone || "UTC";
      const userNow = toZonedTime(new Date(), userTimezone);
      const userEventDate = toZonedTime(event.date, userTimezone);

      console.log(`\n⏰ TIME ANALYSIS:`);
      console.log(
        `   Current time (${userTimezone}): ${formatTz(userNow, "yyyy-MM-dd HH:mm:ss")}`
      );
      console.log(
        `   Event time (${userTimezone}): ${formatTz(userEventDate, "yyyy-MM-dd HH:mm:ss")}`
      );

      // Check if event is tomorrow
      const userTomorrowStart = startOfDay(addDays(userNow, 1));
      const userTomorrowEnd = endOfDay(addDays(userNow, 1));
      const isEventTomorrow =
        userEventDate >= userTomorrowStart && userEventDate <= userTomorrowEnd;

      console.log(
        `   Tomorrow starts: ${formatTz(userTomorrowStart, "yyyy-MM-dd HH:mm:ss")}`
      );
      console.log(
        `   Tomorrow ends: ${formatTz(userTomorrowEnd, "yyyy-MM-dd HH:mm:ss")}`
      );
      console.log(`   ✅ Is event tomorrow? ${isEventTomorrow}`);

      if (!isEventTomorrow) {
        if (userEventDate < userTomorrowStart) {
          console.log(`   ❌ Event is TODAY or PAST`);
        } else {
          console.log(`   ❌ Event is AFTER tomorrow`);
        }
      }

      // Check reminder time window
      if (creator.reminderTime) {
        const [reminderHour, reminderMinute] = creator.reminderTime
          .split(":")
          .map(Number);
        const reminderDateTime = new Date(userNow);
        reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);

        const windowStart = subMinutes(reminderDateTime, 1);
        const windowEnd = addMinutes(reminderDateTime, 1);
        const isInWindow = userNow >= windowStart && userNow <= windowEnd;

        console.log(`\n🕐 REMINDER WINDOW ANALYSIS:`);
        console.log(`   Reminder time: ${creator.reminderTime}`);
        console.log(`   Window start: ${formatTz(windowStart, "HH:mm:ss")}`);
        console.log(`   Window end: ${formatTz(windowEnd, "HH:mm:ss")}`);
        console.log(`   Current time: ${formatTz(userNow, "HH:mm:ss")}`);
        console.log(`   ✅ In reminder window? ${isInWindow}`);

        console.log(`\n🚀 WOULD SEND REMINDER?`);
        const wouldSend = isEventTomorrow && isInWindow;
        console.log(
          `   ${wouldSend ? "✅ YES" : "❌ NO"} - Event tomorrow: ${isEventTomorrow}, In window: ${isInWindow}`
        );
      }
    }

    // Check attendees
    if (event.attendees.length > 0) {
      console.log(`\n👥 ATTENDEES:`);
      for (const attendee of event.attendees) {
        console.log(
          `   - ${attendee.user.email} (${attendee.user.reminderTime})`
        );
      }
    }

    console.log(`\n${"=".repeat(50)}\n`);
  }

  await prisma.$disconnect();
}

debugReminderLogic().catch(console.error);
