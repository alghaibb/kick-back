import "dotenv/config";
import { toZonedTime, format as formatTz } from "date-fns-tz";
import { subMinutes, addMinutes } from "date-fns";

/**
 * Test script to debug reminder timing issues
 * Run this to test the timing logic locally
 */

// Test function to check if current time is within reminder window
const isWithinReminderWindow = (
  userTime: Date,
  reminderTime: string
): boolean => {
  const currentHour = userTime.getHours();
  const currentMinute = userTime.getMinutes();

  // Parse reminder time
  const [reminderHour, reminderMinute] = reminderTime.split(":").map(Number);

  // Create reminder time for today
  const reminderDateTime = new Date(userTime);
  reminderDateTime.setHours(reminderHour, reminderMinute, 0, 0);

  // Create a 2-minute window around the reminder time
  const windowStart = subMinutes(reminderDateTime, 1);
  const windowEnd = addMinutes(reminderDateTime, 1);

  const isInWindow = userTime >= windowStart && userTime <= windowEnd;

  console.log(`Time: ${formatTz(userTime, "HH:mm:ss")}`);
  console.log(`Reminder: ${reminderTime}`);
  console.log(
    `Window: ${formatTz(windowStart, "HH:mm:ss")} - ${formatTz(windowEnd, "HH:mm:ss")}`
  );
  console.log(`In window: ${isInWindow}`);

  return isInWindow;
};

// Test different timezones and reminder times
async function testReminderTiming() {
  console.log("🧪 Testing Reminder Timing Logic\n");

  // Test scenarios
  const testCases = [
    {
      timezone: "America/New_York",
      reminderTime: "09:00",
      description: "New York 9:00 AM",
    },
    {
      timezone: "Europe/London",
      reminderTime: "14:30",
      description: "London 2:30 PM",
    },
    {
      timezone: "Asia/Tokyo",
      reminderTime: "20:15",
      description: "Tokyo 8:15 PM",
    },
    {
      timezone: "Australia/Sydney",
      reminderTime: "07:45",
      description: "Sydney 7:45 AM",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 Testing: ${testCase.description}`);
    console.log("=".repeat(50));

    const now = new Date();
    const userTime = toZonedTime(now, testCase.timezone);

    console.log(`UTC Time: ${now.toISOString()}`);
    console.log(
      `User Time (${testCase.timezone}): ${formatTz(userTime, "yyyy-MM-dd HH:mm:ss")}`
    );

    const result = isWithinReminderWindow(userTime, testCase.reminderTime);

    console.log(
      `\n${result ? "✅ REMINDER WOULD SEND" : "❌ Reminder would NOT send"}`
    );
  }

  // Test edge cases
  console.log("\n\n🔍 Testing Edge Cases");
  console.log("=".repeat(50));

  const edgeCases = [
    { time: "23:59", description: "Just before midnight" },
    { time: "00:01", description: "Just after midnight" },
    { time: "12:00", description: "Noon exactly" },
  ];

  for (const edge of edgeCases) {
    console.log(`\n⚡ Edge case: ${edge.description}`);
    const now = new Date();
    const testTime = new Date(now);
    const [hour, minute] = edge.time.split(":").map(Number);
    testTime.setHours(hour, minute, 0, 0);

    const result = isWithinReminderWindow(testTime, edge.time);
    console.log(
      `${result ? "✅" : "❌"} ${edge.time} - ${result ? "WOULD" : "would NOT"} trigger`
    );
  }
}

// Run the test
testReminderTiming().catch(console.error);
