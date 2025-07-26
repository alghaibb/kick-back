import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Lock,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Kick Back collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="relative pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-12">
          <Button asChild variant="ghost" className="mb-6 -ml-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Privacy Policy
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl">
            Your privacy matters to us. This policy explains how Kick Back
            collects, uses, and protects your personal information.
          </p>

          <p className="text-sm text-muted-foreground mt-4">
            <strong>Last updated:</strong>{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Information We Collect */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Information We Collect
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Account Information
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Name (first name, last name, nickname)</li>
                    <li>• Email address</li>
                    <li>• Phone number (optional, for SMS reminders)</li>
                    <li>• Profile picture (optional)</li>
                    <li>
                      • Password (securely hashed, never stored in plain text)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Usage Information
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Events you create, attend, or are invited to</li>
                    <li>• Groups you join or create</li>
                    <li>• RSVP responses and attendance status</li>
                    <li>• Reminder preferences and timezone settings</li>
                    <li>• Communication preferences (email/SMS/both)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Technical Information
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Session data and authentication tokens</li>
                    <li>• IP address (for rate limiting and security)</li>
                    <li>• Device and browser information</li>
                    <li>• Usage patterns and timestamps</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Social Login Data
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    When you sign in with Google or Facebook, we receive:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • Basic profile information (name, email, profile picture)
                    </li>
                    <li>• Account verification status</li>
                    <li>
                      • We do not access your social media posts or contacts
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  How We Use Your Information
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Core Services</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Manage your events and groups</li>
                    <li>• Send invitations to group members</li>
                    <li>• Process RSVP responses</li>
                    <li>• Display upcoming events in your timezone</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Communications</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Send event reminders (email/SMS)</li>
                    <li>• Deliver group invitations</li>
                    <li>• Account verification and password resets</li>
                    <li>• Important service updates</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Security & Quality
                  </h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Prevent fraud and abuse</li>
                    <li>• Ensure account security</li>
                    <li>• Improve our services</li>
                    <li>• Provide technical support</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Legal Compliance</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Comply with applicable laws</li>
                    <li>• Respond to legal requests</li>
                    <li>• Protect our rights and users</li>
                    <li>• Enforce our terms of service</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  How We Share Your Information
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">With Other Users</h3>
                  <p className="text-muted-foreground mb-3">
                    When you join groups or attend events, other group members
                    can see:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Your name and profile picture</li>
                    <li>• Your RSVP status for group events</li>
                    <li>• Your role in the group</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    With Service Providers
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    We share limited data with trusted third-party services:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <strong className="text-foreground">Resend</strong>
                      <p className="text-sm text-muted-foreground">
                        Email delivery for reminders and invitations
                      </p>
                    </div>
                    <div>
                      <strong className="text-foreground">Twilio</strong>
                      <p className="text-sm text-muted-foreground">
                        SMS reminders (only if you opt in)
                      </p>
                    </div>
                    <div>
                      <strong className="text-foreground">Vercel</strong>
                      <p className="text-sm text-muted-foreground">
                        Hosting and file storage for profile images
                      </p>
                    </div>
                    <div>
                      <strong className="text-foreground">Neon Database</strong>
                      <p className="text-sm text-muted-foreground">
                        Secure database hosting
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-medium mb-2 text-green-900 dark:text-green-100">
                    What We Never Do
                  </h3>
                  <ul className="text-green-800 dark:text-green-200 space-y-1">
                    <li>• We never sell your personal information</li>
                    <li>• We never share data with advertisers</li>
                    <li>
                      • We never use your data for marketing to third parties
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Your Privacy Rights</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">Access Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      View and download all personal information we have about
                      you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">Correct Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Update or correct any inaccurate personal information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">Delete Your Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">Data Portability</h3>
                    <p className="text-sm text-muted-foreground">
                      Export your data in a portable format.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">Notification Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Opt out of SMS/email reminders anytime in settings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">Contact Us</h3>
                    <p className="text-sm text-muted-foreground">
                      Reach out for any privacy-related questions or requests.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Data Security & Retention
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    How We Protect Your Data
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• All data is encrypted in transit and at rest</li>
                    <li>
                      • Passwords are securely hashed using industry standards
                    </li>
                    <li>• Regular security updates and monitoring</li>
                    <li>• Limited access to personal data by our team</li>
                    <li>• Secure hosting with enterprise-grade providers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Data Retention</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Account data: Kept while your account is active</li>
                    <li>
                      • Event data: Kept for historical purposes unless deleted
                    </li>
                    <li>• Session data: Automatically expired after 30 days</li>
                    <li>
                      • Verification tokens: Automatically expired after use
                    </li>
                    <li>
                      • Deleted accounts: Permanently removed within 30 days
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Updates */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Contact Us & Updates</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Questions or Concerns?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about this privacy policy or how
                    we handle your data, please contact us through your account
                    settings or by visiting our dashboard.
                  </p>

                  <div className="flex gap-3">
                    <Button asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/settings">Privacy Settings</Link>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Policy Updates</h3>
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. When we
                    do, we&apos;ll notify you through the app and update the
                    &quot;Last updated&quot; date at the top of this page. Your
                    continued use of Kick Back after any changes constitutes
                    acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            This privacy policy is effective as of{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            and applies to your use of Kick Back.
          </p>
        </div>
      </div>
    </div>
  );
}
