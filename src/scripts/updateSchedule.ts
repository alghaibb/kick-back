import "dotenv/config";
import { env } from "@/lib/env";
import { Client } from "@upstash/qstash";

const client = new Client({
  token: env.QSTASH_TOKEN,
});

async function updateReminderSchedule() {
  try {
    // Try to delete the old schedule if it exists
    try {
      await client.schedules.delete("reminders-every-5-min");
      console.log("🗑️ Deleted old 5-minute schedule");
    } catch (error) {
      console.log("ℹ️ Old 5-minute schedule doesn't exist or already deleted");
    }

    // Try to delete existing 1-minute schedule to avoid conflicts
    try {
      await client.schedules.delete("reminders-every-minute");
      console.log("🗑️ Deleted existing 1-minute schedule");
    } catch (error) {
      console.log("ℹ️ 1-minute schedule doesn't exist");
    }

    // Create new schedule
    const result = await client.schedules.create({
      destination: `${env.NEXT_PUBLIC_BASE_URL}/api/cron/send-event-reminders`,
      scheduleId: "reminders-every-minute",
      cron: "* * * * *", // every minute (UTC)
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });

    console.log("✅ New reminder schedule created:", result);
  } catch (error) {
    console.error("❌ Error updating schedule:", error);
  }
}

updateReminderSchedule();
