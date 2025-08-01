import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HelpHeader() {
  return (
    <div className="mb-12">
      <Button asChild variant="ghost" className="mb-6 -ml-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
      </div>

      <p className="text-xl text-muted-foreground max-w-3xl">
        Need help with Kick Back? Find answers to common questions and learn how
        to make the most of your event planning experience.
      </p>
    </div>
  );
}
