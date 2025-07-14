import "dotenv/config";
import { formatToE164 } from "@/utils/formatPhoneNumber";

// Test international phone number formatting
function testInternationalNumbers() {
  console.log("🌍 Testing international phone number formatting...\n");

  const testCases = [
    // Australia
    { number: "0415904443", country: "AU", description: "Australian mobile" },
    {
      number: "61415904443",
      country: "AU",
      description: "Australian mobile (61 prefix)",
    },

    // United States
    { number: "5551234567", country: "US", description: "US mobile" },
    {
      number: "15551234567",
      country: "US",
      description: "US mobile (1 prefix)",
    },

    // United Kingdom
    { number: "07123456789", country: "GB", description: "UK mobile" },
    {
      number: "447123456789",
      country: "GB",
      description: "UK mobile (44 prefix)",
    },

    // Germany
    { number: "01711234567", country: "DE", description: "German mobile" },
    {
      number: "491711234567",
      country: "DE",
      description: "German mobile (49 prefix)",
    },

    // France
    { number: "0612345678", country: "FR", description: "French mobile" },
    {
      number: "33612345678",
      country: "FR",
      description: "French mobile (33 prefix)",
    },

    // India
    { number: "9876543210", country: "IN", description: "Indian mobile" },
    {
      number: "919876543210",
      country: "IN",
      description: "Indian mobile (91 prefix)",
    },

    // Japan
    { number: "09012345678", country: "JP", description: "Japanese mobile" },
    {
      number: "819012345678",
      country: "JP",
      description: "Japanese mobile (81 prefix)",
    },

    // Already formatted
    {
      number: "+61415904443",
      country: "AU",
      description: "Already formatted (AU)",
    },
    {
      number: "+15551234567",
      country: "US",
      description: "Already formatted (US)",
    },
  ];

  testCases.forEach((test) => {
    const formatted = formatToE164(test.number, test.country as "AU" | "US" | "GB" | "DE" | "FR" | "IN" | "JP");
    console.log(`${test.description}:`);
    console.log(`  Input: ${test.number} (${test.country})`);
    console.log(`  Output: ${formatted || "FAILED"}`);
    console.log("");
  });
}

testInternationalNumbers();
