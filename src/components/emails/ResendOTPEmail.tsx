import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import {
  container,
  domain,
  headerSection,
  logoStyle,
  main,
  text,
} from './styles/sharedEmailStyles';

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
      <Preview>Your Kick Back OTP code (resend)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <img
              src={`${domain}/logo.png`}
              alt="Kick Back"
              width="80"
              style={logoStyle}
            />
          </Section>

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

            <Text style={text}>— The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResendOTPEmail;
