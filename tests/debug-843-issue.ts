// Debug the 8:43 PM to 6:43 AM issue
import { formatInTimeZone } from "date-fns-tz";

function debug843Issue() {
  console.log('🔍 Debugging the 8:43 PM → 6:43 AM issue...\n');

  // Simulate creating an event at 8:43 PM (20:43)
  const selectedTime = '20:43';
  const [hours, minutes] = selectedTime.split(":").map(Number);

  console.log(`Input time: ${selectedTime} (${hours}:${minutes})`);

  // Create the event date (today for testing)
  const today = new Date();
  const eventDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);

  console.log(`\n📅 Event creation:`);
  console.log(`Local time created: ${eventDateTime.toString()}`);
  console.log(`UTC stored in DB: ${eventDateTime.toISOString()}`);

  // Test different timezone displays
  const timezones = [
    'Australia/Sydney',
    'UTC',
    'America/New_York'
  ];

  console.log(`\n🌏 How this displays in different timezones:`);

  for (const tz of timezones) {
    const display = formatInTimeZone(eventDateTime, tz, "h:mm a (zzz)");
    console.log(`${tz.padEnd(20)} → ${display}`);
  }

  // Check if there's a 14-hour difference
  const utcHour = new Date(eventDateTime.toISOString()).getUTCHours();
  const localHour = eventDateTime.getHours();
  const difference = Math.abs(utcHour - localHour);

  console.log(`\n🔬 Analysis:`);
  console.log(`Local hour: ${localHour}`);
  console.log(`UTC hour: ${utcHour}`);
  console.log(`Difference: ${difference} hours`);

  if (difference === 14) {
    console.log(`❌ Found the issue! 14-hour difference detected.`);
  }
}

debug843Issue();
