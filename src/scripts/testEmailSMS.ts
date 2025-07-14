import "dotenv/config";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { sendSMS } from "@/utils/sendSMS";
import { formatToE164 } from "@/utils/formatPhoneNumber";

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

    // Test SMS if you have a phone number
    // Note: Uncomment this if you want to test SMS
    /*
    console.log("📱 Testing SMS...");
    const phone = "+1234567890"; // Replace with your actual phone number
    const formattedPhone = formatToE164(phone);
    if (formattedPhone) {
      await sendSMS(formattedPhone, "Test SMS from reminder system");
      console.log("✅ SMS test passed");
    } else {
      console.log("⚠️ Invalid phone number format");
    }
    */

    console.log("🎉 All tests passed!");

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Stack trace:", error?.stack);
  }
}

testEmailAndSMS();
