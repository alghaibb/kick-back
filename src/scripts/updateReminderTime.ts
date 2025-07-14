import "dotenv/config";
import prisma from "@/lib/prisma";

async function updateReminderTime() {
  try {
    console.log("📝 Updating reminder time to 12:20...");

    // Update your user's reminder time
    const result = await prisma.user.update({
      where: {
        email: "halla.hkuku@gmail.com",
      },
      data: {
        reminderTime: "12:20",
      },
    });

    console.log("✅ Updated reminder time:", result.reminderTime);
  } catch (error) {
    console.error("❌ Error updating reminder time:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReminderTime();
