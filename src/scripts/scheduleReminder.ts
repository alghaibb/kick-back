import "dotenv/config";
import { env } from "@/lib/env";
import { Client } from "@upstash/qstash";

const client = new Client({
  token: env.QSTASH_TOKEN,
});

async function scheduleReminderJob() {
  const result = await client.schedules.create({
    destination: `${env.NEXT_PUBLIC_BASE_URL}/api/cron/send-event-reminders`,
    scheduleId: "reminders-every-5-min",
    cron: "*/5 * * * *", // every 5 minutes (UTC)
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET}`,
    },
  });

  console.log("✅ Reminder schedule created:", result);
}

scheduleReminderJob();
