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
import {
  main,
  container,
  text,
  button,
  headerSection,
  logoStyle,
  domain,
} from './styles/sharedEmailStyles';

interface KickBackResetPasswordEmailProps {
  userFirstName?: string;
  resetPasswordLink: string;
}

export const ResetPasswordEmail = ({ userFirstName, resetPasswordLink }: KickBackResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Kick Back password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <img src={`${domain}/logo.png`} alt="Kick Back" width="80" style={logoStyle} />
          </Section>

          <Section>
            <Text style={text}>Hello {userFirstName ?? 'there'},</Text>
            <Text style={text}>
              We received a request to reset your <b>Kick Back</b> password. Click the button below:
            </Text>

            <Button style={button} href={resetPasswordLink}>
              Reset Password
            </Button>

            <Text style={text}>
              If you <b>did not request this</b>, you can safely ignore this email.
            </Text>

            <Text style={text}>— The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;
