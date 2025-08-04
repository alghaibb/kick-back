import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import {
  main,
  container,
  text,
  button,
  headerSection,
  logoStyle,
  domain,
} from "./styles/sharedEmailStyles";

interface EventInviteEmailProps {
  userFirstName?: string;
  inviterName: string;
  eventName: string;
  eventDate: string;
  eventLocation?: string;
  inviteLink: string;
}

export const EventInviteEmail = ({
  userFirstName,
  inviterName,
  eventName,
  eventDate,
  eventLocation,
  inviteLink,
}: EventInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to {eventName} on Kick Back</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <img
              src={`${domain}/logo.png`}
              alt="Kick Back"
              width="120"
              height="120"
              style={logoStyle}
            />
          </Section>

          <Section>
            <Text style={text}>Hey {userFirstName ?? "there"},</Text>
            <Text style={text}>
              <strong>{inviterName}</strong> has invited you to attend{" "}
              <b>{eventName}</b> on <b>Kick Back</b>.
            </Text>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px 0",
              }}
            >
              <Text style={text}>
                <strong>Event Details:</strong>
              </Text>
              <Text style={text}>
                <strong>Date:</strong> {eventDate}
              </Text>
              {eventLocation && (
                <Text style={text}>
                  <strong>Location:</strong> {eventLocation}
                </Text>
              )}
            </div>

            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>

            <Text style={text}>
              If you can&apos;t make it, feel free to decline. This invite will
              expire soon.
            </Text>

            <Text style={text}>— The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EventInviteEmail;
