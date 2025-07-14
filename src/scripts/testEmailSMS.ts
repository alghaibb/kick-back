import "dotenv/config";
import { sendEventReminderEmail } from "@/utils/sendEmails";

// Test the email and SMS functions directly
async function testEmailAndSMS() {
  try {
    console.log("🧪 Testing email and SMS functions...");

    // Test email first
    console.log("📧 Testing email...");
    await sendEventReminderEmail(
      "halla.hkuku@gmail.com",
      "Test Event",
      "This is a test reminder",
      new Date("2025-07-15T09:30:00.000Z"),
      "Test Location",
      "Test Creator",
      []
    );
    console.log("✅ Email test passed");

    console.log("🎉 All tests passed!");

  } catch (error: unknown) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

testEmailAndSMS();
