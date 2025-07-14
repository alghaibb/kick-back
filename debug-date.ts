// Test script to debug date/time issues
const testDate = new Date(2025, 6, 15, 20, 5, 0, 0); // July 15, 2025, 8:05 PM
console.log("Test date created:", testDate.toISOString());
console.log("Local string:", testDate.toString());
console.log("UTC Hours:", testDate.getUTCHours());
console.log("Local Hours:", testDate.getHours());
console.log("Timezone offset:", testDate.getTimezoneOffset());

// Simulate what happens when we parse it back
const parsed = new Date(testDate.toISOString());
console.log("Parsed back:", parsed.toString());
console.log("Parsed local hours:", parsed.getHours());
