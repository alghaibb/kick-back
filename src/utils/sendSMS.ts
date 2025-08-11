import { env } from "@/lib/env";
import { CountryCode } from "libphonenumber-js";
import twilio from "twilio";
import { detectCountryForSMS, getCountryName } from "./detectCountry";
import { formatToE164 } from "./formatPhoneNumber";

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export async function sendSMS(
  to: string,
  body: string,
  options: {
    country?: CountryCode;
    timezone?: string;
    fallbackCountry?: CountryCode;
  } = {}
) {
  const { country, timezone } = options;

  // Use provided country or detect it from phone number/timezone
  const detectedCountry = country || detectCountryForSMS(to, timezone);



  const formattedNumber = formatToE164(to, detectedCountry);

  if (!formattedNumber) {
    throw new Error(`Invalid phone number format: ${to} for country ${detectedCountry} (${getCountryName(detectedCountry)})`);
  }

  return client.messages.create({
    body,
    from: env.TWILIO_PHONE_NUMBER,
    to: formattedNumber,
  });
}