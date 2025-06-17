/* eslint-disable @typescript-eslint/no-unused-vars */
import { env } from "@/env";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface KickBackResetPasswordEmailProps {
  userFirstName?: string;
  resetPasswordLink: string;
}

export const ResetPasswordEmail = ({
  userFirstName,
  resetPasswordLink,
}: KickBackResetPasswordEmailProps) => {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL
    ? `https://${env.NEXT_PUBLIC_BASE_URL}`
    : "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>Reset Your Kick Back Password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={text}>Hello {userFirstName ?? "there"},</Text>
            <Text style={text}>
              We received a request to reset your password for your{" "}
              <b>Kick Back</b>
              account. If this was you, click the button below to reset your
              password:
            </Text>

            <Button style={button} href={resetPasswordLink}>
              Reset Password
            </Button>

            <Text style={text}>
              If you <b>did not request a password reset</b>, you can safely
              ignore this email. Your account is still secure.
            </Text>

            <Text style={text}>The Kick Back Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

// Styles
const main = {
  backgroundColor: "#f8fafc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  padding: "40px",
  borderRadius: "8px",
};

const text = {
  fontSize: "16px",
  fontFamily: "'Arial', sans-serif",
  color: "#374151",
  lineHeight: "24px",
};

const button = {
  backgroundColor: "#09090b",
  borderRadius: "6px",
  color: "#ffffff",
  fontFamily: "'Arial', sans-serif",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "20px auto",
};

const anchor = {
  color: "#1d4ed8",
  textDecoration: "underline",
};

const logo = {
  display: "block",
  margin: "0 auto 20px",
};