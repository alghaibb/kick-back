/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface KickBackResendOTPEmailProps {
  userFirstname: string;
  otp: string;
}

export const ResendOTPEmail = ({
  userFirstname,
  otp,
}: KickBackResendOTPEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Resend OTP for your Kick Back account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={text}>Hello {userFirstname},</Text>
            <Text style={text}>
              You requested a new OTP for verifying your <b>Kick Back</b>{' '}
              account. Use the code below:
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
              This OTP will expire in <b>15 minutes</b>. If you did not request
              this, you can safely ignore this email.
            </Text>
            <Text style={text}>The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResendOTPEmail;

// Styles
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
