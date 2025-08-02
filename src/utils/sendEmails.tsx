import {
  MagicLinkEmail,
  ResendOTPEmail,
  ResetPasswordEmail,
  VerifyAccount,
  GroupInviteEmail,
  EventReminderEmail,
  ContactReplyEmail,
} from "@/components/emails";
import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import React, { JSX } from "react";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);
const defaultFrom = "Kick Back <noreply@codewithmj.com>";

async function sendEmail(
  to: string,
  subject: string,
  reactComponent: JSX.Element,
  from: string = defaultFrom
) {
  try {
    await resend.emails.send({
      from,
      to,
      subject,
      react: reactComponent,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error("Email sending failed.");
  }
}

async function getUserFirstNameByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.firstName ?? "there";
}

export async function sendVerifyAccountEmail(email: string, otp: string) {
  const firstName = await getUserFirstNameByEmail(email);

  await sendEmail(
    email,
    "Kick Back: Verify your account",
    <VerifyAccount otp={otp} userFirstname={firstName} />
  );
}

export async function sendResendOTPEmail(email: string, otp: string) {
  const firstName = await getUserFirstNameByEmail(email);

  await sendEmail(
    email,
    "Kick Back: Your new OTP",
    <ResendOTPEmail otp={otp} userFirstname={firstName} />
  );
}

export async function sendResetPasswordEmail(
  email: string,
  fallbackName: string,
  token: string
) {
  const dbFirstName = await getUserFirstNameByEmail(email);
  const finalName = dbFirstName || fallbackName;

  const resetPasswordLink = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Kick Back: Reset your password",
    <ResetPasswordEmail
      userFirstName={finalName}
      resetPasswordLink={resetPasswordLink}
    />
  );
}

export async function sendMagicLinkEmail(email: string, magicLink: string) {
  const firstName = await getUserFirstNameByEmail(email);

  const magicLinkToken = `${env.NEXT_PUBLIC_BASE_URL}/magic-link-verify?token=${magicLink}`;
  await sendEmail(
    email,
    "Kick Back: Your Magic Link to Sign In",
    <MagicLinkEmail userFirstName={firstName} magicLink={magicLinkToken} />
  );
}

export async function sendGroupInviteEmail(
  email: string,
  inviterName: string,
  groupName: string,
  inviteToken: string
) {
  const firstName = await getUserFirstNameByEmail(email);
  const inviteLink = `${env.NEXT_PUBLIC_BASE_URL}/groups/accept-invite?token=${inviteToken}`;

  await sendEmail(
    email,
    `You've been invited to join ${groupName} on Kick Back`,
    <GroupInviteEmail
      userFirstName={firstName}
      inviterName={inviterName}
      groupName={groupName}
      inviteLink={inviteLink}
    />
  );
}

export async function sendEventReminderEmail(
  email: string,
  eventName: string,
  eventDescription: string | null,
  eventDate: Date,
  eventLocation: string | null,
  eventCreatorName: string,
  attendees: Array<{
    firstName: string;
    lastName: string | null;
    nickname: string | null;
  }>
) {
  const firstName = await getUserFirstNameByEmail(email);
  const eventLink = `${env.NEXT_PUBLIC_BASE_URL}/events`;

  await sendEmail(
    email,
    `Reminder: ${eventName} is happening soon`,
    <EventReminderEmail
      userFirstName={firstName}
      eventName={eventName}
      eventDescription={eventDescription || undefined}
      eventDate={eventDate}
      eventLocation={eventLocation || undefined}
      eventCreator={eventCreatorName}
      attendees={attendees.map((attendee) => ({
        firstName: attendee.firstName,
        lastName: attendee.lastName || undefined,
        nickname: attendee.nickname || undefined,
      }))}
      eventLink={eventLink}
    />
  );
}

export async function sendContactReplyEmail(
  email: string,
  originalSubject: string,
  originalMessage: string,
  adminReply: string,
  adminName: string
) {
  const firstName = await getUserFirstNameByEmail(email);

  await sendEmail(
    email,
    `Re: ${originalSubject}`,
    <ContactReplyEmail
      userFirstName={firstName}
      originalSubject={originalSubject}
      originalMessage={originalMessage}
      adminReply={adminReply}
      adminName={adminName}
    />
  );
}
