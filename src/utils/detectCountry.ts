import { CountryCode, parsePhoneNumberWithError } from "libphonenumber-js";

// Mapping of common timezones to countries for SMS fallback
const TIMEZONE_TO_COUNTRY: Record<string, CountryCode> = {
  // Australia
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Australia/Darwin": "AU",
  "Australia/Hobart": "AU",

  // United States
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "America/Honolulu": "US",

  // Canada
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Montreal": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",

  // United Kingdom
  "Europe/London": "GB",

  // Germany
  "Europe/Berlin": "DE",

  // France
  "Europe/Paris": "FR",

  // Italy
  "Europe/Rome": "IT",

  // Spain
  "Europe/Madrid": "ES",

  // Netherlands
  "Europe/Amsterdam": "NL",

  // Japan
  "Asia/Tokyo": "JP",

  // South Korea
  "Asia/Seoul": "KR",

  // China
  "Asia/Shanghai": "CN",

  // India
  "Asia/Kolkata": "IN",

  // Singapore
  "Asia/Singapore": "SG",

  // New Zealand
  "Pacific/Auckland": "NZ",

  // South Africa
  "Africa/Johannesburg": "ZA",

  // Brazil
  "America/Sao_Paulo": "BR",

  // Mexico
  "America/Mexico_City": "MX",
};

/**
 * Attempts to detect the country code for a phone number using multiple strategies:
 * 1. Parse the phone number directly (if it's in international format)
 * 2. Use timezone to guess country
 * 3. Fall back to default
 */
export function detectCountryForSMS(
  phoneNumber: string,
  timezone?: string,
  fallbackCountry: CountryCode = "AU"
): CountryCode {
  // Strategy 1: Try to parse phone number directly (works if it's in international format)
  try {
    // Clean the phone number first
    const cleanedNumber = phoneNumber.replace(/\s+/g, "").replace(/[-()]/g, "");
    const parsed = parsePhoneNumberWithError(cleanedNumber);
    if (parsed && parsed.country) {
      console.log(`📱 Detected country from phone number: ${parsed.country}`);
      return parsed.country;
    }
  } catch (error) {
    // Phone number parsing failed, continue to next strategy
    console.log(`📱 Phone number parsing failed for ${phoneNumber}, trying timezone...`);
  }

  // Strategy 2: Use timezone to guess country
  if (timezone && TIMEZONE_TO_COUNTRY[timezone]) {
    const countryFromTimezone = TIMEZONE_TO_COUNTRY[timezone];
    console.log(`🌍 Detected country from timezone ${timezone}: ${countryFromTimezone}`);
    return countryFromTimezone;
  }

  // Strategy 3: Fall back to default
  console.log(`🏳️ Using fallback country: ${fallbackCountry}`);
  return fallbackCountry;
}

/**
 * Get a user-friendly country name for logging
 */
export function getCountryName(countryCode: CountryCode): string {
  const countryNames: Record<string, string> = {
    AU: "Australia",
    US: "United States",
    CA: "Canada",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    JP: "Japan",
    KR: "South Korea",
    CN: "China",
    IN: "India",
    SG: "Singapore",
    NZ: "New Zealand",
    ZA: "South Africa",
    BR: "Brazil",
    MX: "Mexico",
  };

  return countryNames[countryCode] || countryCode;
}
