import { parsePhoneNumberWithError, CountryCode  } from "libphonenumber-js";

export function formatToE164(phone: string, defaultCountry: CountryCode = "AU") {
  try {
    const parsed = parsePhoneNumberWithError(phone, defaultCountry);
    return parsed.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}
