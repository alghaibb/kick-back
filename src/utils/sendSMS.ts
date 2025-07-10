import { env } from "@/lib/env";
import twilio from "twilio";

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export async function sendSMS(to: string, body: string) {
  return client.messages.create({
    body,
    from: env.TWILIO_PHONE_NUMBER,
    to,
  });
}