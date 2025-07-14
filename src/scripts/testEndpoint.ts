import "dotenv/config";

// Simple script to manually test the reminder endpoint
async function testReminderEndpoint() {
  try {
    console.log("🧪 Testing reminder endpoint manually...");

    // You'll need to get your QStash signing key to create a proper signature
    // For now, let's see what happens without it to identify the 500 error

    const response = await fetch(
      "https://kick-back.vercel.app/api/cron/send-event-reminders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Note: This will fail signature verification, but we can see the error
        },
      }
    );

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Success:", result);
    } else {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}

testReminderEndpoint();
