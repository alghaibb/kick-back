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
      <Preview>Verify your Kick Back account</Preview>
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
              Welcome to <b>Kick Back</b>! Use the OTP below to verify your
              account:
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
              If you did not sign up, you can safely ignore this email.
            </Text>

            <Text style={text}>— The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyAccount;
