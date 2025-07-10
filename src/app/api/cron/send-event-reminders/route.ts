import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEventReminderEmail } from "@/utils/sendEmails";
import { sendSMS } from "@/utils/sendSMS";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                nickname: true,
                reminderType: true,
                reminderTime: true,
                timezone: true,
                phoneNumber: true,
              },
            },
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });

    let emailsSent = 0;
    let smsSent = 0;
    let errors = 0;

    for (const event of events) {
      const creatorInfo = await prisma.user.findUnique({
        where: { id: event.createdBy },
        select: {
          firstName: true,
          lastName: true,
          nickname: true,
          email: true,
          reminderType: true,
          reminderTime: true,
          timezone: true,
          phoneNumber: true,
        },
      });

      const creatorName = creatorInfo?.nickname ||
        `${creatorInfo?.firstName || "Unknown"}${creatorInfo?.lastName ? ` ${creatorInfo.lastName}` : ""}`;

      const attendees = event.attendees.map((attendee) => ({
        firstName: attendee.user.firstName,
        lastName: attendee.user.lastName,
        nickname: attendee.user.nickname,
      }));

      for (const attendee of event.attendees) {
        const user = attendee.user;
        const userTimezone = user.timezone || "UTC";
        const now = new Date();
        const userNow = toZonedTime(now, userTimezone);
        const userCurrentTime = formatTz(userNow, "HH:mm");

        if (
          user.reminderTime === userCurrentTime &&
          (user.reminderType === "email" || user.reminderType === "both")
        ) {
          try {
            await sendEventReminderEmail(
              user.email,
              event.name,
              event.description,
              event.date,
              event.location,
              creatorName,
              attendees
            );
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send reminder email to ${user.email}:`, error);
            errors++;
          }
        }

        if (
          user.reminderTime === userCurrentTime &&
          (user.reminderType === "sms" || user.reminderType === "both") &&
          user.phoneNumber
        ) {
          try {
            const formattedPhone = formatToE164(user.phoneNumber);
            if (!formattedPhone) {
              console.warn(`Invalid attendee phone number: ${user.phoneNumber}`);
              errors++;
              continue;
            }

            const eventDateInUserTz = toZonedTime(event.date, userTimezone);
            const formattedDate = format(eventDateInUserTz, "EEEE, MMMM d, yyyy 'at' h:mm a");

            const attendeeNames = attendees.map(a => a.nickname || a.firstName).join(', ');
            const smsBody = [
              `Event Reminder: ${event.name}`,
              `Date: ${formattedDate} (${userTimezone})`,
              event.location ? `Location: ${event.location}` : null,
              event.group?.name ? `Group: ${event.group.name}` : null,
              `Host: ${creatorName}`,
              attendeeNames ? `Attendees: ${attendeeNames}` : null,
              event.description ? `Details: ${event.description}` : null,
            ].filter(Boolean).join('\n');

            await sendSMS(formattedPhone, smsBody);
            smsSent++;
          } catch (error) {
            console.error(`Failed to send SMS to ${user.phoneNumber}:`, error);
            errors++;
          }
        }
      }

      if (creatorInfo) {
        const creatorTimezone = creatorInfo.timezone || "UTC";
        const now = new Date();
        const creatorNow = toZonedTime(now, creatorTimezone);
        const creatorCurrentTime = formatTz(creatorNow, "HH:mm");

        if (
          creatorInfo.reminderTime === creatorCurrentTime &&
          (creatorInfo.reminderType === "email" || creatorInfo.reminderType === "both")
        ) {
          try {
            await sendEventReminderEmail(
              creatorInfo.email,
              event.name,
              event.description,
              event.date,
              event.location,
              creatorName,
              attendees
            );
            emailsSent++;
          } catch (error) {
            console.error(`Failed to send reminder email to creator ${creatorInfo.email}:`, error);
            errors++;
          }
        }

        if (
          creatorInfo.reminderTime === creatorCurrentTime &&
          (creatorInfo.reminderType === "sms" || creatorInfo.reminderType === "both") &&
          creatorInfo.phoneNumber
        ) {
          try {
            const formattedCreatorPhone = formatToE164(creatorInfo.phoneNumber);
            if (!formattedCreatorPhone) {
              console.warn(`Invalid creator phone number: ${creatorInfo.phoneNumber}`);
              errors++;
              continue;
            }

            const eventDateInCreatorTz = toZonedTime(event.date, creatorTimezone);
            const formattedDate = format(eventDateInCreatorTz, "EEEE, MMMM d, yyyy 'at' h:mm a");

            const attendeeNames = attendees.map(a => a.nickname || a.firstName).join(', ');
            const smsBody = [
              `Event Reminder: ${event.name}`,
              `Date: ${formattedDate} (${creatorTimezone})`,
              event.location ? `Location: ${event.location}` : null,
              event.group?.name ? `Group: ${event.group.name}` : null,
              `Host: ${creatorName}`,
              attendeeNames ? `Attendees: ${attendeeNames}` : null,
              event.description ? `Details: ${event.description}` : null,
            ].filter(Boolean).join('\n');

            await sendSMS(formattedCreatorPhone, smsBody);
            smsSent++;
          } catch (error) {
            console.error(`Failed to send SMS to creator ${creatorInfo.phoneNumber}:`, error);
            errors++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event reminders sent: ${emailsSent} emails, ${smsSent} SMS, ${errors} errors`,
      eventsProcessed: events.length,
      emailsSent,
      smsSent,
      errors,
    });
  } catch (error) {
    console.error("Error sending event reminders:", error);
    return NextResponse.json(
      { error: "Failed to send event reminders" },
      { status: 500 }
    );
  }
}
