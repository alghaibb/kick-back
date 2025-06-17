import prisma from "@/lib/prisma";

// Get user from database by email
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user by email");
  }
}

export async function getUserByResetPasswordToken(token: string) {
  try {
    const passwordResetToken = await prisma.resetPasswordToken.findFirst({
      where: { token },
      include: { user: true },
    });

    return passwordResetToken?.user || null;
  } catch (error) {
    console.error("Error fetching user by reset password token:", error);
    throw new Error("Failed to fetch user by reset password token");
  }
};