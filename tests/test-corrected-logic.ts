// Test the corrected timezone logic
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

function testCorrectedLogic() {
  console.log('🔧 Testing corrected timezone logic...\n');

  // Simulate user input: July 14, 8:43 PM Australian time
  const selectedDate = new Date('2025-07-14'); // Date from calendar
  const selectedTime = '20:43'; // Time from time picker
  const userTimezone = 'Australia/Sydney';

  // Parse the time
  const [hours, minutes] = selectedTime.split(":").map(Number);

  // Create date components
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();

  console.log(`📅 User Input:`);
  console.log(`Date: ${selectedDate.toDateString()}`);
  console.log(`Time: ${selectedTime}`);
  console.log(`Timezone: ${userTimezone}\n`);

  // OLD WAY (what was happening before)
  const oldWay = new Date(year, month, day, hours, minutes, 0, 0);
  console.log(`❌ OLD WAY (broken):`);
  console.log(`Created: ${oldWay.toString()}`);
  console.log(`Stored in DB: ${oldWay.toISOString()}`);
  console.log(`Displays as: ${formatInTimeZone(oldWay, userTimezone, "h:mm a")}\n`);

  // NEW WAY (corrected)
  const localDateTime = new Date(year, month, day, hours, minutes, 0, 0);
  const newWay = fromZonedTime(localDateTime, userTimezone);
  console.log(`✅ NEW WAY (fixed):`);
  console.log(`Local time: ${localDateTime.toString()}`);
  console.log(`Stored in DB: ${newWay.toISOString()}`);
  console.log(`Displays as: ${formatInTimeZone(newWay, userTimezone, "h:mm a")}`);

  console.log(`\n🎯 Expected result: User sees 8:43 PM when they created event at 8:43 PM`);
}

testCorrectedLogic();
