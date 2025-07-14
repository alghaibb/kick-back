import { parsePhoneNumberWithError, CountryCode  } from "libphonenumber-js";

export function formatToE164(phone: string, defaultCountry: CountryCode = "AU") {
  try {
    const parsed = parsePhoneNumberWithError(phone, defaultCountry);
    return parsed.isValid() ? parsed.number : null;
  } catch {
    // Fallback for Australian numbers
    if (defaultCountry === "AU" && phone) {
      // Remove any spaces, dashes, or other formatting
      const cleaned = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
      
      // If it starts with 04, convert to +614
      if (cleaned.startsWith('04')) {
        return '+61' + cleaned.substring(1);
      }
      
      // If it starts with 61, add +
      if (cleaned.startsWith('61')) {
        return '+' + cleaned;
      }
      
      // If it already starts with +61, return as is
      if (cleaned.startsWith('+61')) {
        return cleaned;
      }
    }
    
    return null;
  }
}
