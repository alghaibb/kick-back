import prisma from "@/lib/prisma";
import crypto, { randomInt } from "crypto";
import { getUserByEmail } from "./user";

// -------------------- OTP GENERATION FUNCTIONS --------------------

// Function to generate 6-digit numeric OTP
const generateOtp = () => {
  const otp = randomInt(100000, 999999);
  return otp.toString();
};

// Generate verification code and store it in the database
export const generateVerificationCode = async (email: string, reason: string) => {
  const verificationCode = generateOtp();

  // Get user by email
  const user = await getUserByEmail(email);

  // Check if user exists before accessing the id property
  if (user) {
    // Store verification code in the database
    await prisma.verificationOTP.create({
      data: {
        otp: verificationCode,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
        reason
      },
    });
  } else {
    console.error("User not found");
  }

  return verificationCode;
};

export const generateMagicLinkToken = async (email: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.magicLinkToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  return token;
}

// -------------------- OTP VERIFICATION AND DELETE FUNCTIONS --------------------
export const deleteVerificationOTP = async (otp: string) => {
  const otpRecord = await prisma.verificationOTP.findFirst({
    where: { otp },
  })

  if (!otpRecord) {
    return; // Do nothing
  }

  // Delete record by id
  await prisma.verificationOTP.delete({
    where: { id: otpRecord.id },
  })
}

export const deleteVerificationOTPByUserId = async (userId: string) => {
  try {
    // Delete all OTPs associated with the userId
    await prisma.verificationOTP.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error("Error deleting verification OTPs for user:", error);
    throw new Error("Failed to delete verification OTPs.");
  }
}

export const verifyVerificationOTP = async (otp: string) => {
  const userWithOTP = await prisma.verificationOTP.findFirst({
    where: { otp },
    include: { user: true },
  })

  if (!userWithOTP) {
    return { user: null, error: "Invalid or expired OTP. Please request a new one." }
  }

  if (userWithOTP.expiresAt <= new Date()) {
    return { user: null, error: "Invalid or expired OTP. Please request a new one." }
  }

  return { user: userWithOTP.user, error: null }
}

// Verify the magic link token
export const verifyMagicLinkToken = async (token: string) => {
  const magicToken = await prisma.magicLinkToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!magicToken || magicToken.expiresAt < new Date()) {
    return { error: "Invalid or expired magic link." };
  }

  await prisma.magicLinkToken.delete({
    where: { id: magicToken.id },
  });

  return magicToken.user;
};

// -------------------- RESET PASSWORD FUNCTIONS --------------------

// Generate reset password token and store it in the database
export const generateResetPasswordToken = async (email: string) => {
  try {
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");

    // Get user by email
    const user = await getUserByEmail(email);

    if (!user) {
      console.error("No user found with email:", email);
      return null;
    }

    // Store reset password token in the database
    await prisma.resetPasswordToken.create({
      data: {
        token: resetPasswordToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });

    return resetPasswordToken;
  } catch (error) {
    console.error("Error generating reset password token:", error);
    throw new Error("Failed to generate reset password token");
  }
};


export const deleteResetPasswordToken = async (token: string) => {
  try {
    const existingToken = await prisma.resetPasswordToken.findFirst({
      where: { token },
    });

    if (!existingToken) {
      console.log("No token found for deletion.");
      return;
    }

    // Delete record by id
    await prisma.resetPasswordToken.delete({
      where: { id: existingToken.id },
    });

  } catch (error) {
    console.error("Error deleting reset password token:", error);
  }
};

// -------------------- GROUP INVITE FUNCTIONS --------------------

// Generate a secure token for group invites
export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};