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
      return;
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }



    // Get the actual name from user input
    const firstName = await question("Enter the user's first name: ");
    const lastName = await question(
      "Enter the user's last name (or press Enter if none): "
    );

    // Update the user's name
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName,
        lastName: lastName || null,
      },
    });


  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

fixRecoveredUser();
