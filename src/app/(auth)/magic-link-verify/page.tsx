import { Spinner } from "@/components/ui/spinner";
import { Metadata } from "next";
import { Suspense } from "react";
import VerifyMagicLinkPage from "./VerifyMagicLinkPage";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyMagicLinkPage />
    </Suspense>
  );
}
