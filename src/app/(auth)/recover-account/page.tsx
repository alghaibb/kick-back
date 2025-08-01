import { Metadata } from "next";
import { RecoverAccountClient } from "./_components/RecoverAccountClient";

export const metadata: Metadata = {
  title: "Recover Account | Kick Back",
  description: "Recover your deleted account within 30 days",
  openGraph: {
    title: "Recover Account | Kick Back",
    description: "Recover your deleted account within 30 days",
  },
};

export default function RecoverAccountPage() {
  return <RecoverAccountClient />;
}
