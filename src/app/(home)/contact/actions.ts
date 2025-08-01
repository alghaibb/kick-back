"use server";

import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { ContactValues } from "@/validations/contactSchema";
import { revalidatePath } from "next/cache";

export async function submitContactForm(values: ContactValues) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    // Create contact submission
    await prisma.contact.create({
      data: {
        firstName: values.firstName,
        lastName: values.lastName || null,
        email: values.email,
        subject: values.subject,
        message: values.message,
        userId: userId || null,
      },
    });

    revalidatePath("/contact");

    return {
      success: "Thank you for your message! We&apos;ll get back to you soon.",
    };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return {
      error: "Failed to submit your message. Please try again.",
    };
  }
}
