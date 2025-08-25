"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createEventTemplateSchema,
  editEventTemplateSchema,
  type CreateEventTemplateValues,
  type EditEventTemplateValues,
} from "@/validations/events/eventTemplateSchema";

export async function createEventTemplateAction(values: CreateEventTemplateValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to create templates" };
    }

    const validatedData = createEventTemplateSchema.parse(values);

    // Verify group access if groupId is provided
    if (validatedData.groupId) {
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          groupId: validatedData.groupId,
          userId: session.user.id,
        },
      });

      if (!groupMember) {
        return { error: "You don't have access to this group" };
      }
    }

    const template = await prisma.eventTemplate.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/events");
    revalidatePath("/events/templates");

    return { success: true, template };
  } catch (error) {
    console.error("Error creating event template:", error);
    return { error: "Failed to create event template" };
  }
}

export async function editEventTemplateAction(
  templateId: string,
  values: EditEventTemplateValues
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to edit templates" };
    }

    const validatedData = editEventTemplateSchema.parse(values);

    // Verify template ownership
    const existingTemplate = await prisma.eventTemplate.findFirst({
      where: {
        id: templateId,
        createdBy: session.user.id,
      },
    });

    if (!existingTemplate) {
      return { error: "Template not found or you don't have permission to edit it" };
    }

    // Verify group access if groupId is provided
    if (validatedData.groupId) {
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          groupId: validatedData.groupId,
          userId: session.user.id,
        },
      });

      if (!groupMember) {
        return { error: "You don't have access to this group" };
      }
    }

    const template = await prisma.eventTemplate.update({
      where: { id: templateId },
      data: validatedData,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/events");
    revalidatePath("/events/templates");

    return { success: true, template };
  } catch (error) {
    console.error("Error editing event template:", error);
    return { error: "Failed to edit event template" };
  }
}

export async function deleteEventTemplateAction(templateId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to delete templates" };
    }

    // Verify template ownership
    const existingTemplate = await prisma.eventTemplate.findFirst({
      where: {
        id: templateId,
        createdBy: session.user.id,
      },
    });

    if (!existingTemplate) {
      return { error: "Template not found or you don't have permission to delete it" };
    }

    await prisma.eventTemplate.delete({
      where: { id: templateId },
    });

    revalidatePath("/events");
    revalidatePath("/events/templates");

    return { success: true };
  } catch (error) {
    console.error("Error deleting event template:", error);
    return { error: "Failed to delete event template" };
  }
}

export async function getUserEventTemplatesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to view templates" };
    }

    const templates = await prisma.eventTemplate.findMany({
      where: {
        createdBy: session.user.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, templates };
  } catch (error) {
    console.error("Error fetching user event templates:", error);
    return { error: "Failed to fetch templates" };
  }
}

export async function getEventTemplateAction(templateId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to view templates" };
    }

    const template = await prisma.eventTemplate.findFirst({
      where: {
        id: templateId,
        createdBy: session.user.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      return { error: "Template not found or you don't have access to it" };
    }

    return { success: true, template };
  } catch (error) {
    console.error("Error fetching event template:", error);
    return { error: "Failed to fetch template" };
  }
}
