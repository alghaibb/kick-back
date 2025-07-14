import "dotenv/config";
import { sendSMS } from "@/utils/sendSMS";
import { formatToE164 } from "@/utils/formatPhoneNumber";

async function testSMS() {
  try {
    console.log("📱 Testing SMS functionality...");
    
    // Use the formatting utility
    const australianNumber = "0415904443";
    const formattedNumber = formatToE164(australianNumber, "AU");
    
    console.log("Original number:", australianNumber);
    console.log("Formatted number:", formattedNumber);
    
    if (!formattedNumber) {
      throw new Error("Phone number formatting failed");
    }
    
    const result = await sendSMS(
      formattedNumber, 
      "Test reminder: This is a test SMS from your updated event reminder system!"
    );
    
    console.log("✅ SMS sent successfully!");
    console.log("Message SID:", result.sid);
    console.log("Status:", result.status);
    
  } catch (error) {
    console.error("❌ SMS test failed:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    }
  }
}

testSMS();
