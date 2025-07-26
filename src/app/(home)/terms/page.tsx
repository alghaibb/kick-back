import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Shield,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Kick Back",
  description:
    "Terms and conditions for using Kick Back's event management platform.",
};

export default function TermsPage() {
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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Terms of Service
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl">
            These terms govern your use of Kick Back and outline the rights and
            responsibilities of all users.
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
          {/* Agreement to Terms */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Agreement to Terms</h2>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing and using Kick Back, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do
                  not agree to abide by the above, please do not use this
                  service.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                    Key Points:
                  </h3>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• You must be 13 years or older to use Kick Back</li>
                    <li>
                      • You&apos;re responsible for maintaining account security
                    </li>
                    <li>• These terms may be updated from time to time</li>
                    <li>• Continued use means acceptance of updated terms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Responsibilities */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Account Responsibilities
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Account Security</h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • You are responsible for maintaining the confidentiality
                      of your account credentials
                    </li>
                    <li>
                      • You must notify us immediately of any unauthorized
                      access to your account
                    </li>
                    <li>
                      • We are not liable for any loss resulting from your
                      failure to protect your account
                    </li>
                    <li>
                      • You may not share your account with others or create
                      multiple accounts
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Accurate Information
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • You must provide accurate and complete registration
                      information
                    </li>
                    <li>• You must keep your profile information up to date</li>
                    <li>
                      • You must not impersonate others or provide false
                      information
                    </li>
                    <li>
                      • Phone numbers and email addresses must be valid and
                      belong to you
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Age Requirements</h3>
                  <p className="text-muted-foreground ml-6">
                    You must be at least 13 years old to use Kick Back. Users
                    under 18 should have parental consent for creating accounts
                    and participating in events.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Acceptable Use Policy
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    What You Can Do
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Create and manage events and groups</li>
                    <li>• Invite friends and family to your events</li>
                    <li>• Share event information with other users</li>
                    <li>
                      • Use the service for personal, non-commercial purposes
                    </li>
                    <li>• Provide feedback to improve the service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Prohibited Activities
                  </h3>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-900 dark:text-red-100 font-medium mb-3">
                      You may NOT use Kick Back to:
                    </p>
                    <ul className="text-red-800 dark:text-red-200 space-y-2 text-sm">
                      <li>
                        • Create events for illegal activities or harassment
                      </li>
                      <li>
                        • Send spam invitations or unwanted communications
                      </li>
                      <li>
                        • Share inappropriate, offensive, or harmful content
                      </li>
                      <li>
                        • Violate others' privacy or collect personal
                        information
                      </li>
                      <li>
                        • Use the service for commercial purposes without
                        permission
                      </li>
                      <li>
                        • Attempt to hack, disrupt, or reverse engineer the
                        service
                      </li>
                      <li>• Create fake accounts or impersonate others</li>
                      <li>• Share copyrighted content without permission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Guidelines */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Content Guidelines</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Event & Group Content
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    When creating events and groups, you&apos;re responsible for
                    ensuring all content is:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Accurate and truthful</li>
                    <li>
                      • Appropriate for all ages (unless clearly marked
                      otherwise)
                    </li>
                    <li>• Respectful of others&apos; rights and privacy</li>
                    <li>• Free of discriminatory or hateful language</li>
                    <li>• Compliant with local laws and regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    User-Generated Content
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    By posting content on Kick Back, you grant us the right to:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • Display your content to other users as intended by the
                      service
                    </li>
                    <li>
                      • Store and process your content to provide the service
                    </li>
                    <li>• Remove content that violates these terms</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    You retain ownership of your content and can delete it at
                    any time.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Content Moderation
                  </h3>
                  <p className="text-muted-foreground">
                    We reserve the right to review and remove content that
                    violates these guidelines. Repeated violations may result in
                    account suspension or termination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Service Availability & Support
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Service Reliability
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • We strive to maintain 99.9% uptime but cannot guarantee
                      uninterrupted service
                    </li>
                    <li>
                      • Planned maintenance will be announced in advance when
                      possible
                    </li>
                    <li>
                      • We are not liable for service interruptions beyond our
                      control
                    </li>
                    <li>
                      • Critical reminders and notifications are sent with best
                      effort delivery
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Feature Changes</h3>
                  <p className="text-muted-foreground">
                    We may add, modify, or remove features at any time to
                    improve the service. Major changes will be communicated to
                    users when possible.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Data Backup</h3>
                  <p className="text-muted-foreground">
                    While we maintain regular backups, you&apos;re responsible
                    for keeping your own copies of important event information
                    and contact details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication & Notifications */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Communications & Notifications
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Consent to Communications
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    By using Kick Back, you consent to receive:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • Event reminders via email and/or SMS (based on your
                      preferences)
                    </li>
                    <li>• Group invitations from other users</li>
                    <li>
                      • Important service updates and security notifications
                    </li>
                    <li>• Account verification and password reset messages</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Opt-Out Rights</h3>
                  <p className="text-muted-foreground">
                    You can modify your notification preferences or opt out of
                    non-essential communications at any time through your
                    account settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    SMS & Carrier Charges
                  </h3>
                  <p className="text-muted-foreground">
                    Standard message and data rates may apply for SMS
                    notifications. Check with your mobile carrier for details
                    about your plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Limitation of Liability
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Service Disclaimer
                  </h3>
                  <p className="text-muted-foreground">
                    Kick Back is provided &quot;as is&quot; without warranties
                    of any kind. We make no guarantees about the accuracy,
                    reliability, or availability of the service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    User Responsibility
                  </h3>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>
                      • You are responsible for verifying event details and
                      locations
                    </li>
                    <li>• We are not liable for events organized by users</li>
                    <li>• Users interact with each other at their own risk</li>
                    <li>
                      • We do not guarantee the accuracy of user-provided
                      information
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Damages</h3>
                  <p className="text-muted-foreground">
                    Our liability is limited to the maximum extent permitted by
                    law. We are not liable for indirect, incidental, or
                    consequential damages arising from your use of the service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Account Termination</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Your Right to Terminate
                  </h3>
                  <p className="text-muted-foreground">
                    You may delete your account at any time through your account
                    settings. Upon deletion, your personal data will be removed
                    according to our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Our Right to Terminate
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    We may suspend or terminate your account if you:
                  </p>
                  <ul className="text-muted-foreground space-y-2 ml-6">
                    <li>• Violate these terms of service</li>
                    <li>• Engage in harmful or illegal activities</li>
                    <li>• Abuse other users or the service</li>
                    <li>
                      • Create multiple accounts to circumvent restrictions
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Effect of Termination
                  </h3>
                  <p className="text-muted-foreground">
                    Upon termination, your access to the service will cease
                    immediately. Events you created may be transferred to other
                    organizers or deleted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Changes */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">
                  Contact & Terms Updates
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Questions About These Terms
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions about these Terms of Service,
                    please contact us through your account dashboard or settings
                    page.
                  </p>

                  <div className="flex gap-3">
                    <Button asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/privacy">Privacy Policy</Link>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Changes to Terms</h3>
                  <p className="text-muted-foreground">
                    We may update these terms from time to time. When we make
                    material changes, we&apos;ll notify you through the app and
                    update the &quot;Last updated&quot; date above. Your
                    continued use after changes constitutes acceptance of the
                    new terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Governing Law</h3>
                  <p className="text-muted-foreground">
                    These terms are governed by the laws of the jurisdiction
                    where our service is operated. Any disputes will be resolved
                    in the appropriate courts of that jurisdiction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            These terms of service are effective as of{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            and apply to your use of Kick Back.
          </p>
        </div>
      </div>
    </div>
  );
}
