import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Sessions",
  description: "Manage and review user sessions",
};

export default function AdminSessionsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <LogOut className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Sessions</h1>
                <p className="text-sm text-muted-foreground">Revoke user sessions from the users list.</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to revoke</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Open <Link href="/admin/users" className="underline">Admin &rarr; Users</Link>, click the menu for a user, then choose "Revoke Sessions".
              This signs them out on all devices. Their account remains active.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


