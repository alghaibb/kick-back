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

interface GroupInviteEmailProps {
  userFirstName?: string;
  inviterName: string;
  groupName: string;
  inviteLink: string;
}

export const GroupInviteEmail = ({
  userFirstName,
  inviterName,
  groupName,
  inviteLink,
}: GroupInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You&apos;ve been invited to join {groupName} on Kick Back
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <strong>{inviterName}</strong> has invited you to join the group{" "}
              <b>{groupName}</b> on <b>Kick Back</b>.
            </Text>

            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>

            <Text style={text}>
              If you don&apos;t want to join, feel free to ignore this email.
              This invite will expire soon.
            </Text>

            <Text style={text}>The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default GroupInviteEmail;
