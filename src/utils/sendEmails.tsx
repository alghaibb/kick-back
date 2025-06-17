import {
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

async function sendEmail(
  to: string,
  subject: string,
  reactComponent: JSX.Element
) {
  try {
    await resend.emails.send({
      from: 'noreply@codewithmj.com',
      to,
      subject,
      react: reactComponent,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error('Email sending failed.');
  }
}

export const sendVerifyAccountEmail = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user || !user.firstName) {
    throw new Error('User not found or missing first name.');
  }

  const emailComponent = (
    <VerifyAccount otp={otp} userFirstname={user.firstName} />
  );
  await sendEmail(email, 'Verify your account', emailComponent);
};

export const sendResendOTPEmail = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user || !user.firstName) {
    throw new Error('User not found or missing first name.');
  }

  const emailComponent = (
    <ResendOTPEmail otp={otp} userFirstname={user.firstName} />
  );
  await sendEmail(email, 'Resend OTP', emailComponent);
};

export const sendResetPasswordEmail = async (
  email: string,
  firstName: string,
  token: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  const userFirstName = user?.firstName || firstName;

  const resetPasswordLink = `${env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  const emailComponent = (
    <ResetPasswordEmail
      userFirstName={userFirstName}
      resetPasswordLink={resetPasswordLink}
    />
  );
  await sendEmail(email, 'Reset your password', emailComponent);
};

export const sendMagicLinkEmail = async (email: string, magicLink: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || !user.firstName) {
    throw new Error('User not found or missing first name.');
  }
  const magicLinkToken = `${env.NEXT_PUBLIC_BASE_URL}/magic-link-verify?token=${magicLink}`;
  const emailComponent = (
    <MagicLinkEmail userFirstName={user.firstName} magicLink={magicLinkToken} />
  );
  await sendEmail(email, 'Your Magic Link to Sign In', emailComponent);
};
