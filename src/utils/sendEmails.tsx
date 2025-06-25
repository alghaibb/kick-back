import {
  GroupInviteEmail,
  MagicLinkEmail,
  ResendOTPEmail,
  ResetPasswordEmail,
  VerifyAccount,
} from '@/components/emails';
import { env } from '@/env';
import prisma from '@/lib/prisma';
import { JSX } from 'react';
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

// 1. 🔄 Shared email sender
async function sendEmail(
  to: string,
  subject: string,
  reactComponent: JSX.Element,
  from?: string
) {
  try {
    await resend.emails.send({
      from: from || 'noreply@codewithmj.com',
      to,
      subject,
      react: reactComponent,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error('Email sending failed.');
  }
}

// 2. 👤 Reusable helper to get firstName
async function getUserFirstNameByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.firstName;
}

// 3. 📩 Send specific emails

export async function sendVerifyAccountEmail(email: string, otp: string) {
  const firstName = await getUserFirstNameByEmail(email);
  if (!firstName) throw new Error('User not found or missing first name.');

  await sendEmail(
    email,
    'Verify your account',
    <VerifyAccount otp={otp} userFirstname={firstName} />
  );
}

export async function sendResendOTPEmail(email: string, otp: string) {
  const firstName = await getUserFirstNameByEmail(email);
  if (!firstName) throw new Error('User not found or missing first name.');

  await sendEmail(
    email,
    'Resend OTP',
    <ResendOTPEmail otp={otp} userFirstname={firstName} />
  );
}

export async function sendResetPasswordEmail(
  email: string,
  firstName: string,
  token: string
) {
  const dbFirstName = await getUserFirstNameByEmail(email);
  const finalName = dbFirstName || firstName;

  const resetPasswordLink = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset your password',
    <ResetPasswordEmail
      userFirstName={finalName}
      resetPasswordLink={resetPasswordLink}
    />
  );
}

export async function sendMagicLinkEmail(email: string, magicLink: string) {
  const firstName = await getUserFirstNameByEmail(email);
  if (!firstName) throw new Error('User not found or missing first name.');

  const magicLinkToken = `${env.NEXT_PUBLIC_BASE_URL}/magic-link-verify?token=${magicLink}`;
  await sendEmail(
    email,
    'Your Magic Link to Sign In',
    <MagicLinkEmail userFirstName={firstName} magicLink={magicLinkToken} />
  );
}

export async function sendGroupInviteEmail({
  email,
  inviterName,
  groupName,
  token,
}: {
  email: string;
  inviterName: string;
  groupName: string;
  token: string;
}) {
  const inviteLink = `${env.NEXT_PUBLIC_BASE_URL}/invite/accept?token=${token}`;
  const firstName = await getUserFirstNameByEmail(email); // might be undefined for non-users

  await sendEmail(
    email,
    `You're invited to join "${groupName}" on Kick Back`,
    <GroupInviteEmail
      userFirstName={firstName}
      inviterName={inviterName}
      groupName={groupName}
      inviteLink={inviteLink}
    />,
    'Kick Back <no-reply@codewithmj.com>'
  );
}
