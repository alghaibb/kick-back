import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface KickBackVerifyAccountProps {
  userFirstname: string;
  otp: string;
}
export const VerifyAccount = ({
  userFirstname,
  otp,
}: KickBackVerifyAccountProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify Your Kick Back Account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={text}>Hello {userFirstname},</Text>
            <Text style={text}>
              Welcome to <b>Kick Back</b>! To complete your registration and
              activate your account, please verify your email using the OTP
              below:
            </Text>
            <Text
              style={{
                ...text,
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {otp}
            </Text>
            <Text style={text}>
              If you did not sign up for an Kick Back account, you can safely
              ignore this email.
            </Text>
            <Text style={text}>The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyAccount;

const main = {
  backgroundColor: '#f8fafc',
  padding: '10px 0',
};

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
