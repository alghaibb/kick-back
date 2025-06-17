import VerifyAccountPage from "./VerifyAccountPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account",
};

export default function Page() {
  return <VerifyAccountPage />;
}