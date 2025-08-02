import { PrismaClient } from "../src/generated/prisma";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function fixRecoveredUser() {
  try {
    // Get user ID from command line argument or prompt
    const userId = process.argv[2];

    if (!userId) {
      console.log("Usage: npx tsx scripts/fix-recovered-user.ts <userId>");
      console.log(
        "Example: npx tsx scripts/fix-recovered-user.ts clx1234567890"
      );
      return;
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return;
    }

    console.log("Current user data:", {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      originalFirstName: user.originalFirstName,
      originalLastName: user.originalLastName,
    });

    // Get the actual name from user input
    const firstName = await question("Enter the user's first name: ");
    const lastName = await question(
      "Enter the user's last name (or press Enter if none): "
    );

    // Update the user's name
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName,
        lastName: lastName || null,
      },
    });

    console.log("User updated successfully:", {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

fixRecoveredUser();
