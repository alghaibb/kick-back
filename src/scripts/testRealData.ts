import "dotenv/config";
import prisma from "@/lib/prisma";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { addDays, startOfDay, endOfDay } from "date-fns";

/**
 * Test script to verify the reminder system with actual database data
 * This simulates what the cron job will do
 */

async function testWithRealData() {
  console.log("🔍 Testing Reminder System with Real Database Data\n");

  try {
    // Get events for the next 2 days (same logic as the cron job)
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const dayAfter = addDays(today, 2);
    const startDate = startOfDay(tomorrow);
    const endDate = endOfDay(dayAfter);

    console.log("📅 Checking events from:", {
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

    console.log(`📊 Found ${events.length} event(s) for tomorrow/day after\n`);

    if (events.length === 0) {
      console.log(
        "💡 No events found. Create some test events to see the reminder logic in action."
      );
      return;
    }

    // Helper function to check if current time is within reminder window
    const isWithinReminderWindow = (
      userTime: Date,
      reminderTime: string
    ): boolean => {
      const [reminderHour, reminderMinute] = reminderTime
        .split(":")
        .map(Number);
      const reminderDateTime = new Date(userTime);
      reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);

      const windowStart = new Date(reminderDateTime.getTime() - 60000); // -1 minute
      const windowEnd = new Date(reminderDateTime.getTime() + 60000); // +1 minute

      return userTime >= windowStart && userTime <= windowEnd;
    };

    // Helper function to check if event is tomorrow in user's timezone
    const isEventTomorrow = (
      eventDate: Date,
      userTimezone: string
    ): boolean => {
      const userNow = toZonedTime(new Date(), userTimezone);
      const userEventDate = toZonedTime(eventDate, userTimezone);
      const userTomorrowStart = startOfDay(addDays(userNow, 1));
      const userTomorrowEnd = endOfDay(addDays(userNow, 1));

      return (
        userEventDate >= userTomorrowStart && userEventDate <= userTomorrowEnd
      );
    };

    let potentialReminders = 0;
    let alreadySent = 0;
    let wrongTiming = 0;
    let notTomorrow = 0;

    for (const event of events) {
      console.log(`📍 Event: "${event.name}" on ${event.date.toISOString()}`);

      for (const attendee of event.attendees) {
        const user = attendee.user;
        const userTimezone = user.timezone || "UTC";
        const userNow = toZonedTime(new Date(), userTimezone);

        console.log(
          `  👤 ${user.email} (${user.reminderTime} in ${userTimezone})`
        );

        // Check if event is tomorrow in user's timezone
        if (!isEventTomorrow(event.date, userTimezone)) {
          console.log(`    ⏭️ Event not tomorrow for this user`);
          notTomorrow++;
          continue;
        }

        // Check if reminder was already sent today
        const today = startOfDay(userNow);
        if (attendee.lastReminderSent && attendee.lastReminderSent >= today) {
          console.log(`    ✅ Reminder already sent today`);
          alreadySent++;
          continue;
        }

        // Check if it's within reminder window
        if (!isWithinReminderWindow(userNow, user.reminderTime)) {
          console.log(
            `    ⏰ Not within reminder window (current: ${formatTz(userNow, "HH:mm")})`
          );
          wrongTiming++;
          continue;
        }

        console.log(`    🎯 WOULD SEND REMINDER! (${user.reminderType})`);
        potentialReminders++;
      }
      console.log();
    }

    console.log("📈 Summary:");
    console.log(`  🎯 Would send reminders: ${potentialReminders}`);
    console.log(`  ✅ Already sent today: ${alreadySent}`);
    console.log(`  ⏰ Wrong timing: ${wrongTiming}`);
    console.log(`  📅 Not tomorrow: ${notTomorrow}`);

    if (potentialReminders === 0 && events.length > 0) {
      console.log("\n💡 Tips to test reminders:");
      console.log("  1. Set a user's reminderTime to current time ± 1 minute");
      console.log(
        "  2. Ensure events are scheduled for tomorrow in user's timezone"
      );
      console.log(
        "  3. Check that lastReminderSent is null or from a previous day"
      );
    }
  } catch (error) {
    console.error("❌ Error testing with real data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testWithRealData();
