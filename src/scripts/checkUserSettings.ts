import "dotenv/config";
import prisma from "@/lib/prisma";

async function checkReminderTime() {
  try {
    console.log("🔍 Checking current reminder time in database...");

    const user = await prisma.user.findUnique({
      where: {
        email: "halla.hkuku@gmail.com",
      },
      select: {
        email: true,
        reminderTime: true,
        reminderType: true,
        timezone: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    if (user) {
      console.log("👤 User details:");
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Phone Number: ${user.phoneNumber || "NOT SET"}`);
      console.log(`   Reminder Time: ${user.reminderTime}`);
      console.log(`   Reminder Type: ${user.reminderType}`);
      console.log(`   Timezone: ${user.timezone}`);

      // Parse the time to see what it actually is
      const timeStr = user.reminderTime;
      console.log(`\n⏰ Time Analysis:`);
      console.log(`   Raw reminder time string: "${timeStr}"`);

      if (timeStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        console.log(`   Parsed hours: ${hours}`);
        console.log(`   Parsed minutes: ${minutes}`);
        console.log(`   Is AM time? ${hours < 12}`);
        console.log(`   Is PM time? ${hours >= 12}`);

        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);

        console.log(
          `   Would trigger at: ${reminderTime.toLocaleTimeString()}`
        );
      }
    } else {
      console.log("❌ User not found");
    }
  } catch (error) {
    console.error("❌ Error checking reminder time:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReminderTime();
