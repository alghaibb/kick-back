import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacySecurity() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Privacy & Security</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Your Privacy</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• We never sell your personal information</li>
              <li>• Your data is encrypted and secure</li>
              <li>• You control who sees your information</li>
              <li>• Delete your account anytime</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Account Security</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Use strong, unique passwords</li>
              <li>• Enable two-factor authentication</li>
              <li>• Keep your login credentials private</li>
              <li>• Log out from shared devices</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/privacy">Read Privacy Policy</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
