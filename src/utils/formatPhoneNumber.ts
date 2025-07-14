import { parsePhoneNumberWithError, CountryCode } from "libphonenumber-js";

export function formatToE164(
  phone: string,
  defaultCountry: CountryCode = "AU"
) {
  try {
    const parsed = parsePhoneNumberWithError(phone, defaultCountry);
    return parsed.isValid() ? parsed.number : null;
  } catch {
    // Fallback formatting for common cases when libphonenumber-js fails
    if (!phone) return null;

    // Remove any spaces, dashes, parentheses, or other formatting
    const cleaned = phone.replace(/\s+/g, "").replace(/[-()]/g, "");

    // If it already starts with +, assume it's correctly formatted
    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    // Country-specific fallbacks
    switch (defaultCountry) {
      case "AU": // Australia
        // Convert 04xx to +614xx
        if (cleaned.startsWith("04")) {
          return "+61" + cleaned.substring(1);
        }
        // Convert 61xxx to +61xxx
        if (cleaned.startsWith("61")) {
          return "+" + cleaned;
        }
        break;

      case "US": // United States
      case "CA": // Canada
        // Convert 10-digit numbers to +1xxx
        if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
          return "+1" + cleaned;
        }
        // Convert 1xxx to +1xxx
        if (cleaned.startsWith("1") && cleaned.length === 11) {
          return "+" + cleaned;
        }
        break;

      case "GB": // United Kingdom
        // Convert 07xxx to +447xxx (mobile)
        if (cleaned.startsWith("07")) {
          return "+44" + cleaned.substring(1);
        }
        // Convert 44xxx to +44xxx
        if (cleaned.startsWith("44")) {
          return "+" + cleaned;
        }
        break;

      case "DE": // Germany
        // Convert 01xxx to +491xxx (mobile)
        if (cleaned.startsWith("01")) {
          return "+49" + cleaned.substring(1);
        }
        // Convert 49xxx to +49xxx
        if (cleaned.startsWith("49")) {
          return "+" + cleaned;
        }
        break;

      case "FR": // France
        // Convert 06xxx or 07xxx to +336xxx/+337xxx (mobile)
        if (cleaned.startsWith("06") || cleaned.startsWith("07")) {
          return "+33" + cleaned.substring(1);
        }
        // Convert 33xxx to +33xxx
        if (cleaned.startsWith("33")) {
          return "+" + cleaned;
        }
        break;

      case "IN": // India
        // Convert 10-digit numbers starting with 6-9 to +91xxx
        if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
          return "+91" + cleaned;
        }
        // Convert 91xxx to +91xxx
        if (cleaned.startsWith("91")) {
          return "+" + cleaned;
        }
        break;

      case "JP": // Japan
        // Convert 090/080/070 to +8190/+8180/+8170 (mobile)
        if (
          cleaned.startsWith("090") ||
          cleaned.startsWith("080") ||
          cleaned.startsWith("070")
        ) {
          return "+81" + cleaned.substring(1);
        }
        // Convert 81xxx to +81xxx
        if (cleaned.startsWith("81")) {
          return "+" + cleaned;
        }
        break;

      default:
        // For other countries, if it looks like a valid number, return as-is
        // This is a basic fallback and might not work for all countries
        if (/^\d{8,15}$/.test(cleaned)) {
          // Most international numbers are 8-15 digits
          return "+" + cleaned;
        }
        break;
    }

    return null;
  }
}
