import {
  MagicLinkEmail,
  ResendOTPEmail,
  ResetPasswordEmail,
  VerifyAccount,
} from '@/components/emails';
import { env } from '@/lib/env';
import prisma from '@/lib/prisma';
import { JSX } from 'react';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);
const defaultFrom = 'Kick Back <noreply@codewithmj.com>';

// 📨 Shared email sender
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
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw new Error('Email sending failed.');
  }
}

// 🧠 Get user’s first name by email
async function getUserFirstNameByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.firstName ?? 'there';
}

// ✅ Send verification email
export async function sendVerifyAccountEmail(email: string, otp: string) {
  const firstName = await getUserFirstNameByEmail(email);

  await sendEmail(
    email,
    'Kick Back: Verify your account',
    <VerifyAccount otp={otp} userFirstname={firstName} />
  );
}

// 🔁 Resend OTP email
export async function sendResendOTPEmail(email: string, otp: string) {
  const firstName = await getUserFirstNameByEmail(email);

  await sendEmail(
    email,
    'Kick Back: Your new OTP',
    <ResendOTPEmail otp={otp} userFirstname={firstName} />
  );
}

// 🔐 Reset password email
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
    'Kick Back: Reset your password',
    <ResetPasswordEmail
      userFirstName={finalName}
      resetPasswordLink={resetPasswordLink}
    />
  );
}

// 🔑 Magic link sign-in
export async function sendMagicLinkEmail(email: string, magicLink: string) {
  const firstName = await getUserFirstNameByEmail(email);

  const magicLinkToken = `${env.NEXT_PUBLIC_BASE_URL}/magic-link-verify?token=${magicLink}`;
  await sendEmail(
    email,
    'Kick Back: Your Magic Link to Sign In',
    <MagicLinkEmail userFirstName={firstName} magicLink={magicLinkToken} />
  );
}
