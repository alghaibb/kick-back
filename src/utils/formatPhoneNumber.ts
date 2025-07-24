import { parsePhoneNumberWithError, CountryCode } from "libphonenumber-js";

export function formatToE164(
  phoneNumber: string,
  countryCode: CountryCode
): string {
  try {
    const parsed = parsePhoneNumberWithError(phoneNumber, countryCode);
    return parsed.format("E.164");
  } catch (error) {
    console.error(error);
    return fallbackFormatting(phoneNumber, countryCode);
  }
}

function fallbackFormatting(phoneNumber: string, countryCode: CountryCode): string {
  const cleaned = phoneNumber.replace(/[\s\-\(\)\+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  switch (countryCode) {
    case "AU":
      if (cleaned.startsWith("04") && cleaned.length === 10) {
        return `+614${cleaned.slice(2)}`;
      }
      if (cleaned.startsWith("61") && cleaned.length >= 10) {
        return `+${cleaned}`;
      }
      return `+61${cleaned}`;

    case "US":
    case "CA":
      if (cleaned.length === 10) {
        return `+1${cleaned}`;
      }
      if (cleaned.startsWith("1") && cleaned.length === 11) {
        return `+${cleaned}`;
      }
      return `+1${cleaned}`;

    case "GB":
      if (cleaned.startsWith("07") && cleaned.length === 11) {
        return `+44${cleaned.slice(1)}`;
      }
      if (cleaned.startsWith("44") && cleaned.length >= 10) {
        return `+${cleaned}`;
      }
      return `+44${cleaned}`;

    case "DE":
      if (cleaned.startsWith("01") && cleaned.length >= 10) {
        return `+49${cleaned.slice(1)}`;
      }
      if (cleaned.startsWith("49") && cleaned.length >= 10) {
        return `+${cleaned}`;
      }
      return `+49${cleaned}`;

    case "FR":
      if ((cleaned.startsWith("06") || cleaned.startsWith("07")) && cleaned.length === 10) {
        return `+33${cleaned.slice(1)}`;
      }
      if (cleaned.startsWith("33") && cleaned.length >= 10) {
        return `+${cleaned}`;
      }
      return `+33${cleaned}`;

    case "IN":
      if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
        return `+91${cleaned}`;
      }
      if (cleaned.startsWith("91") && cleaned.length >= 10) {
        return `+${cleaned}`;
      }
      return `+91${cleaned}`;

    case "JP":
      if (cleaned.startsWith("090") || cleaned.startsWith("080") || cleaned.startsWith("070")) {
        return `+81${cleaned.slice(1)}`;
      }
      if (cleaned.startsWith("81") && cleaned.length >= 10) {
        return `+${cleaned}`;
      }
      return `+81${cleaned}`;

    default:
      if (cleaned.length >= 8 && cleaned.length <= 15) {
        return `+${cleaned}`;
      }
      return `+${cleaned}`;
  }
}
