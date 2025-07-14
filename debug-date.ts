// Test script to debug event categorization
import { startOfDay, endOfDay } from "date-fns";

console.log("=== TESTING EVENT CATEGORIZATION ===");

// Current time (July 14, 2025)
const now = new Date(); // Should be July 14
console.log("1. Current time:", now.toString());

const todayStart = startOfDay(now);
const todayEnd = endOfDay(now);
console.log("2. Today start:", todayStart.toString());
console.log("3. Today end:", todayEnd.toString());

// Event date (July 15 8:05 PM stored as UTC)
const eventDate = new Date("2025-07-15T10:05:00.000Z");
console.log("4. Event date:", eventDate.toString());

// Test categorization
const isToday = eventDate >= todayStart && eventDate <= todayEnd;
const isUpcoming = eventDate > todayEnd;
const isPast = eventDate < todayStart;

console.log("5. Is today?", isToday);
console.log("6. Is upcoming?", isUpcoming);
console.log("7. Is past?", isPast);

console.log("\n=== COMPARISON DETAILS ===");
console.log("Event time (ms):", eventDate.getTime());
console.log("Today start (ms):", todayStart.getTime());
console.log("Today end (ms):", todayEnd.getTime());
console.log("Event > today end?", eventDate.getTime() > todayEnd.getTime());
