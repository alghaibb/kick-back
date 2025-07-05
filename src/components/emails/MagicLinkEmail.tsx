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

interface KickBackMagicLinkEmailProps {
  userFirstName?: string;
  magicLink: string;
}

export const MagicLinkEmail = ({
  userFirstName,
  magicLink,
}: KickBackMagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sign in to Kick Back securely with your magic link</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <img src={`${domain}/logo.png`} alt="Kick Back" width="80" style={logoStyle} />
          </Section>

          <Section>
            <Text style={text}>Hello {userFirstName ?? 'there'},</Text>
            <Text style={text}>
              Click the button below to securely sign in to your <b>Kick Back</b> account:
            </Text>

            <Button style={button} href={magicLink}>
              Sign In with Magic Link
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

export default MagicLinkEmail;
