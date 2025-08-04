import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Preview,
} from "@react-email/components";
import {
  main,
  container,
  headerSection,
  logoStyle,
  text,
} from "./styles/sharedEmailStyles";
import { env } from "@/lib/env";
const domain = env.NEXT_PUBLIC_BASE_URL;

interface ContactReplyEmailProps {
  userFirstName: string;
  originalSubject: string;
  originalMessage: string;
  adminReply: string;
  adminName: string;
}

export const ContactReplyEmail = ({
  userFirstName,
  originalSubject,
  originalMessage,
  adminReply,
  adminName,
}: ContactReplyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Response to your contact message: {originalSubject}</Preview>
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
            <Text style={text}>Hello {userFirstName},</Text>
            <Text style={text}>
              Thank you for reaching out to us. We&apos;ve received your message
              and would like to respond.
            </Text>

            <Text style={text}>
              <strong>Your original message:</strong>
            </Text>
            <Text style={text}>
              <strong>Subject:</strong> {originalSubject}
            </Text>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px 0",
                fontStyle: "italic",
                color: "#6c757d",
              }}
            >
              <Text style={text}>{originalMessage}</Text>
            </div>

            <Text style={text}>
              <strong>Our response:</strong>
            </Text>
            <div
              style={{
                backgroundColor: "#e3f2fd",
                border: "1px solid #bbdefb",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px 0",
                color: "#1976d2",
              }}
            >
              <Text style={text}>{adminReply}</Text>
            </div>

            <Text style={text}>
              If you have any further questions, please don&apos;t hesitate to
              contact us again.
            </Text>

            <Text style={text}>
              Best regards,
              <br />
              {adminName}
              <br />— The Kick Back Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactReplyEmail;
