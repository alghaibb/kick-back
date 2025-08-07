import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";

interface EventReminderEmailProps {
  userFirstName: string;
  eventName: string;
  eventDescription?: string;
  eventDate: Date;
  eventLocation?: string;
  eventCreator: string;
  attendees: Array<{
    firstName: string;
    lastName?: string;
    nickname?: string;
  }>;
  eventLink: string;
}

export const EventReminderEmail = ({
  userFirstName,
  eventName,
  eventDescription,
  eventDate,
  eventLocation,
  eventCreator,
  attendees,
  eventLink,
}: EventReminderEmailProps) => {
  const formattedDate = format(eventDate, "EEEE, MMMM do, yyyy");
  const formattedTime = format(eventDate, "h:mm a");
  const attendeeCount = attendees.length;

  return (
    <Html>
      <Head />
      <Preview>
        Reminder: {eventName} is happening {formattedDate} at {formattedTime}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`}
              width="120"
              height="120"
              alt="Kick Back"
              style={logo}
            />
            <Heading style={h1}>Event Reminder</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userFirstName},</Text>

            <Text style={paragraph}>
              This is a friendly reminder about your upcoming event:
            </Text>

            <Section style={eventCard}>
              <Heading style={eventTitle}>{eventName}</Heading>

              {eventDescription && (
                <Text style={eventDescriptionStyle}>{eventDescription}</Text>
              )}

              <Section style={eventDetails}>
                <Text style={detailRow}>
                  📅 <strong>Date:</strong> {formattedDate}
                </Text>
                <Text style={detailRow}>
                  🕐 <strong>Time:</strong> {formattedTime}
                </Text>
                {eventLocation && (
                  <Text style={detailRow}>
                    📍 <strong>Location:</strong> {eventLocation}
                  </Text>
                )}
                <Text style={detailRow}>
                  👤 <strong>Created by:</strong> {eventCreator}
                </Text>
                <Text style={detailRow}>
                  👥 <strong>Attendees:</strong> {attendeeCount} people
                </Text>
              </Section>

              {attendees.length > 0 && (
                <Section style={attendeesSection}>
                  <Text style={attendeesTitle}>Who&apos;s coming:</Text>
                  <Text style={attendeesList}>
                    {attendees
                      .map(
                        (attendee) =>
                          attendee.nickname ||
                          `${attendee.firstName}${attendee.lastName ? ` ${attendee.lastName}` : ""}`
                      )
                      .join(", ")}
                  </Text>
                </Section>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Link href={eventLink} style={button}>
                View Event Details
              </Link>
            </Section>

            <Text style={footer}>
              You&apos;re receiving this because you&apos;re attending this
              event. You can manage your reminder preferences in your account
              settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  margin: "16px 0",
};

const content = {
  padding: "0 24px",
};

const greeting = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#6b7280",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 24px",
};

const eventCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const eventTitle = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const eventDescriptionStyle = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const eventDetails = {
  margin: "16px 0",
};

const detailRow = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "8px 0",
};

const attendeesSection = {
  marginTop: "16px",
  paddingTop: "16px",
  borderTop: "1px solid #e5e7eb",
};

const attendeesTitle = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const attendeesList = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default EventReminderEmail;
 