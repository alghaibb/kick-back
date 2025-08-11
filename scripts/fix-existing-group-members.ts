// Script to add existing group members to events they're missing from
// Run this once to fix the current issue

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function fixExistingGroupMembers() {


  try {
    // Get all groups with their members and events
    const groups = await prisma.group.findMany({
      include: {
        members: {
          select: { userId: true }
        },
        events: {
          where: {
            date: { gte: new Date() } // Only future events
          },
          select: {
            id: true,
            name: true,
            attendees: {
              select: { userId: true }
            }
          }
        }
      }
    });

    let totalAdded = 0;

    for (const group of groups) {


      for (const event of group.events) {
        const existingAttendeeIds = event.attendees.map(a => a.userId);
        const missingMembers = group.members.filter(
          member => !existingAttendeeIds.includes(member.userId)
        );

        if (missingMembers.length > 0) {


          await prisma.eventAttendee.createMany({
            data: missingMembers.map(member => ({
              eventId: event.id,
              userId: member.userId,
              rsvpStatus: "pending"
            })),
            skipDuplicates: true
          });

          totalAdded += missingMembers.length;
        }
      }
    }



  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixExistingGroupMembers(); 