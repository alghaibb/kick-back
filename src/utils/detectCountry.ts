import { parsePhoneNumberWithError, CountryCode } from "libphonenumber-js";

const TIMEZONE_TO_COUNTRY: Record<string, CountryCode> = {
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Australia/Darwin": "AU",
  "Australia/Hobart": "AU",
  "Australia/Canberra": "AU",
  "Australia/Lord_Howe": "AU",
  "Australia/Eucla": "AU",
  "Australia/Broken_Hill": "AU",
  "Australia/Currie": "AU",

  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",

  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/St_Johns": "CA",

  "Europe/London": "GB",
  "Europe/Belfast": "GB",

  "Europe/Berlin": "DE",

  "Europe/Paris": "FR",

  "Europe/Rome": "IT",

  "Europe/Madrid": "ES",

  "Europe/Amsterdam": "NL",

  "Asia/Tokyo": "JP",

  "Asia/Seoul": "KR",

  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "CN",

  "Asia/Kolkata": "IN",

  "Asia/Singapore": "SG",

  "Pacific/Auckland": "NZ",

  "Africa/Johannesburg": "ZA",

  "America/Sao_Paulo": "BR",

  "America/Mexico_City": "MX",
};

export function detectCountryForSMS(
  phoneNumber?: string | null,
  timezone?: string | null
): CountryCode {
  if (!phoneNumber && !timezone) {
    return "AU";
  }

  if (phoneNumber) {
    try {
      const cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, "");
      const parsed = parsePhoneNumberWithError(`+${cleaned.startsWith("+") ? cleaned.slice(1) : cleaned}`);

      if (parsed.country) {
        return parsed.country;
      }
    } catch (error) {
      console.error("Failed to parse phone number:", error);

    }
  }

  if (timezone && TIMEZONE_TO_COUNTRY[timezone]) {
    return TIMEZONE_TO_COUNTRY[timezone];
  }

  return "AU";
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
