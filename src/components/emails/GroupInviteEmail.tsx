import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

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
          <Section>
            <Text style={text}>Hey {userFirstName ?? 'there'},</Text>
            <Text style={text}>
              <strong>{inviterName}</strong> has invited you to join the group{' '}
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

// Styles
const main = { backgroundColor: '#f8fafc', padding: '10px 0' };
const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  padding: '40px',
  borderRadius: '8px',
};
const text = {
  fontSize: '16px',
  fontFamily: "'Arial', sans-serif",
  color: '#374151',
  lineHeight: '24px',
};
const button = {
  backgroundColor: '#09090b',
  borderRadius: '6px',
  color: '#ffffff',
  fontFamily: "'Arial', sans-serif",
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
  margin: '20px auto',
};
